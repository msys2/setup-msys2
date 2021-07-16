const cache = require('@actions/cache');
const core = require('@actions/core');
const io = require('@actions/io');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const assert = require('assert').strict;
const { hashElement } = require('folder-hash');

const inst_version = '2021-06-04';
const inst_url = `https://github.com/msys2/msys2-installer/releases/download/${inst_version}/msys2-base-x86_64-${inst_version.replace(/-/g, '')}.sfx.exe`;
const checksum = '2d7bdb926239ec2afaca8f9b506b34638c3cd5d18ee0f5d8cd6525bf80fcab5d';
// see https://github.com/msys2/setup-msys2/issues/61
const INSTALL_CACHE_ENABLED = false;
const CACHE_FLUSH_COUNTER = 0;

function changeGroup(str) {
  core.endGroup();
  core.startGroup(str);
}

function parseInput() {
  let p_release = core.getInput('release') === 'true';
  let p_update = core.getInput('update') === 'true';
  let p_pathtype = core.getInput('path-type');
  let p_msystem = core.getInput('msystem');
  let p_install = core.getInput('install');

  const msystem_allowed = ['MSYS', 'MINGW32', 'MINGW64', 'UCRT64', 'CLANG32', 'CLANG64'];
  if (!msystem_allowed.includes(p_msystem.toUpperCase())) {
    throw new Error(`'msystem' needs to be one of ${ msystem_allowed.join(', ') }, got ${p_msystem}`);
  }
  p_msystem = p_msystem.toUpperCase()

  p_install = (p_install === 'false') ? [] : p_install.split(/\s+/);

  return {
    release: p_release,
    update: p_update,
    pathtype: p_pathtype,
    msystem: p_msystem,
    install: p_install,
  }
}

async function downloadInstaller() {
  // We use the last field only, so that each version is ensured semver incompatible with the previous one.
  const version = `0.0.${inst_version.replace(/-/g, '')}`
  const inst_path = tc.find('msys2-installer', version, 'x64');
  const destination = inst_path ? path.join(inst_path, 'base.exe') : await tc.downloadTool(inst_url);
  let computedChecksum = '';
  await exec.exec(`powershell.exe`, [`(Get-FileHash ${destination} -Algorithm SHA256)[0].Hash`], {listeners: {stdout: (data) => { computedChecksum += data.toString(); }}});
  if (computedChecksum.slice(0, -2).toUpperCase() !== checksum.toUpperCase()) {
    throw new Error(`The SHA256 of the installer does not match! expected ${checksum} got ${computedChecksum}`);
  }
  return path.join(inst_path || await tc.cacheFile(destination, 'base.exe', 'msys2-installer', version, 'x64'), 'base.exe');
}

async function disableKeyRefresh(msysRootDir) {
  const postFile = path.join(msysRootDir, 'etc\\post-install\\07-pacman-key.post');
  await exec.exec(`powershell.exe`, [`((Get-Content -path ${postFile} -Raw) -replace '--refresh-keys', '--version') | Set-Content -Path ${postFile}`]);
}

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

async function restoreCache(paths, primaryKey, restoreKeys) {
    const restoreKey = await cache.restoreCache(paths, primaryKey, restoreKeys);
    console.log(`Cache restore for ${primaryKey}, got ${restoreKey}`);
    return restoreKey;
}

async function hashPath(path) {
  return (await hashElement(path, {encoding: 'hex'}))['hash'].toString();
}

class PackageCache {

