import cache from '@actions/cache';
import core from '@actions/core';
import io from '@actions/io';
import exec from '@actions/exec';
import tc from '@actions/tool-cache';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import process from 'node:process';
import { hashElement } from 'folder-hash';

// XXX: hack to make ncc copy those files to dist
// eslint-disable-next-line
function dummy() {
    return [__dirname + '/action.yml', __dirname + '/README.md'];
}

const INSTALLER_VERSION = '2024-11-16';
const INSTALLER_URL = `https://github.com/msys2/msys2-installer/releases/download/${INSTALLER_VERSION}/msys2-base-x86_64-${INSTALLER_VERSION.replace(/-/g, '')}.sfx.exe`;
const INSTALLER_CHECKSUM = 'e1347944b799ce0ebef62eeb779b95c87c954f4e52bad86752181b8abef98b21';
// see https://github.com/msys2/setup-msys2/issues/61
const INSTALL_CACHE_ENABLED = false;
const CACHE_FLUSH_COUNTER = 0;

class Input {

    constructor() {
        /** @type {boolean} */
        this.release;
        /** @type {boolean} */
        this.update;
        /** @type {string} */
        this.pathtype;
        /** @type {string} */
        this.msystem;
        /** @type {string[]} */
        this.install;
        /** @type {string[]} */
        this.pacboy;
        /** @type {string} */
        this.platformcheckseverity;
        /** @type {string} */
        this.location;
        /** @type {boolean} */
        this.cache;
    }
}

/**
 * @returns {Input}
 */
function parseInput() {
  let p_release = core.getBooleanInput('release');
  let p_update = core.getBooleanInput('update');
  let p_pathtype = core.getInput('path-type');
  let p_msystem = core.getInput('msystem');
  let p_install = core.getInput('install');
  let p_pacboy = core.getInput('pacboy');
  let p_platformcheckseverity = core.getInput('platform-check-severity');
  let p_location = core.getInput('location');
  let p_cache = core.getBooleanInput('cache');

  const msystem_allowed = ['MSYS', 'MINGW32', 'MINGW64', 'UCRT64', 'CLANG32', 'CLANG64', 'CLANGARM64'];
  if (!msystem_allowed.includes(p_msystem.toUpperCase())) {
    throw new Error(`'msystem' needs to be one of ${ msystem_allowed.join(', ') }, got ${p_msystem}`);
  }
  p_msystem = p_msystem.toUpperCase()

  let p_install_list = (p_install === 'false') ? [] : p_install.split(/\s+/);
  let p_pacboy_list = (p_pacboy === 'false') ? [] : p_pacboy.split(/\s+/);

  const platformcheckseverity_allowed = ['fatal', 'warn'];
  if (!platformcheckseverity_allowed.includes(p_platformcheckseverity)) {
    throw new Error(`'platform-check-severity' needs to be one of ${ platformcheckseverity_allowed.join(', ') }, got ${p_platformcheckseverity}`);
  }

  if ( process.platform === 'win32' && (p_location === 'C:\\' || p_location === 'C:') ) {
    throw new Error(`'location' cannot be 'C:' because that contains the built-in MSYS2 installation
      in GitHub Actions environments. See option 'release', in order to use that installation:
      https://github.com/msys2/setup-msys2#release`);
  }

  let input = new Input();
  input.release = p_release;
  input.update = p_update;
  input.pathtype = p_pathtype;
  input.msystem = p_msystem;
  input.install = p_install_list;
  input.pacboy = p_pacboy_list;
  input.platformcheckseverity = p_platformcheckseverity;
  input.location = (p_location == "RUNNER_TEMP") ? process.env['RUNNER_TEMP'] : p_location;
  input.cache = p_cache;

  return input;
}

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function computeChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => {
      hash.update(data);
    });
    stream.on('end', () => {
      const fileHash = hash.digest('hex');
      resolve(fileHash);
    });
    stream.on('error', error => {
      reject(error);
    });
  });
}

/**
 * @returns {Promise<string>}
 */
