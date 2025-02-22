<p align="center">
  <a title="msys2.github.io" href="https://msys2.github.io"><img src="https://img.shields.io/website.svg?label=msys2.github.io&longCache=true&style=flat-square&url=http%3A%2F%2Fmsys2.github.io%2Findex.html&logo=github"></a><!--
  -->
  <a title="Join the chat at https://gitter.im/msys2/msys2" href="https://gitter.im/msys2/msys2"><img src="https://img.shields.io/badge/chat-on%20gitter-4db797.svg?longCache=true&style=flat-square&logo=gitter&logoColor=e8ecef&label=Chat"></a><!--
  -->
  <a title="'Test' workflow Status" href="https://github.com/msys2/setup-msys2/actions/workflows/Test.yml"><img alt="'Test' workflow Status" src="https://img.shields.io/github/actions/workflow/status/msys2/setup-msys2/Test.yml?branch=main&longCache=true&style=flat-square&label=Test&logo=github"></a><!--
  -->
  <a title="'Example PKGBUILD' workflow Status" href="https://github.com/msys2/setup-msys2/actions/workflows/Tool.yml"><img alt="'Example PKGBUILD' workflow Status" src="https://img.shields.io/github/actions/workflow/status/msys2/setup-msys2/Tool.yml?branch=main&longCache=true&style=flat-square&label=Example%20PKGBUILD&logo=github"></a><!--
  -->
</p>

# Setup MSYS2

**setup-msys2** is a GitHub Action (GHA) to setup an [MSYS2](https://www.msys2.org/) environment (i.e. MSYS,
MINGW32, MINGW64, UCRT64, CLANG64 and/or CLANGARM64 shells)

It provides:

* Easy installation and updates
* Easy package installation including caching for faster re-runs
* A shell helper for running your commands or your whole job in an MSYS2 environment

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
        curl
        git
  - uses: actions/checkout@v4
```

### Build matrix

It is common to test some package/tool on multiple environments, which typically requires installing different sets of
packages through option `install`.
GitHub Actions' `strategy` and `matrix` fields allow to do so, as explained in [docs.github.com: Running variations of jobs in a workflow](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow)
and [docs.github.com: `jobs.<job_id>.strategy.matrix`](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix).
See, for instance:

```yml
  strategy:
    matrix:
      include:
        - { sys: mingw64, env: x86_64 }
        - { sys: mingw32, env: i686 }
        - { sys: ucrt64,  env: ucrt-x86_64 }
        - { sys: clang64, env: clang-x86_64 }
  steps:
    - uses: msys2/setup-msys2@v2
      with:
        msystem: ${{matrix.sys}}
        install: mingw-w64-${{matrix.env}}-openssl
```

Alternatively, option `pacboy` allows using a single matrix variable:

```yml
  strategy:
    matrix:
      sys:
        - mingw64
        - mingw32
        - ucrt64
        - clang64
  steps:
    - uses: msys2/setup-msys2@v2
      with:
        msystem: ${{matrix.sys}}
        pacboy: openssl:p
```

Furthermore, [.github/workflows/PKGBUILD.yml](.github/workflows/PKGBUILD.yml) is a [Reusable Workflow](https://docs.github.com/en/actions/sharing-automations/reusing-workflows)
to build and test a package in GitHub Actions using a PKGBUILD recipe.
It can be used along with [matrix](./matrix) (a [Composite Action](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action)),
as shown in [.github/workflows/Tool.yml](.github/workflows/Tool.yml).

Note: By default, GitHub Actions terminates any running jobs if any job in matrix
fails. This default behavior can be disabled by setting `fail-fast: false` in
strategy section. See
[docs.github.com: `jobs.<job_id>.strategy.fail-fast`](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategyfail-fast)
for more details.

Find similar patterns in the following workflows:

- [examples/cmake.yml](examples/cmake.yml)
- [msys2/MINGW-packages: .github/workflows/main.yml](https://github.com/msys2/MINGW-packages/blob/master/.github/workflows/main.yml)

Find further details at [#171](https://github.com/msys2/setup-msys2/issues/171#issuecomment-961458598) and [#102](https://github.com/msys2/setup-msys2/issues/102).

### Options

#### msystem

* Type: `string`
* Allowed values: `MSYS | MINGW64 | MINGW32 | UCRT64 | CLANG64 | CLANGARM64`
* Default: `MINGW64`

The default [environment](https://www.msys2.org/docs/environments/) that is used in the `msys2` command/shell provided by this action.

MSYS2 recommends `UCRT64` nowadays as the default instead of `MINGW64`.

For example:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      msystem: UCRT64
```

