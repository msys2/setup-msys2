const cache = require('@actions/cache');
const core = require('@actions/core');
const io = require('@actions/io');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { hashElement } = require('folder-hash');

const inst_url = 'https://github.com/msys2/msys2-installer/releases/download/2020-07-19/msys2-base-x86_64-20200719.sfx.exe';
const checksum = '7abf59641c8216baf9be192a2072c041fffafc41328bac68f13f0e87c0baa1d3';

function changeGroup(str) {
  core.endGroup();
  core.startGroup(str);
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

    const p_release = core.getInput('release') === 'true';
    const p_update = core.getInput('update') === 'true';
    const p_pathtype = core.getInput('path-type');
    const p_msystem = core.getInput('msystem');
    const p_install = core.getInput('install');

    let base = 'C:';

    if (p_release) {
      // Use upstream package instead of the default installation in the virtual environment.
      core.startGroup('Downloading MSYS2...');
      base = '%~dp0';
      let inst_dest = path.join(tmp_dir, 'base.exe');
      await tc.downloadTool(inst_url, inst_dest);

      let inst_checksum = '';
      await exec.exec(`powershell.exe`, [`(Get-FileHash ${inst_dest} -Algorithm SHA256)[0].Hash`], {listeners: {stdout: (data) => { inst_checksum += data.toString(); }}});
      if (inst_checksum.slice(0, -2).toUpperCase() !== checksum.toUpperCase()) {
        core.setFailed(`The SHA256 of the installer does not match! expected ${checksum} got ${inst_checksum}`);
        return;
      }

      changeGroup('Extracting MSYS2...');
      await exec.exec(inst_dest, ['-y'], {cwd: dest});

      changeGroup('Disable Key Refresh...');
      let post_file = `${dest}\\msys64\\etc\\post-install\\07-pacman-key.post`;
      await exec.exec(`powershell.exe`, [`((Get-Content -path ${post_file} -Raw) -replace '--refresh-keys', '--version') | Set-Content -Path ${post_file}`]);
      core.endGroup();
    }

    let wrap = [
      `@echo off`,
      `setlocal`,
      `IF NOT DEFINED MSYS2_PATH_TYPE set MSYS2_PATH_TYPE=` + p_pathtype,
      `set CHERE_INVOKING=1`,
      base + `\\msys64\\usr\\bin\\bash.exe -leo pipefail %*`
    ].join('\r\n');

    let cmd = path.join(dest, 'msys2.cmd');
    fs.writeFileSync(cmd, wrap);

    core.addPath(dest);
    const pkgCachePath = (p_release ? dest : 'C:') + `\\msys64\\var\\cache\\pacman\\pkg\\`;

    const msystem_allowed = ['MSYS', 'MINGW32', 'MINGW64'];
    if (!msystem_allowed.includes(p_msystem.toUpperCase())) {
      core.setFailed(`'msystem' needs to be one of ${ msystem_allowed.join(', ') }, got ${p_msystem}`);
      return;
    }
    core.exportVariable('MSYSTEM', p_msystem.toUpperCase());

    // We want a cache key that is ideally always the same for the same kind of job.
    // So that mingw32 and ming64 jobs, and jobs with different install packages have different caches.
    let shasum = crypto.createHash('sha1');
    shasum.update([p_release, p_update, p_pathtype, p_msystem, p_install].toString());
    // We include "update" in the fallback key so that a job run with update=false never fetches
    // a cache created with update=true. Because this would mean a newer version than needed is in the cache
    // which would never be used but also would win during cache prunging because it is newer.
    const baseCacheKey = 'msys2-pkgs-upd:' + p_update.toString();
    const jobCacheKey = baseCacheKey + '-conf:' + shasum.digest('hex').slice(0, 8);

    core.startGroup('Restoring cache...');
    // We ideally want a cache matching our configuration, but every cache is OK since we prune it later anyway
    const restoreKey = await cache.restoreCache([pkgCachePath], jobCacheKey, [jobCacheKey, baseCacheKey]);
    console.log(`Cache restore for ${jobCacheKey}, got ${restoreKey}`);
    core.endGroup();

    async function run(args, opts) {
      await exec.exec('cmd', ['/D', '/S', '/C', cmd].concat(['-c', args.join(' ')]), opts);
    }

    async function pacman(args, opts) {
      await run(['pacman', '--noconfirm'].concat(args), opts);
    }

    core.startGroup('Starting MSYS2 for the first time...');
    await run(['uname', '-a']);
    core.endGroup();

    if (p_update) {
      core.startGroup('Disable CheckSpace...');
      // Reduce time required to install packages by disabling pacman's disk space checking
      await run(['sed', '-i', 's/^CheckSpace/#CheckSpace/g', '/etc/pacman.conf']);
      changeGroup('Updating packages...');
      await pacman(['-Syuu'], {ignoreReturnCode: true});
      changeGroup('Killing remaining tasks...');
      await exec.exec('taskkill', ['/F', '/FI', 'MODULES eq msys-2.0.dll']);
      changeGroup('Final system upgrade...');
      await pacman(['-Suu'], {});
      core.endGroup();
    }

    if (p_install != '' && p_install != 'false') {
      core.startGroup('Installing additional packages...');
      await pacman(['-S', '--needed'].concat(p_install.split(' ')), {});
      core.endGroup();
    }

    core.startGroup('Prune cache...');
    // Remove all uninstalled packages
    await run(['paccache', '-r', '-f', '-u', '-k0']);
    // Keep the newest for all other packages
    await run(['paccache', '-r', '-f', '-k1']);
    core.endGroup();

    core.startGroup('Saving cache...');
    const saveKey = jobCacheKey + '-files:' + (await hashElement(pkgCachePath))['hash'].toString();
    if (restoreKey === saveKey) {
      console.log(`Cache unchanged, skipping save for ${saveKey}`);
    } else {
      try {
        const cacheId  = await cache.saveCache([pkgCachePath], saveKey);
        console.log(`Cache saved as ID ${cacheId} using key ${saveKey}`);
      } catch (error) {
        // In case something created the same cache since we restored we'll get an error here,
        // but that's OK with us, so ignore.
        console.log(error.message);
      }
    }
    core.endGroup();
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