async function downloadInstaller() {
  // We use the last field only, so that each version is ensured semver incompatible with the previous one.
  const version = `0.0.${INSTALLER_VERSION.replace(/-/g, '')}`
  const inst_path = tc.find('msys2-installer', version, 'x64');
  const destination = inst_path ? path.join(inst_path, 'base.exe') : await tc.downloadTool(INSTALLER_URL);
  let computedChecksum = await computeChecksum(destination);
  if (computedChecksum.toUpperCase() !== INSTALLER_CHECKSUM.toUpperCase()) {
    throw new Error(`The SHA256 of the installer does not match! expected ${INSTALLER_CHECKSUM} got ${computedChecksum}`);
  }
  return path.join(inst_path || await tc.cacheFile(destination, 'base.exe', 'msys2-installer', version, 'x64'), 'base.exe');
}

/**
 * @param {string} msysRootDir
 * @returns {Promise<void>}
 */
async function disableKeyRefresh(msysRootDir) {
  const postFile = path.join(msysRootDir, 'etc\\post-install\\07-pacman-key.post');
  const content = await fs.promises.readFile(postFile, 'utf8');
  const newContent = content.replace('--refresh-keys', '--version');
  await fs.promises.writeFile(postFile, newContent, 'utf8');
}

/**
 * @param {string[]} paths
 * @param {string} restoreKey
 * @param {string} saveKey
 * @returns {Promise<number|undefined>}
 */
async function saveCacheMaybe(paths, restoreKey, saveKey) {
    if (restoreKey === saveKey) {
        console.log(`Cache unchanged, skipping save for ${saveKey}`);
        return;
    }

    let cacheId;
    try {
        cacheId = await cache.saveCache(paths, saveKey);
    } catch (error) {
        // In case we try to save a cache for a key that already exists we'll get an error.
        // This usually happens because something created the same cache while we were running.
        // Since the cache is already there now this is fine with us.
        console.log(error.message);
    }

    if (cacheId !== undefined) {
      console.log(`Cache saved as ID ${cacheId} using key ${saveKey}`);
    }

    return cacheId;
}

/**
 * @param {string[]} paths
 * @param {string} primaryKey
 * @param {string[]} restoreKeys
 * @returns {Promise<string|undefined>}
 */
async function restoreCache(paths, primaryKey, restoreKeys) {
    let restoreKey;
    try {
        restoreKey = await cache.restoreCache(paths, primaryKey, restoreKeys);
        console.log(`Cache restore for ${primaryKey}, got ${restoreKey}`);
    } catch (error) {
        core.warning(`Restore cache failed: ${error.message}`);
    } finally {
        console.log(`Cache restore for ${primaryKey}, got ${restoreKey}`);
    }

    return restoreKey;
}

/**
 * @param {string} path
 * @returns {Promise<string>}
 */
async function hashPath(path) {
  return (await hashElement(path, {encoding: 'hex'}))['hash'].toString();
}

class PackageCache {

  /**
   * @param {string} msysRootDir
   * @param {Input} input
   */
  constructor(msysRootDir, input) {
    // We include "update" in the fallback key so that a job run with update=false never fetches
    // a cache created with update=true. Because this would mean a newer version than needed is in the cache
    // which would never be used but also would win during cache prunging because it is newer.
    this.fallbackCacheKey = 'msys2-pkgs-upd:' + input.update.toString();

    // We want a cache key that is ideally always the same for the same kind of job.
    // So that mingw32 and ming64 jobs, and jobs with different install packages have different caches.
    let shasum = crypto.createHash('sha1');
    shasum.update([CACHE_FLUSH_COUNTER, input.release, input.update, input.pathtype, input.msystem, input.install].toString() + INSTALLER_CHECKSUM);
    this.jobCacheKey = this.fallbackCacheKey + '-conf:' + shasum.digest('hex').slice(0, 8);

    this.restoreKey = undefined;
    this.pkgCachePath = path.join(msysRootDir, 'var', 'cache', 'pacman', 'pkg');
  }

