<p align="center">
  <a title="msys2.github.io" href="https://msys2.github.io"><img src="https://img.shields.io/website.svg?label=msys2.github.io&longCache=true&style=flat-square&url=http%3A%2F%2Fmsys2.github.io%2Findex.html&logo=github"></a><!--
  -->
  <a title="Join the chat at https://gitter.im/msys2/msys2" href="https://gitter.im/msys2/msys2"><img src="https://img.shields.io/badge/chat-on%20gitter-4db797.svg?longCache=true&style=flat-square&logo=gitter&logoColor=e8ecef&label=Chat"></a><!--
  -->
  <a title="'Test' workflow Status" href="https://github.com/msys2/setup-msys2/actions/workflows/Test.yml"><img alt="'Test' workflow Status" src="https://img.shields.io/github/workflow/status/msys2/setup-msys2/Test/main?longCache=true&style=flat-square&label=Test&logo=github"></a><!--
  -->
  <a title="'Example PKGBUILD' workflow Status" href="https://github.com/msys2/setup-msys2/actions/workflows/Tool.yml"><img alt="'Example PKGBUILD' workflow Status" src="https://img.shields.io/github/workflow/status/msys2/setup-msys2/Tool/main?longCache=true&style=flat-square&label=Example%20PKGBUILD&logo=github"></a><!--
  -->
</p>

# Setup MSYS2

**setup-msys2** is a JavaScript GitHub Action (GHA) to setup an [MSYS2](https://www.msys2.org/) environment (i.e. MSYS,
MINGW32, MINGW64, UCRT64, CLANG32, and/or CLANG64 shells) using the GHA [toolkit](https://github.com/actions/toolkit) for
automatic caching.

## Context

[MSYS2](https://www.msys2.org/) is available by default on the [windows-latest](https://github.com/actions/virtual-environments/blob/main/images/win/Windows2019-Readme.md#msys2)
[virtual environment](https://github.com/actions/virtual-environments) for GitHub Actions, located at `C:\msys64`.
However, there are some caveats with using the default installation as-is:

- It is updated every ~10 days.
- Caching of installation packages is not supported.
- MSYS2/MINGW are neither added to the PATH nor available as a custom `shell` option.
- On versions older than `windows-2022`, it includes a non-negligible set of pre-installed packages. As a result, update time can be up to 10 min (see [actions/virtual-environments#1572](https://github.com/actions/virtual-environments/issues/1572)).

**setup-msys2** works around those constraints:

- Using option `release: false`, the default installation is used, but automatic caching is supported and a custom
entrypoint is provided.
- By default (`release: true`), **setup-msys2** downloads and extracts the latest tarball available at [repo.msys2.org/distrib/x86_64](http://repo.msys2.org/distrib/x86_64/),
a clean and up-to-date environment is set up in a temporary location, and a custom entrypoint (`msys2`) is provided.
Hence, the overhead of updating pre-installed but unnecessary packages is avoided.

Therefore, usage of this Action is recommended to all MSYS2 users of GitHub Actions, since caching and the custom
entrypoint are provided regardless of option `release`.

NOTE: in the future, `bash` might default to MSYS2 (see [actions/virtual-environments#1525](https://github.com/actions/virtual-environments/issues/1525)).

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
  - uses: actions/checkout@v3
  - run: git describe --dirty
```

Note that setting `autocrlf` is required in specific use cases only.
See [actions/checkout#250](https://github.com/actions/checkout/issues/250).

### Build matrix

It is common to test some package/tool on multiple environments, which typically requires installing different sets of
packages through option `install`.
GitHub Actions' `strategy` and `matrix` fields allow to do so, as explained in [docs.github.com: Configuring a build matrix](https://docs.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow#configuring-a-build-matrix)
and [docs.github.com: `jobs.<job_id>.strategy.matrix`](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix).
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

Furthermore, [.github/workflows/PKGBUILD.yml](.github/workflows/PKGBUILD.yml) is a [Reusable Workflow](https://docs.github.com/en/actions/learn-github-actions/reusing-workflows)
to build and test a package in GitHub Actions using a PKGBUILD recipe.
It can be used along with [matrix](./matrix) (a [Composite Action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)),
as shown in [.github/workflows/Tool.yml](.github/workflows/Tool.yml).

Note: By default, GitHub Actions terminates any running jobs if any job in matrix
fails. This default behavior can be disabled by setting `fail-fast: false` in
strategy section. See
[docs.github.com: `jobs.<job_id>.strategy.fail-fast`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idstrategyfail-fast)
for more details.

Find similar patterns in the following workflows:

- [examples/cmake.yml](examples/cmake.yml)
- [msys2/MINGW-packages: .github/workflows/main.yml](https://github.com/msys2/MINGW-packages/blob/master/.github/workflows/main.yml)

Find further details at [#171](https://github.com/msys2/setup-msys2/issues/171#issuecomment-961458598) and [#102](https://github.com/msys2/setup-msys2/issues/102).

### Options

#### msystem

By default, `MSYSTEM` is set to `MINGW64`. However, an optional parameter named `msystem` is supported, which expects
`MSYS`, `MINGW64`, `MINGW32`, `UCRT64`, `CLANG32` or `CLANG64`.
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
The package or list of packages are installed through `pacman --noconfirm -S --needed --overwrite *`.

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      update: true
      install: >-
        git
        base-devel
```

#### pacboy

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
        base-devel
      pacboy: >-
        openssl:p
```

#### release

By default (`true`), retrieve and extract base installation from upstream GitHub Releases.
If set to `false`, the installation available in the virtual environment is used:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      release: false
```

#### location

Specify the location where to install msys2:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      location: D:\
```

#### platform-check-severity

By default (`fatal`), throw an error if the runner OS is not Windows.
If set to `warn`, simply log a message and skip the rest:

```yaml
  - uses: msys2/setup-msys2@v2
    with:
      platform-check-severity: warn
```
