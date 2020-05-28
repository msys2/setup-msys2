# Setup MSYS2

<p align="center">
  <a title="'action' workflow Status" href="https://github.com/eine/setup-msys2/actions?query=workflow%3Aaction"><img alt="'action' workflow Status" src="https://img.shields.io/github/workflow/status/eine/setup-msys2/action?longCache=true&style=flat-square&label=action&logo=github"></a><!--
  -->
  <a title="Dependency Status" href="https://david-dm.org/eine/setup-msys2"><img src="https://img.shields.io/david/eine/setup-msys2.svg?longCache=true&style=flat-square&label=deps&logo=npm"></a>
</p>

[MSYS2](https://www.msys2.org/) is available by default in [windows-latest](https://github.com/actions/virtual-environments/blob/master/images/win/Windows2019-Readme.md#msys2) virtual environment for GitHub Actions. However, the default installation is updated and it includes some pre-installed packages. Moreover, it is neither added to the PATH nor available as a custom `shell` option.

**setup-msys2** is a JavaScript GitHub Action (GHA) to optionally setup a stable [MSYS2](https://www.msys2.org/) environment in a temporal location, using the GHA [toolkit](https://github.com/actions/toolkit); and to provide two custom entrypoints.

If option `update` is `true`, the default installation is used, in order to reduce startup latency. Otherwise, the latest tarball available at [repo.msys2.org/distrib/x86_64](http://repo.msys2.org/distrib/x86_64/) is downloaded and extracted.

## Usage

```yaml
  - uses: eine/setup-msys2@v0
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
  - uses: eine/setup-msys2@v0
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
  - uses: eine/setup-msys2@v0
    with:
      msystem: MSYS
```

Furthermore, the environment variable can be overriden. This is useful when multiple commands need to be executed in different contexts. For example, in order to build a PKGBUILD file and then test the installed artifact:

```yaml
  - uses: eine/setup-msys2@v0
    with:
      msystem: MSYS
  - shell: msys2
    run: |
      makepkg-mingw -sCLfc --noconfirm --noprogressbar
      pacman --noconfirm -U mingw-w64-*-any.pkg.tar.xz
  - run: |
      set MSYSTEM=MINGW64
      msys2do <command to test the package>
```

#### path-type

By default, `MSYS2_PATH_TYPE` is set to `strict` by `msys2do`. It is possible to override it either using an option or setting the environment variable explicitly:

```yaml
  - uses: eine/setup-msys2@v0
    with:
      path-type: inherit
  - run: msys2do <command>
```

```yaml
  - uses: eine/setup-msys2@v0
  - run: msys2do <command>
    env:
      MSYS2_PATH_TYPE: inherit
```

#### update

By default, the installation is not updated; hence package versions are those of the installation tarball. By setting option `update` to `true`, the action will try to update the runtime and packages cleanly:

```yaml
  - uses: eine/setup-msys2@v0
    with:
      update: true
```

#### install

Installing additional packages after updating the system is supported through option `install`. The package or list of packages are intalled through `pacman --noconfirm -S`.

```yaml
  - uses: eine/setup-msys2@v0
    with:
      update: true
      install: 'git base-devel'
```
