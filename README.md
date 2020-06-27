<p align="center">
  <a title="msys2.github.io" href="https://msys2.github.io"><img src="https://img.shields.io/website.svg?label=msys2.github.io&longCache=true&style=flat-square&url=http%3A%2F%2Fmsys2.github.io%2Findex.html&logo=github"></a><!--
  -->
  <a title="Join the chat at https://gitter.im/msys2/msys2" href="https://gitter.im/msys2/msys2"><img src="https://img.shields.io/badge/chat-on%20gitter-4db797.svg?longCache=true&style=flat-square&logo=gitter&logoColor=e8ecef"></a><!--
  -->
  <a title="'action' workflow Status" href="https://github.com/msys2/setup-msys2/actions?query=workflow%3Aaction"><img alt="'action' workflow Status" src="https://img.shields.io/github/workflow/status/msys2/setup-msys2/action?longCache=true&style=flat-square&label=action&logo=github"></a><!--
  -->
  <a title="Dependency Status" href="https://david-dm.org/msys2/setup-msys2"><img src="https://img.shields.io/david/msys2/setup-msys2.svg?longCache=true&style=flat-square&label=deps&logo=npm"></a>
</p>

# Setup MSYS2

[MSYS2](https://www.msys2.org/) is available by default in [windows-latest](https://github.com/actions/virtual-environments/blob/master/images/win/Windows2019-Readme.md#msys2) virtual environment for GitHub Actions. However, the default installation is updated every ~10 days, and it includes some pre-installed packages. As a result, startup time can be up to 10 min. Moreover, MSYS2/MINGW are neither added to the PATH nor available as a custom `shell` option.

**setup-msys2** is a JavaScript GitHub Action (GHA) to optionally setup an up-to-date and stable [MSYS2](https://www.msys2.org/) environment in a temporal location, using the GHA [toolkit](https://github.com/actions/toolkit). Moreover, it provides a custom entrypoint.

If option `release` is `false`, the default installation is used. Otherwise (by default), the latest tarball available at [repo.msys2.org/distrib/x86_64](http://repo.msys2.org/distrib/x86_64/) is downloaded and extracted.

## Usage

```yaml
  - uses: msys2/setup-msys2@v1
```

Then, for multi-line scripts:

```yaml
  - shell: msys2 {0}
    run: |
      uname -a
```

Or, for single line commands:

```yaml
  - run: msys2 uname -a
```

It is also possible to set `msys2` as the default shell. For example:

```yaml
  defaults:
    run:
      shell: msys2 {0}
  steps:
  - uses: msys2/setup-msys2@v1
    with:
      update: true
      install: base-devel git
  #- run: git config --global core.autocrlf input
  #  shell: bash
  - uses: actions/checkout@v2
  - run: git describe --dirty
```

Note that setting `autocrlf` is required in specific use cases only. See [actions/checkout#250](https://github.com/actions/checkout/issues/250).

### Options

#### msystem

By default, `MSYSTEM` is set to `MINGW64`. However, an optional parameter named `msystem` is supported, which expects `MSYS`, `MINGW64` or `MING32`. For example:

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      msystem: MSYS
```

Furthermore, the environment variable can be overridden. This is useful when multiple commands need to be executed in different contexts. For example, in order to build a PKGBUILD file and then test the installed artifact:

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      msystem: MSYS
  - shell: msys2 {0}
    run: |
      makepkg-mingw -sCLfc --noconfirm --noprogressbar
      pacman --noconfirm -U mingw-w64-*-any.pkg.tar.xz
  - run: |
      set MSYSTEM=MINGW64
      msys2 <command to test the package>
```

#### path-type

By default, `MSYS2_PATH_TYPE` is set to `strict` by `msys2`. It is possible to override it either using an option or setting the environment variable explicitly:

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      path-type: inherit
  - run: msys2 <command>
```

```yaml
  - uses: msys2/setup-msys2@v1
  - run: msys2 <command>
    env:
      MSYS2_PATH_TYPE: inherit
```

#### release

By default (`true`), retrieve and extract base installation from upstream GitHub Releases. If set to `false`, the installation available in the virtual environment is used:

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      release: false
```

#### update

By default, the installation is not updated; hence package versions are those of the installation tarball. By setting option `update` to `true`, the action will try to update the runtime and packages cleanly:

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      update: true
```

#### install

Installing additional packages after updating the system is supported through option `install`. The package or list of packages are installed through `pacman --noconfirm -S --needed`.

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      update: true
      install: 'git base-devel'
```

#### cache

If set to `true`, directory `/var/cache/pacman/pkg` is restored/cached in order to speed up future updates:

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      cache: true
```

If set to `save`, the same directory is cached, but it is not restored. This can be used to force a save of a clean state.

```yaml
  - uses: msys2/setup-msys2@v1
    with:
      cache: save
```

## Development

The steps to publish a new release are the following:

```sh
# Remove/clean dir 'dist'
rm -rf dist

# Package the action with ncc
yarn pkg

# - Copy release artifacts to subdir dir
# - Create a new orphan branch in a new empty repo
# - Push the branch
./release.sh v1.x.x

# Fetch the new branch and checkout it
git fetch --all
git checkout -b tmp origin/v1.x.x

# Reset the 'rolling' tag to the just released branch
git tag -d v1
git tag v1
git push origin +v1

# Remove the temporal branch
git checkout master
git branch -D tmp
```

> NOTE: although it feels unidiomatic having 'rolling' tags and/or storing release assets in specific branches, it is the recommended solution. Retrieving assets from GitHub Releases is not supported by GitHub Actions (yet). See [actions/javascript-action: Create a release branch](https://github.com/actions/javascript-action#create-a-release-branch), [actions/toolkit: docs/action-versioning.md](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) and [actions/toolkit#214](https://github.com/actions/toolkit/issues/214).

> NOTE: tag `tag-for-git-describe` is used for testing `git describe --dirty --tags` in CI. See [actions/checkout#250](https://github.com/actions/checkout/issues/250).