  async restore() {
    // We ideally want a cache matching our configuration, but every cache is OK since we prune it later anyway
    this.restoreKey = await restoreCache([this.pkgCachePath], this.jobCacheKey, [this.jobCacheKey, this.fallbackCacheKey]);
    return (this.restoreKey !== undefined)
  }

  async save() {
    const saveKey = this.jobCacheKey + '-files:' + await hashPath(this.pkgCachePath);
    const cacheId = await saveCacheMaybe([this.pkgCachePath], this.restoreKey, saveKey);
    return (cacheId !== undefined);
  }

  async prune() {
    // Remove all uninstalled packages
    await runMsys(['paccache', '-r', '-f', '-u', '-k0']);
    // Keep the newest for all other packages
    await runMsys(['paccache', '-r', '-f', '-k1']);
  }

  async clear() {
    // Remove all cached packages
    await pacman(['-Scc']);
  }
}

class InstallCache {

  /**
   * @param {string} msysRootDir
   * @param {Input} input
   */
  constructor(msysRootDir, input) {
    let shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(input) + INSTALLER_CHECKSUM);
    this.jobCacheKey = 'msys2-inst-conf:' + shasum.digest('hex');
    this.msysRootDir = msysRootDir
  }

  async restore() {
    // We only want a cache which matches our configuration
    this.restoreKey = await restoreCache([this.msysRootDir], this.jobCacheKey, [this.jobCacheKey]);
    return (this.restoreKey !== undefined)
  }

  async save() {
    // In cases any of the installed packages have changed we get something new here
    const pacmanStateDir = path.join(this.msysRootDir, 'var', 'lib', 'pacman', 'local');
    const saveKey = this.jobCacheKey + '-state:' + await hashPath(pacmanStateDir);
    const cacheId = await saveCacheMaybe([this.msysRootDir], this.restoreKey, saveKey);
    return (cacheId !== undefined);
  }
}

let cmd = null;

/**
 * @param {string} msysRootDir
 * @param {string} msystem
 * @param {string} pathtype
 * @param {string} destDir
 * @param {string} name
 */
async function writeWrapper(msysRootDir, msystem, pathtype, destDir, name) {
  let wrap = [
    `@echo off`,
    `setlocal`,
    `IF NOT DEFINED MSYSTEM set MSYSTEM=` + msystem,
    `IF NOT DEFINED MSYS2_PATH_TYPE set MSYS2_PATH_TYPE=` + pathtype,
    `set CHERE_INVOKING=1`,
    msysRootDir + `\\usr\\bin\\bash.exe -leo pipefail %*`
  ].join('\r\n');

  cmd = path.join(destDir, name);
  fs.writeFileSync(cmd, wrap);
}

/**
 * @param {string[]} args
 * @param {object} opts
 */
