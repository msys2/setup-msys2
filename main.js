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

    const distrib = await tc.downloadTool('http://repo.msys2.org/distrib/x86_64/msys2-base-x86_64-20190524.tar.xz');

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

    core.startGroup('Starting MSYS2 for the first time...');
      let pacmanCommand = (core.getInput('update') == 'true') ?  ['pacman', '-Syu', '--noconfirm'] : ['uname', '-a'];
      await exec.exec('cmd', ['/D', '/S', '/C', cmd].concat(pacmanCommand));
    core.endGroup();
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
