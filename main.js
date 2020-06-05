const cache = require('@actions/cache');
const core = require('@actions/core');
const io = require('@actions/io');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const path = require('path');
const fs = require('fs');
const { hashElement } = require('folder-hash');

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
    const p_cache = core.getInput('cache');

    let drive = 'C:';

    if (p_release) {
      drive = '%~dp0';
      const distrib = await tc.downloadTool('https://github.com/msys2/msys2-installer/releases/download/2020-06-02/msys2-base-x86_64-20200602.tar.xz');
      await exec.exec('bash', ['-c', `7z x ${distrib.replace(/\\/g, '/')} -so | 7z x -aoa -si -ttar`], {cwd: dest} );
    }

    let wrap = [
      `setlocal`,
      `@echo off`,
      `IF NOT DEFINED MSYS2_PATH_TYPE set MSYS2_PATH_TYPE=` + p_pathtype,
      `set "args=%*"`,
      `set "args=%args:\\=/%"`,
      drive + `\\msys64\\usr\\bin\\bash.exe --norc -ilceo pipefail "cd $OLDPWD && %args%"`
    ].join('\r\n');

    let cmd = path.join(dest, 'msys2.cmd');
    fs.writeFileSync(cmd, wrap);

    core.addPath(dest);

    core.exportVariable('MSYSTEM', p_msystem);

    if (p_cache === 'true') {
      core.startGroup('Restoring cache...');
      const paths = [(p_update ? 'C:' : dest) + `\\msys64\\var\\cache\\pacman\\pkg\\`];
      console.log('Cache ID:', await cache.restoreCache(paths, 'msys2', ['msys2-']));
      core.endGroup();
    }

    async function pacman(args, opts) {
      await exec.exec('cmd', ['/D', '/S', '/C', cmd, 'pacman', '--noconfirm'].concat(args), opts);
    }

    function changeGroup(str) {
      core.endGroup();
      core.startGroup(str);
    }

    if (p_update) {
      core.startGroup('Disable CheckSpace...');
      //# reduce time required to install packages by disabling pacman's disk space checking
      await exec.exec('cmd', ['/D', '/S', '/C', cmd, 'sed', '-i', 's/^CheckSpace/#CheckSpace/g', '/etc/pacman.conf']);
      changeGroup('Updating packages...');
      await pacman(['-Syuu'], {ignoreReturnCode: true});
      changeGroup('Killing remaining tasks...');
      await exec.exec('taskkill', ['/F', '/FI', 'MODULES eq msys-2.0.dll']);
      changeGroup('Final system upgrade...');
      await pacman(['-Suu'], {});
      core.endGroup();
    } else {
      core.startGroup('Starting MSYS2 for the first time...');
      await exec.exec('cmd', ['/D', '/S', '/C', cmd].concat(['uname', '-a']));
      core.endGroup();
    }

    if (p_install != '' && p_install != 'false') {
      core.startGroup('Installing additional packages...');
      await pacman(['-S'].concat(p_install.split(' ')), {});
      core.endGroup();
    }

    if (p_cache === 'true' || p_cache === 'save') {
      core.startGroup('Saving cache...');
      const paths = [(p_update ? 'C:' : dest) + `\\msys64\\var\\cache\\pacman\\pkg\\`];
      const key = (await hashElement(paths[0]))['hash'].toString() + (new Date()).getTime().toString();
      console.log('Cache ID:', await cache.saveCache(paths, 'msys2-' + key), '[' + key + ']');
      core.endGroup();
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