  constructor(msysRootDir, input) {
    // We include "update" in the fallback key so that a job run with update=false never fetches
    // a cache created with update=true. Because this would mean a newer version than needed is in the cache
    // which would never be used but also would win during cache prunging because it is newer.
    this.fallbackCacheKey = 'msys2-pkgs-upd:' + input.update.toString();

    // We want a cache key that is ideally always the same for the same kind of job.
    // So that mingw32 and ming64 jobs, and jobs with different install packages have different caches.
    let shasum = crypto.createHash('sha1');
    shasum.update([CACHE_FLUSH_COUNTER, input.release, input.update, input.pathtype, input.msystem, input.install].toString() + checksum);
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

  constructor(msysRootDir, input) {
    let shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(input) + checksum);
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

async function writeWrapper(msysRootDir, pathtype, destDir, name) {
  let wrap = [
    `@echo off`,
    `setlocal`,
    `IF NOT DEFINED MSYS2_PATH_TYPE set MSYS2_PATH_TYPE=` + pathtype,
    `set CHERE_INVOKING=1`,
    msysRootDir + `\\usr\\bin\\bash.exe -leo pipefail %*`
  ].join('\r\n');

  cmd = path.join(destDir, name);
  fs.writeFileSync(cmd, wrap);
}

async function runMsys(args, opts) {
  assert.ok(cmd);
  const quotedArgs = args.map((arg) => {return `'${arg.replace(/'/g, `'\\''`)}'`}); // fix confused vim syntax highlighting with: `
  await exec.exec('cmd', ['/D', '/S', '/C', cmd].concat(['-c', quotedArgs.join(' ')]), opts);
}

async function pacman(args, opts) {
  await runMsys(['pacman', '--noconfirm'].concat(args), opts);
}

async function run() {
  try {
    if (process.platform !== 'win32') {
      core.setFailed("MSYS2 does not work on non-windows platforms; please check the 'runs-on' field of the job");
      return;
    }

    const tmp_dir = process.env['RUNNER_TEMP'];
    if (!tmp_dir) {
      core.setFailed('environment variable RUNNER_TEMP is undefined');
      return;
    }

    const input = parseInput();

    const dest = path.join(tmp_dir, 'msys');
    await io.mkdirP(dest);

    let cachedInstall = false;
    let instCache = null;
    let msysRootDir = path.join('C:', 'msys64');
    if (input.release) {
      // Use upstream package instead of the default installation in the virtual environment.
      msysRootDir = path.join(dest, 'msys64');

      if (INSTALL_CACHE_ENABLED) {
        instCache = new InstallCache(msysRootDir, input);
        core.startGroup('Restoring environment...');
        cachedInstall = await instCache.restore();
        core.endGroup();
      }

      if (!cachedInstall) {
        core.startGroup('Downloading MSYS2...');
        let inst_dest = await downloadInstaller();

        changeGroup('Extracting MSYS2...');
        await exec.exec(inst_dest, ['-y'], {cwd: dest});

        changeGroup('Disable Key Refresh...');
        await disableKeyRefresh(msysRootDir);
        core.endGroup();
      }
    }

    writeWrapper(msysRootDir, input.pathtype, dest, 'msys2.cmd');
    core.addPath(dest);

    core.exportVariable('MSYSTEM', input.msystem);

    const packageCache = new PackageCache(msysRootDir, input);

    if (!cachedInstall) {
      core.startGroup('Restoring package cache...');
      await packageCache.restore();
      core.endGroup();

      core.startGroup('Starting MSYS2 for the first time...');
      await runMsys(['uname', '-a']);
      core.endGroup();
    }

    if (input.update) {
      core.startGroup('Disable CheckSpace...');
      // Reduce time required to install packages by disabling pacman's disk space checking
      await runMsys(['sed', '-i', 's/^CheckSpace/#CheckSpace/g', '/etc/pacman.conf']);
      changeGroup('Updating packages...');
      await pacman(['-Syuu', '--overwrite', '*'], {ignoreReturnCode: true});
      // We have changed /etc/pacman.conf above which means on a pacman upgrade
      // pacman.conf will be installed as pacman.conf.pacnew
      await runMsys(['mv', '-f', '/etc/pacman.conf.pacnew', '/etc/pacman.conf'], {ignoreReturnCode: true, silent: true});
      changeGroup('Killing remaining tasks...');
      await exec.exec('taskkill', ['/F', '/FI', 'MODULES eq msys-2.0.dll']);
      changeGroup('Final system upgrade...');
      await pacman(['-Syuu', '--overwrite', '*'], {});
      core.endGroup();
    }

    if (input.install.length) {
      core.startGroup('Installing additional packages...');
      await pacman(['-S', '--needed', '--overwrite', '*'].concat(input.install), {});
      core.endGroup();
    }

    if (!cachedInstall) {
      core.startGroup('Saving package cache...');
      await packageCache.prune();
      await packageCache.save();
      await packageCache.clear();
      core.endGroup();
    }

    if (instCache !== null) {
      core.startGroup('Saving environment...');
      await packageCache.clear();
      await instCache.save();
      core.endGroup();
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
