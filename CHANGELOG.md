# Changelog

## [Unreleased](https://github.com/msys2/setup-msys2/compare/a4332eaf3b970340d6495b2076e1405ee48ea573...HEAD)

### Changed

## [v1.1.1](https://github.com/msys2/setup-msys2/compare/9da8a47f7acedd87a157ef2d99246f877fc15e9c...a4332eaf3b970340d6495b2076e1405ee48ea573)

### Changed

- Transfer from 'eine' to 'msys2'.
- Call `/usr/bin/env` instead of `/usr/bin/bash` directly.
- Fix the path to be cached, which depends on `p_release`, not `p_update`.
- Use `needed` when installing additional packages (`install`).
- Use the self extracting archive instead of the `.tar.xz`.
- Bump dependencies:
  - folder-hash to v3.3.2

## [v1.1.0](https://github.com/msys2/setup-msys2/compare/b506907ae6185e399cfae0191555c6c99523fdb1...9da8a47f7acedd87a157ef2d99246f877fc15e9c)

### Added

- Option `cache`.
- Option `release`.

### Changed

- `update: true` alone now defaults to using the installation from GitHub Releases, instead of the default installation in the virtual environment. [[#23](https://github.com/msys2/setup-msys2/issues/23)]
- Disable `CheckSpace` to reduce update time.
- ignoreReturnCode when executing `pacman -Syuu` for the first time.

## [1.0.1](https://github.com/msys2/setup-msys2/compare/877608b23cc3051911e4c84b919db4e9e14ad65c...b506907ae6185e399cfae0191555c6c99523fdb1) - 2020/06/04

## Changed

- Update base distribution to [20200602](https://github.com/msys2/msys2-installer/releases/tag/2020-06-02).

## [1.0.0](https://github.com/msys2/setup-msys2/compare/5cb94deb40d2e279c09e837a8f5350dd3a3aef8e...877608b23cc3051911e4c84b919db4e9e14ad65c) - 2020/05/28

### Changed

- Update base distribution to [20200522](https://github.com/msys2/msys2-installer/releases/tag/2020-05-22).
- CI: update actions/checkout to v2.
- README:
  - Show how to set a default shell.
  - Recommended version is v1.
- Update keywords in `package.json`.
- Bump dependencies
  - @actions/tool-cache to v1.5.5
  - @zeit/ncc to v0.22.3

### Removed

- `msys2do` and `msys2` are now unified and `msys2do` is removed.

## [0.2.0](https://github.com/msys2/setup-msys2/compare/66aff8cc8c73a1a40b56953dce3d39f96f7e38c3...5cb94deb40d2e279c09e837a8f5350dd3a3aef8e) - 2020/05/22

### Changed

- If `update: true`, use default MSYS2 installation now available in `windows-latest`.
- Call `taskkill` once only.

## [0.1.2](https://github.com/msys2/setup-msys2/compare/fb70b5f428b0a20d604299c6fe2df3a5252866dc...66aff8cc8c73a1a40b56953dce3d39f96f7e38c3) - 2020/05/20

### Changed

- Do not update pacman separatedly.

## [0.1.1](https://github.com/msys2/setup-msys2/compare/db03b1e38ae651b71bff93b00e794eb89303ddf7...fb70b5f428b0a20d604299c6fe2df3a5252866dc) - 2020/05/20

### Changed

- Execute `taskkill` after updating packages and before the final upgrade.

## [0.1.0](https://github.com/msys2/setup-msys2/compare/188ae2ba73f7e612a8d35c57b25b679874850bf3...db03b1e38ae651b71bff93b00e794eb89303ddf7) - 2020/05/19

### Added

- Option `install`.

### Changed

- Update base distribution to [20200517](https://github.com/msys2/msys2-installer/releases/tag/2020-05-17), from [msys2/msys2-installer GitHub Releases](https://github.com/msys2/msys2-installer/releases).
- Execute `taskkill` after `pacman -Syu`.
- README: recommended version is v0.

## [0.0.2](https://github.com/msys2/setup-msys2/compare/287bc00c1ce99eb99aa853c3c866ec66ed7a8bf2...188ae2ba73f7e612a8d35c57b25b679874850bf3) - 2020/05/14

### Changed
- Rename from 'numworks' to 'eine'.
- Rename `npm run build` task to `npm run pkg`.
- Update description of the Action.
- Bump dependencies:
   - @actions/core to v1.2.4
   - @actions/exec to v1.0.4
   - @actions/tool-cache to v1.3.5
   - @zeit/ncc to v0.22.1

## [0.0.1](https://github.com/msys2/setup-msys2/compare/0a7d108a24ab21d01436197d61e330816e522816...287bc00c1ce99eb99aa853c3c866ec66ed7a8bf2) - 2020/01/19

### Added
- Options: `msystem`, `update` and `path-type`. [[numworks/setup-msys2#1](https://github.com/numworks/setup-msys2/pull/1), [numworks/setup-msys2#3](https://github.com/numworks/setup-msys2/pull/3), [numworks/setup-msys2#6](https://github.com/numworks/setup-msys2/pull/6), [numworks/setup-msys2#7](https://github.com/numworks/setup-msys2/pull/7), [numworks/setup-msys2#14](https://github.com/numworks/setup-msys2/pull/14)]
- `msys2.cmd`, to support multi-line run steps. [[numworks/setup-msys2#8](https://github.com/numworks/setup-msys2/pull/8), [numworks/setup-msys2#21](https://github.com/numworks/setup-msys2/pull/21)]
- Bundle for deployment with [ncc](https://github.com/vercel/ncc). [[numworks/setup-msys2#4](https://github.com/numworks/setup-msys2/pull/4), [numworks/setup-msys2#5](https://github.com/numworks/setup-msys2/pull/5)]
- Add GitHub Actions workflow. [[numworks/setup-msys2#3](https://github.com/numworks/setup-msys2/pull/3), [numworks/setup-msys2#15](https://github.com/numworks/setup-msys2/pull/15), [numworks/setup-msys2#16](https://github.com/numworks/setup-msys2/pull/16), [numworks/setup-msys2#18](https://github.com/numworks/setup-msys2/pull/18)]
- README: badges/shields. , [[numworks/setup-msys2#9](https://github.com/numworks/setup-msys2/pull/9)]
- `.gitignore`.

### Changed
- Checks:
  - Is the host platform Windows?
  - Is RUNNER_TMP empty?
- Extraction:
  - Use `7z` instead of `tar`. [[numworks/setup-msys2#26](https://github.com/numworks/setup-msys2/pull/26), [numworks/setup-msys2#28](https://github.com/numworks/setup-msys2/pull/28)]
  - Use `ExecOptions.cwd`.
- `msys2do.cmd`:
  - Hardcode it in `index.js`.
  - Do not overwrite MSYS2_PATH_TYPE envvar.
  - Add `@echo off` and `--norc -eo pipefail`.
  - Use `\r\n` instead of `\n\r`.
- Ensure that MSYS2 is initialized.
- Bump dependencies:
  - @actions/core to v1.2.0
  - @actions/exec to v1.0.2 [[numworks/setup-msys2#24](https://github.com/numworks/setup-msys2/pull/24)]

### Removed
- `io.which` is not required anymore.
- Clean `package-lock.json`.
