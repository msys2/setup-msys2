const core = require('@actions/core');
const io = require('@actions/io');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const path = require('path');
const fs = require('fs');

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

    const distrib = await tc.downloadTool('https://github.com/msys2/msys2-installer/releases/download/2020-05-17/msys2-base-x86_64-20200517.tar.xz');

    await exec.exec('bash', ['-c', `7z x ${distrib.replace(/\\/g, '/')} -so | 7z x -aoa -si -ttar`], {cwd: dest} );

    let cmd = path.join(dest, 'msys2do.cmd');
    fs.writeFileSync(cmd, [
      `setlocal`,
      `@echo off`,
      `IF NOT DEFINED MSYS2_PATH_TYPE set MSYS2_PATH_TYPE=` + core.getInput('path-type'),
      `%~dp0\\msys64\\usr\\bin\\bash.exe --norc -ilceo pipefail "cd $OLDPWD && %*"`
    ].join('\r\n'));

    fs.writeFileSync(path.join(dest, 'msys2.cmd'), [
      `setlocal`,
      `@echo off`,
      `set "args=%*"`,
      `set "args=%args:\\=/%"`,
      cmd + ` %args%`
    ].join('\r\n'));

    core.addPath(dest);

    core.exportVariable('MSYSTEM', core.getInput('msystem'));

    async function pacman(args) {
      await exec.exec('cmd', ['/D', '/S', '/C', cmd, 'pacman', '--noconfirm'].concat(args));
    }

    function changeGroup(str) {
      core.endGroup();
      core.startGroup(str);
    }

    core.startGroup('Starting MSYS2 for the first time...');
      if (core.getInput('update') == 'true') {
        await pacman(['-Sy']);
        changeGroup('Updating bash and pacman...');
        await pacman(['--needed', '-S', 'bash', 'pacman'])
        changeGroup('Updating packages...');
        await pacman(['-Suu']);
        changeGroup('Killing remaining tasks...');
        await exec.exec('taskkill', ['/IM', 'gpg-agent.exe', '/F']);
        await exec.exec('taskkill', ['/IM', 'dirmngr.exe', '/F']);
        changeGroup('Final system upgrade...');
        await pacman(['-Syuu']);
      } else {
        await exec.exec('cmd', ['/D', '/S', '/C', cmd].concat(['uname', '-a']));
      }
    core.endGroup();

    let install = core.getInput('install');
    if (install != '' && install != 'false') {
      core.startGroup('Installing additional packages...');
      await pacman(['-S'].concat(install.split(' ')));
      core.endGroup();
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
