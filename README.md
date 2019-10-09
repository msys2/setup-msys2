# Setup MSYS2

**setup-msys2** is a JavaScript GitHub Action (GHA) to setup a full-featured [MSYS2](https://www.msys2.org/) environment, using the GHA [toolkit](https://github.com/actions/toolkit).

The latest tarball available at [repo.msys2.org/distrib/x86_64](http://repo.msys2.org/distrib/x86_64/) is cached. Using the action extracts it and provides an entrypoint named `msys2do`.

## Usage

```yaml
  - uses: numworks/setup-msys2@v1
  - run: msys2do uname -a
```

By default, `MSYSTEM` is set to `MINGW64`. However, an optional parameter named `msystem` is supported, which expects `MSYS`, `MINGW64` or `MING32`. For example:

```yaml
  - uses: numworks/setup-msys2@v1
    with:
      msystem: MSYS
```

Furthermore, the environment variable can be overriden. This is useful when multiple commands need to be executed in different contexts. For example, in order to build a PKGBUILD file and then test the installed artifact:

```yaml
  - uses: numworks/setup-msys2@v1
    with:
      msystem: MSYS
  - run: msys2do makepkg-mingw -sCLfc --noconfirm --noprogressbar
  - run: msys2do pacman --noconfirm -U mingw-w64-*-any.pkg.tar.xz
  - run: |
      set MSYSTEM=MINGW64
      msys2do <command to test the package>
```
