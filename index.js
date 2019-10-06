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
      return
    }

    const tar = await io.which('tar', true);
    const dest = path.join(process.env['RUNNER_TEMP'], 'msys')

    await io.mkdirP(dest)

    const distrib = await tc.downloadTool('http://repo.msys2.org/distrib/x86_64/msys2-base-x86_64-20190524.tar.xz')

    await exec.exec(`"${tar}"`, [
      '-x', '-J', '--force-local',
      // For some reason, GNU Tar on Windows expects paths to be slash-separated
      '-C', dest.replace(/\\/g, '/'),
      '-f', distrib
    ])

    let cmd = path.join(dest, 'msys2do.cmd')
    fs.writeFileSync(cmd, fs.readFileSync(path.join(__dirname, 'msys2do.in')))

    core.addPath(dest);

    core.startGroup('Starting MSYS2 for the first time...')
      // For some reason, `msys2do` does not work
      await exec.exec(`"${cmd}"`, ['uname', '-a'])
    core.endGroup()
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
