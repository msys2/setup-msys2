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

const inst_url = 'https://github.com/msys2/msys2-installer/releases/download/2020-07-19/msys2-base-x86_64-20200719.sfx.exe';
const checksum = '7abf59641c8216baf9be192a2072c041fffafc41328bac68f13f0e87c0baa1d3';

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

  const msystem_allowed = ['MSYS', 'MINGW32', 'MINGW64'];
  if (!msystem_allowed.includes(p_msystem.toUpperCase())) {
    throw new Error(`'msystem' needs to be one of ${ msystem_allowed.join(', ') }, got ${p_msystem}`);
  }
  p_msystem = p_msystem.toUpperCase()

  p_install = (p_install === 'false') ? [] : p_install.split(' ');

  return {
    release: p_release,
    update: p_update,
    pathtype: p_pathtype,
    msystem: p_msystem,
    install: p_install,
  }
}

async function downloadInstaller(destination) {
  await tc.downloadTool(inst_url, destination);
  let computedChecksum = '';
  await exec.exec(`powershell.exe`, [`(Get-FileHash ${destination} -Algorithm SHA256)[0].Hash`], {listeners: {stdout: (data) => { computedChecksum += data.toString(); }}});
  if (computedChecksum.slice(0, -2).toUpperCase() !== checksum.toUpperCase()) {
    throw new Error(`The SHA256 of the installer does not match! expected ${checksum} got ${computedChecksum}`);
  }
}

async function disableKeyRefresh(msysRootDir) {
  const postFile = path.join(msysRootDir, 'etc\\post-install\\07-pacman-key.post');
  await exec.exec(`powershell.exe`, [`((Get-Content -path ${postFile} -Raw) -replace '--refresh-keys', '--version') | Set-Content -Path ${postFile}`]);
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
    shasum.update([input.release, input.update, input.pathtype, input.msystem, input.install].toString());
    this.jobCacheKey = this.fallbackCacheKey + '-conf:' + shasum.digest('hex').slice(0, 8);

    this.restoreKey = undefined;
    this.pkgCachePath = path.join(msysRootDir, 'var', 'cache', 'pacman', 'pkg');
  }

  async restore() {
    // We ideally want a cache matching our configuration, but every cache is OK since we prune it later anyway
    this.restoreKey = await cache.restoreCache([this.pkgCachePath], this.jobCacheKey, [this.jobCacheKey, this.fallbackCacheKey]);
    console.log(`Cache restore for ${this.jobCacheKey}, got ${this.restoreKey}`);
  }

  async save() {
    const saveKey = this.jobCacheKey + '-files:' + (await hashElement(this.pkgCachePath))['hash'].toString();
    if (this.restoreKey === saveKey) {
      console.log(`Cache unchanged, skipping save for ${saveKey}`);
    } else {
      try {
        const cacheId  = await cache.saveCache([this.pkgCachePath], saveKey);
        console.log(`Cache saved as ID ${cacheId} using key ${saveKey}`);
      } catch (error) {
        // In case something created the same cache since we restored we'll get an error here,
        // but that's OK with us, so ignore.
        console.log(error.message);
      }
    }
  }

  async prune() {
    // Remove all uninstalled packages
    await runMsys(['paccache', '-r', '-f', '-u', '-k0']);
    // Keep the newest for all other packages
    await runMsys(['paccache', '-r', '-f', '-k1']);
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
  await exec.exec('cmd', ['/D', '/S', '/C', cmd].concat(['-c', args.join(' ')]), opts);
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
    const dest = path.join(tmp_dir, 'msys');

    await io.mkdirP(dest);

    const input = parseInput();

    let msysRootDir = path.join('C:', 'msys64');
    if (input.release) {
      // Use upstream package instead of the default installation in the virtual environment.
      core.startGroup('Downloading MSYS2...');
      let inst_dest = path.join(tmp_dir, 'base.exe');
      await downloadInstaller(inst_dest);

      changeGroup('Extracting MSYS2...');
      await exec.exec(inst_dest, ['-y'], {cwd: dest});
      msysRootDir = path.join(dest, 'msys64');

      changeGroup('Disable Key Refresh...');
      await disableKeyRefresh(msysRootDir);
      core.endGroup();
    }

    writeWrapper(msysRootDir, input.pathtype, dest, 'msys2.cmd');
    core.addPath(dest);

    core.exportVariable('MSYSTEM', input.msystem);

    const packageCache = new PackageCache(msysRootDir, input);

    core.startGroup('Restoring cache...');
    await packageCache.restore();
    core.endGroup();

    core.startGroup('Starting MSYS2 for the first time...');
    await runMsys(['uname', '-a']);
    core.endGroup();

    if (input.update) {
      core.startGroup('Disable CheckSpace...');
      // Reduce time required to install packages by disabling pacman's disk space checking
      await runMsys(['sed', '-i', 's/^CheckSpace/#CheckSpace/g', '/etc/pacman.conf']);
      changeGroup('Updating packages...');
      await pacman(['-Syuu'], {ignoreReturnCode: true});
      changeGroup('Killing remaining tasks...');
      await exec.exec('taskkill', ['/F', '/FI', 'MODULES eq msys-2.0.dll']);
      changeGroup('Final system upgrade...');
      await pacman(['-Suu'], {});
      core.endGroup();
    }

    if (input.install.length) {
      core.startGroup('Installing additional packages...');
      await pacman(['-S', '--needed'].concat(input.install), {});
      core.endGroup();
    }

    core.startGroup('Prune cache...');
    await packageCache.prune();
    core.endGroup();

    core.startGroup('Saving cache...');
    await packageCache.save();
    core.endGroup();
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
