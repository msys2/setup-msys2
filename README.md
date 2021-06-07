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

**setup-msys2** is a JavaScript GitHub Action (GHA) to setup an [MSYS2](https://www.msys2.org/) environment (i.e. MSYS,
MINGW32, MINGW64, UCRT64 and/or CLANG64 shells) using the GHA [toolkit](https://github.com/actions/toolkit) for
automatic caching.

## Context

[MSYS2](https://www.msys2.org/) is available by default in [windows-latest](https://github.com/actions/virtual-environments/blob/master/images/win/Windows2019-Readme.md#msys2)
[virtual environment](https://github.com/actions/virtual-environments) for GitHub Actions, located at `C:\msys64`.
Moreover, there is work in progress for making `bash` default to MSYS2 (see [actions/virtual-environments#1525](https://github.com/actions/virtual-environments/issues/1525)).
However, the default installation has some caveats at the moment (see [actions/virtual-environments#1572](https://github.com/actions/virtual-environments/issues/1572)):

- It is updated every ~10 days.
- It includes a non-negligible set of pre-installed packages. As a result, update time can be up to 10 min.
- Caching of installation packages is not supported.
- MSYS2/MINGW are neither added to the PATH nor available as a custom `shell` option.

**setup-msys2** works around those constraints:

- Using option `release: false`, the default installation is used, but automatic caching is supported and a custom
entrypoint is provided.
- By default (`release: true`), **setup-msys2** downloads and extracts the latest tarball available at [repo.msys2.org/distrib/x86_64](http://repo.msys2.org/distrib/x86_64/),
a clean and up-to-date environment is set up in a temporary location, and a custom entrypoint (`msys2`) is provided.
Hence, the overhead of updating pre-installed but unnecessary packages is avoided.

Therefore, usage of this Action is recommended to all MSYS2 users of GitHub Actions, since caching and the custom
entrypoint are provided regardless of option `release`.

## Usage

```yaml
  - uses: msys2/setup-msys2@v2
```

Then, for scripts:

```yaml
  - shell: msys2 {0}
    run: |
      uname -a
```

It is also possible to execute specific commands from cmd/powershell scripts/snippets.
In order to do so, `-c` is required:

```yaml
  - shell: powershell
    run: msys2 -c 'uname -a'
```

```yaml
  - shell: cmd
    run: msys2 -c 'uname -a'
```

### Default shell

In order to reduce verbosity, it is possible to set `msys2` as the default shell. For example:

```yaml
  defaults:
    run:
      shell: msys2 {0}
  steps:
  - uses: msys2/setup-msys2@v2
    with:
      update: true
      install: >-
        base-devel
        git
  #- run: git config --global core.autocrlf input
  #  shell: bash
  - uses: actions/checkout@v2
  - run: git describe --dirty
```

Note that setting `autocrlf` is required in specific use cases only.
See [actions/checkout#250](https://github.com/actions/checkout/issues/250).

### Build matrix

It is common to test some package/tool on MINGW32 (32 bit) and MINGW64 (64 bit), which typically requires installing
different sets of packages through option `install`.
GitHub Actions' `strategy` and `matrix` fields allow to do so, as explained in [docs.github.com: Configuring a build matrix](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow#configuring-a-build-matrix)
and [docs.github.com: `jobs.<job_id>.strategy.matrix`](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix).
See, for example:

- [msys2/MINGW-packages: .github/workflows/main.yml](https://github.com/msys2/MINGW-packages/blob/master/.github/workflows/main.yml).
- [ghdl/ghdl: .github/workflows/push.yml](https://github.com/ghdl/ghdl/blob/99b542c849311c92e87e2c70d283de133c9d4093/.github/workflows/push.yml#L56-L102).

Find further details at [#40](https://github.com/msys2/setup-msys2/issues/40) and [#102](https://github.com/msys2/setup-msys2/issues/102).

### Options

#### msystem

By default, `MSYSTEM` is set to `MINGW64`. However, an optional parameter named `msystem` is supported, which expects
`MSYS`, `MINGW64`, `MINGW32`, `UCRT64` or `CLANG64`.
For example:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      msystem: MSYS
```

Furthermore, the environment variable can be overridden.
This is useful when multiple commands need to be executed in different contexts.
For example, in order to build a PKGBUILD file and then test the installed artifact:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      msystem: MSYS
  - shell: msys2 {0}
    run: |
      makepkg-mingw -sCLfc --noconfirm --noprogressbar
      pacman --noconfirm -U mingw-w64-*-any.pkg.tar.xz
  - run: |
      set MSYSTEM=MINGW64
      msys2 -c '<command to test the package>'
```

#### path-type

Defines which parts of the Windows `$env:PATH` environment variable leak into the MSYS2 environment.
Allowed values:

- `strict`: do not inherit anything from `$env:PATH`.
- `minimal` *(default)*: only inherit the default Windows paths from `$env:PATH` (so that `cmd.exe` and `powershell.exe`
  are available for example).
- `inherit`: inherit everything; warning: this can lead to interference with other tools installed on the system.

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      path-type: minimal
```

This option corresponds to the `MSYS2_PATH_TYPE` setting in MSYS2; hence it can be set per step through `env`.
See [msys2/MSYS2-packages: filesystem/profile](https://github.com/msys2/MSYS2-packages/blob/915946a637e1f2b7e26e32782f3af322009293db/filesystem/profile#L28-L45)
for further details about the configuration of each option.

#### release

By default (`true`), retrieve and extract base installation from upstream GitHub Releases.
If set to `false`, the installation available in the virtual environment is used:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      release: false
```

#### update

By default, the installation is not updated; hence package versions are those of the installation tarball.
By setting option `update` to `true`, the action will try to update the runtime and packages cleanly:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      update: true
```

#### install

Installing additional packages after updating the system is supported through option `install`.
The package or list of packages are installed through `pacman --noconfirm -S --needed`.

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      update: true
      install: >-
        git
        base-devel
```