async function runMsys(args, opts) {
  assert.ok(cmd);
  const quotedArgs = args.map((arg) => {return `'${arg.replace(/'/g, `'\\''`)}'`}); // fix confused vim syntax highlighting with: `
  await exec.exec('cmd', ['/D', '/S', '/C', cmd].concat(['-c', quotedArgs.join(' ')]), opts);
}

/**
 * @param {string[]} args
 * @param {object} opts
 * @param {string} [cmd]
 */
async function pacman(args, opts, cmd) {
  await runMsys([cmd ? cmd : 'pacman', '--noconfirm'].concat(args), opts);
}

/**
 * @returns {Promise<void>}
 */
async function run() {
  try {
    const input = parseInput();

    if (process.platform !== 'win32') {
      const msg = "MSYS2 does not work on non-windows platforms; please check the 'runs-on' field of the job"
      if (input.platformcheckseverity === 'fatal') {
        core.setFailed(msg);
      } else {
        console.log(msg);
      }
      return;
    }

    const tmp_dir = process.env['RUNNER_TEMP'];
    if (!tmp_dir) {
      core.setFailed('environment variable RUNNER_TEMP is undefined');
      return;
    }

    let cachedInstall = false;
    let instCache = null;
    let msysRootDir = path.join('C:', 'msys64');
    if (input.release) {
      // Use upstream package instead of the default installation in the virtual environment.
      let dest = (input.location) ? input.location : tmp_dir;
      msysRootDir = path.join(dest, 'msys64');
      await io.mkdirP(msysRootDir);
      if (INSTALL_CACHE_ENABLED) {
        instCache = new InstallCache(msysRootDir, input);
        core.startGroup('Restoring environment...');
        cachedInstall = await instCache.restore();
        core.endGroup();
      }
      if (!cachedInstall) {
        core.startGroup('Downloading MSYS2...');
        let inst_dest = await downloadInstaller();
        core.endGroup();

        core.startGroup('Extracting MSYS2...');
        await exec.exec(inst_dest, ['-y'], {cwd: dest});
        core.endGroup();

        core.startGroup('Disable Key Refresh...');
        await disableKeyRefresh(msysRootDir);
        core.endGroup();
      }
    }

    const pathDir = path.join(tmp_dir, 'setup-msys2');
    await io.mkdirP(pathDir);
    writeWrapper(msysRootDir, input.msystem, input.pathtype, pathDir, 'msys2.cmd');
    core.addPath(pathDir);

    core.setOutput('msys2-location', msysRootDir);

    // XXX: ideally this should be removed, we don't want to pollute the user's environment
    core.exportVariable('MSYSTEM', input.msystem);

    const packageCache = input.cache ? new PackageCache(msysRootDir, input) : null;

    if (!cachedInstall) {
      if (packageCache !== null) {
        core.startGroup('Restoring package cache...');
        await packageCache.restore();
        core.endGroup();
      }

      core.startGroup('Starting MSYS2 for the first time...');
      await runMsys(['uname', '-a']);
      core.endGroup();
    }

    core.startGroup('Disable CheckSpace...');
    // Reduce time required to install packages by disabling pacman's disk space checking
    await runMsys(['sed', '-i', 's/^CheckSpace/#CheckSpace/g', '/etc/pacman.conf']);
    core.endGroup();

    if (input.update) {
      core.startGroup('Updating packages...');
      await pacman(['-Syuu', '--overwrite', '*'], {ignoreReturnCode: true});
      // We have changed /etc/pacman.conf above which means on a pacman upgrade
      // pacman.conf will be installed as pacman.conf.pacnew
      await runMsys(['mv', '-f', '/etc/pacman.conf.pacnew', '/etc/pacman.conf'], {ignoreReturnCode: true, silent: true});
      core.endGroup();

      core.startGroup('Killing remaining tasks...');
      await exec.exec('taskkill', ['/F', '/FI', 'MODULES eq msys-2.0.dll']);
      core.endGroup();

      core.startGroup('Final system upgrade...');
      await pacman(['-Syuu', '--overwrite', '*'], {});
      core.endGroup();
    }

    if (input.install.length) {
      core.startGroup('Installing additional packages through pacman...');
      await pacman(['-S', '--needed', '--overwrite', '*'].concat(
        (input.pacboy.length) ? input.install.concat(['pactoys']) : input.install
      ), {});
      core.endGroup();
    } else {
      if (input.pacboy.length) {
        core.startGroup('Installing pacboy...');
        await pacman(['-S', '--needed', '--overwrite', '*', 'pactoys'], {});
        core.endGroup();
      }
    }

    if (input.pacboy.length) {
      core.startGroup('Installing additional packages through pacboy...');
      await pacman(['-S', '--needed'].concat(input.pacboy), {}, 'pacboy');
      core.endGroup();
    }

    if (!cachedInstall && packageCache !== null) {
      core.startGroup('Saving package cache...');
      await packageCache.prune();
      await packageCache.save();
      await packageCache.clear();
      core.endGroup();
    }

    if (instCache !== null) {
      core.startGroup('Saving environment...');
      if (packageCache !== null) {
        await packageCache.clear();
      }
      await instCache.save();
      core.endGroup();
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}


await run();

// https://github.com/actions/toolkit/issues/1578#issuecomment-1879770064
process.exit();