The environment can be later overridden using the `MSYSTEM` environment variable if needed.
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
      set MSYSTEM=UCRT64
      msys2 -c '<command to test the package>'
```

#### update

* Type: `boolean`
* Default: `false`

By default, the installation is not updated; hence package versions are those of the installation tarball.
By setting option `update` to `true`, the action will update the package database and all already installed packages.

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      update: true
```

#### install

* Type: `string`
* Allowed values: a whitespace separated list of packages
* Default: -

Installing additional packages after updating the system is supported through option `install`.
The package or list of packages are installed through `pacman --noconfirm -S --needed --overwrite *`.

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      update: true
      install: >-
        git
        curl
```

#### pacboy

* Type: `string`
* Allowed values: s whitespace separated list of packages
* Default: -

Installing additional packages with [pacboy](https://www.msys2.org/docs/package-naming/#avoiding-writing-long-package-names) after updating the system is supported through option `pacboy`.
The package or list of packages are installed through `pacboy --noconfirm -S --needed`.

```yaml
  strategy:
    fail-fast: false
    matrix:
      sys: [ MINGW64, MINGW32, UCRT64, CLANG64 ]
  steps:
  - uses: msys2/setup-msys2@v2
    with:
      msystem: ${{matrix.sys}}
      install: >-
        git
        curl
      pacboy: >-
        openssl:p
```

#### platform-check-severity

* Type: `string`
* Allowed values: `warn | fatal`
* Default: `fatal`

By default (`fatal`), throw an error if the runner OS is not Windows.
If set to `warn`, simply log a message and skip the rest:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      platform-check-severity: warn
```

### Outputs

#### msys2-location

The absolute path of the MSYS2 installation location. Example: `D:\a\_temp\msys64` or `C:\msys64`.

```yaml
  - uses: msys2/setup-msys2@v2
    id: msys2
  - env:
      MSYS2_LOCATION: ${{ steps.msys2.outputs.msys2-location }}
    run: echo "$env:MSYS2_LOCATION"
```

Available since v2.24.1

### Advanced Options

These options are rarely needed and shouldn't be used unless there is a good reason.

#### path-type

* Type: `string`
* Allowed values: `minimal | strict | inherit`
* Default: `minimal`

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

This option corresponds to the `MSYS2_PATH_TYPE` setting in MSYS2; hence it can be overridden per step through `env`.
See [msys2/MSYS2-packages: filesystem/profile](https://github.com/msys2/MSYS2-packages/blob/915946a637e1f2b7e26e32782f3af322009293db/filesystem/profile#L28-L45)
for further details about the configuration of each option.

#### cache

* Type: `boolean`
* Default: `true`

By default (`true`), caches various things between runs to make repeated runs faster.

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      cache: false
```

#### location

* Type: `string`
* Default: -

Specify an alternate location where to install MSYS2 to.

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      location: D:\
```

#### release

* Type: `boolean`
* Default: `true`

If `true` (the default) it makes a fresh install of the latest MSYS2 installer release.
If `false` it will try to re-use the [existing MSYS2 installation](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md#msys2) which is part of the official [GitHub Actions Runner Images](https://github.com/actions/runner-images).

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      release: false
```

## Known Problems

### actions/checkout and line endings

In case you use the [actions/checkout](https://github.com/actions/checkout) action in your workflow and haven't configured git attributes for line endings, then git might auto convert your text files in the git repo to Windows line endings, which might lead to problems with tools provided by MSYS2.

To work around this issue disable the auto conversion before running `actions/checkout`:

```yaml
  steps:
  - run: git config --global core.autocrlf input
  - uses: actions/checkout@v4
```
