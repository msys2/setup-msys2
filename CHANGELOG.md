# Changelog

## [Unreleased](https://github.com/msys2/setup-msys2/compare/5f027e0ad12b5d8cf6e794847cec272f9d59825c...HEAD)

### Changed

- Bump dependencies:
  - @vercel/ncc to v0.29.1
  - eslint to v7.32.0

## [2.4.2](https://github.com/msys2/setup-msys2/compare/2ffbfd30567f4031016002fcb5a6e6e7c0de067a...5f027e0ad12b5d8cf6e794847cec272f9d59825c) - 2021/07/30

### Added

- Examples. [[#149](https://github.com/msys2/setup-msys2/pull/149)]

### Changed

- Update base distribution to [20210725](https://github.com/msys2/msys2-installer/releases/tag/2021-07-25). [[#154](https://github.com/msys2/setup-msys2/pull/154)]
- Force date into a semver-compliant version. [[#148](https://github.com/msys2/setup-msys2/pull/148)]
- Bump dependencies:
  - @vercel/ncc to v0.29.0
  - eslint to v7.31.0

## [2.4.1](https://github.com/msys2/setup-msys2/compare/c381b3e3bb2726b3263ecb5a7204b2ba19f3fc10...2ffbfd30567f4031016002fcb5a6e6e7c0de067a) - 2021/07/06

### Added

- Cache installer in the tool cache. [[#147](https://github.com/msys2/setup-msys2/pull/147)]

### Changed

- Bump dependencies:
  - eslint to v7.30.0

## [2.4.0](https://github.com/msys2/setup-msys2/compare/28da3da2173118160b7ebf24f4f170f30f00cc5e...c381b3e3bb2726b3263ecb5a7204b2ba19f3fc10) - 2021/06/16

### Added

- Support CLANG32 system too. [[#143](https://github.com/msys2/setup-msys2/issues/143)]

### Changed

- Bump dependencies:
  - eslint to v7.28.0

## [2.3.1](https://github.com/msys2/setup-msys2/compare/1dffee870e9df3fac027dfa450c30a6ee18d7a80...28da3da2173118160b7ebf24f4f170f30f00cc5e) - 2021/06/07

### Changed

- Update base distribution to [20210604](https://github.com/msys2/msys2-installer/releases/tag/2021-06-04). [[#141](https://github.com/msys2/setup-msys2/pull/141)]
- Bump dependencies:
  - @actions/core to v1.3.0
  - @actions/tool-cache to v1.7.0
  - @vercel/ncc to v0.28.6
  - eslint to v7.27.0

## [2.3.0](https://github.com/msys2/setup-msys2/compare/78d2b743f702aad2fd3040417b6747b3f342eb66...1dffee870e9df3fac027dfa450c30a6ee18d7a80) - 2021/05/11

### Added

- Support CLANG64 system too. [[#135](https://github.com/msys2/setup-msys2/issues/135)]

## [2.2.0](https://github.com/msys2/setup-msys2/compare/c59fdfa7c5bcce581e57856d9ad73804c6786f2e...78d2b743f702aad2fd3040417b6747b3f342eb66) - 2021/04/20

### Added

- Support UCRT64 system too. [[#130](https://github.com/msys2/setup-msys2/pull/130)]

### Changed

- Update base distribution to [20210419](https://github.com/msys2/msys2-installer/releases/tag/2021-04-19). [[#129](https://github.com/msys2/setup-msys2/pull/129)]
- Bump dependencies:
  - @actions/core to v1.2.7
  - @actions/cache to v1.0.7
  - @vercel/ncc to v0.28.3
  - eslint to v7.24.0

## [2.1.6](https://github.com/msys2/setup-msys2/compare/42cc92da65286e00a692258fd5d7bb4624eb5b05...c59fdfa7c5bcce581e57856d9ad73804c6786f2e) - 2021/03/26

### Changed

- Refresh the DBs before the final upgrade. [[#119](https://github.com/msys2/setup-msys2/pull/119), [#120](https://github.com/msys2/setup-msys2/pull/120)]
- Bump dependencies:
  - eslint to v7.22.0
  - folder-hash to v4.0.1

## [2.1.5](https://github.com/msys2/setup-msys2/compare/e7846a8b67444fb87744a711404045b782e7ff63...42cc92da65286e00a692258fd5d7bb4624eb5b05) - 2021/02/28

### Changed

- Update base distribution to [20210228](https://github.com/msys2/msys2-installer/releases/tag/2021-02-28). [[#114](https://github.com/msys2/setup-msys2/pull/114)]

## [2.1.4](https://github.com/msys2/setup-msys2/compare/4d3b22f79f56c4983da648b6b9bfa63815481610...e7846a8b67444fb87744a711404045b782e7ff63) - 2021/02/15

### Changed

- Fix splitting list of 'install' when items are separated by multiple spaces. [[#103](https://github.com/msys2/setup-msys2/issues/103)]
- Update base distribution to [20210215](https://github.com/msys2/msys2-installer/releases/tag/2021-02-15). [[#112](https://github.com/msys2/setup-msys2/pull/112)]
- Dependencies:
  - Bump @actions/cache to v1.0.6
  - Bump eslint to v7.20.0
  - @zeit/ncc is no longer maintained; @vercel/ncc v0.27.0 is used instead

## [2.1.3](https://github.com/msys2/setup-msys2/compare/bd0bdf22fe90699697c5c2b4bc1cc842bd4e1a5f...4d3b22f79f56c4983da648b6b9bfa63815481610) - 2021/01/06

### Changed

- Add `CACHE_FLUSH_COUNTER` to CacheKey hash computation, for allowing flushing all the caches by bumping the Action. [[#99](https://github.com/msys2/setup-msys2/issues/99)]
- Update base distribution to [20210105](https://github.com/msys2/msys2-installer/releases/tag/2021-01-05). [[#101](https://github.com/msys2/setup-msys2/pull/101)]
- README:
  - Add section 'Context'. [[#88](https://github.com/msys2/setup-msys2/pull/88)]
  - Update the syntax for the install list (use fold+strip). [[#90](https://github.com/msys2/setup-msys2/issues/90)]
  - Move developer related docs into a separate file (`HACKING.md`).
- Bump dependencies:
  - @actions/cache to v1.0.5
  - @actions/tool-cache to v1.6.1
  - eslint to v7.17.0

## [2.1.2](https://github.com/msys2/setup-msys2/compare/46faddb10578f4ed77e9db446a5077f6c980041a...bd0bdf22fe90699697c5c2b4bc1cc842bd4e1a5f) - 2020/11/14

### Changed

- Update base distribution to [20201109](https://github.com/msys2/msys2-installer/releases/tag/2020-11-09).
- Bump dependencies:
  - @actions/cache to v1.0.4
  - eslint to v7.13.0
  - folder-hash to v4.0.0

## [2.1.1](https://github.com/msys2/setup-msys2/compare/72120a5f5986349f2babced564e027a96001c99a...46faddb10578f4ed77e9db446a5077f6c980041a) - 2020/10/05

### Changed

- Bump dependencies:
  - @actions/core to v1.2.6
  - eslint to v7.10.0
  - folder-bash to v3.3.3

## [2.1.0](https://github.com/msys2/setup-msys2/compare/654f62ffd14ab50887ad19e09b1ae277fc1f538c...72120a5f5986349f2babced564e027a96001c99a) - 2020/09/04

### Changed

- Update base distribution to [20200903](https://github.com/msys2/msys2-installer/releases/tag/2020-09-03). [[#66](https://github.com/msys2/setup-msys2/pull/66)]
- Conditionally disable the install cache, unset by default. [[#63](https://github.com/msys2/setup-msys2/pull/63)]
- Switch dependabot interval from 'daily' to 'weekly'.
- Bump dependencies:
  - @actions/cache to v1.0.2
  - @actions/core to v1.2.5
  - eslint to v7.7.0

## [2.0.1](https://github.com/msys2/setup-msys2/compare/0908a2926547f3a4fa10a13a11156a09e3cdd8a4...654f62ffd14ab50887ad19e09b1ae277fc1f538c) - 2020/07/27

### Added

- `eslint` support (`.eslintrc.json`).
- Create `dependabot.yml`.

### Changed

- Refactor code into multiple functions. [[#53](https://github.com/msys2/setup-msys2/pull/53)]
- Cache the whole installation when possible. [[#54](https://github.com/msys2/setup-msys2/pull/54)]
- `pacman`:
  - Always pass `--overwrite '*'`. [[#55](https://github.com/msys2/setup-msys2/pull/55)]
  - Handle upgrade creating `.pacnew` files. [[#56](https://github.com/msys2/setup-msys2/pull/56)]
- CI: only build the action once. [[#57](https://github.com/msys2/setup-msys2/pull/57)]
- Dependencies:
  - Bump @actions/cache to v1.0.1
  - Fix: @actions/tool-cache should not be pinned

## [2.0.0](https://github.com/msys2/setup-msys2/compare/05abb8d585d071301cc19e6177945011875d9479...0908a2926547f3a4fa10a13a11156a09e3cdd8a4) - 2020/07/20

### Changed

- Update base distribution to [20200719](https://github.com/msys2/msys2-installer/releases/tag/2020-07-19). [[#47](https://github.com/msys2/setup-msys2/pull/47)]
- Change default of option `path-type` from `strict` to `minimal`. [[#42](https://github.com/msys2/setup-msys2/pull/42)]
- Allow lowercase values for option `msystem`, and validate them. [[#41](https://github.com/msys2/setup-msys2/pull/41), [#48](https://github.com/msys2/setup-msys2/pull/48)]
- Disable initial key refresh to accelerate the setup. [[#45](https://github.com/msys2/setup-msys2/pull/45)]
- README:
  - Add refs about 'matrix'. [[#40](https://github.com/msys2/setup-msys2/pull/40)]
  - Explain that specific commands can/need be executed with `msys2 -c`.
- Bump dependencies:
  - @actions/cache to v1.0.0
  - @actions/tool-cache to v1.6.0

### Removed

- Shell arguments are passed directly to bash. Now, `msys2 -c mybinary` can be used in cmd/powershell, instead of `msys2 mybinary`. However, using `shell: msys2 {0}` is recommended. [[#43](https://github.com/msys2/setup-msys2/pull/43), [#44](https://github.com/msys2/setup-msys2/pull/44)]
- `pacman` package cache is reworked and enabled by default. As a result, option `cache` is removed. [[#51](https://github.com/msys2/setup-msys2/pull/51)]

## [1.1.2](https://github.com/msys2/setup-msys2/compare/a4332eaf3b970340d6495b2076e1405ee48ea573...05abb8d585d071301cc19e6177945011875d9479) - 2020/07/04

### Added

- Check the SHA256 of the installer, before extracting it. [[#36](https://github.com/msys2/setup-msys2/pull/36)]

### Changed

- Update base distribution to [20200629](https://github.com/msys2/msys2-installer/releases/tag/2020-06-29). [[#35](https://github.com/msys2/setup-msys2/pull/35)]

## [1.1.1](https://github.com/msys2/setup-msys2/compare/9da8a47f7acedd87a157ef2d99246f877fc15e9c...a4332eaf3b970340d6495b2076e1405ee48ea573) - 2020/06/27

### Changed

- Transfer from 'eine' to 'msys2'.
- Call `/usr/bin/env` instead of `/usr/bin/bash` directly.
- Fix the path to be cached, which depends on `p_release`, not `p_update`.
- Use `--needed` when installing additional packages (`install`). [[#30](https://github.com/msys2/setup-msys2/pull/30)]
- Use the self extracting archive instead of the `.tar.xz`. [[#31](https://github.com/msys2/setup-msys2/pull/31)]
- Bump dependencies:
  - folder-hash to v3.3.2

## [1.1.0](https://github.com/msys2/setup-msys2/compare/b506907ae6185e399cfae0191555c6c99523fdb1...9da8a47f7acedd87a157ef2d99246f877fc15e9c) - 2020/06/05

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

- Do not update `pacman` separatedly.

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
