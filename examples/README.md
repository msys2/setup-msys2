# Examples

## CMake

[cmake.yml](cmake.yml) shows how to install the relevant toolchain package for each msystem choice.
See [the MSYS2 documentation](https://www.msys2.org/docs/environments/) for explanations on the different msystem
options available.

Compared to the GitHub Actions CMake examples/templates
(see [actions/starter-workflows: ci/cmake.yml](https://github.com/actions/starter-workflows/blob/main/ci/cmake.yml)),
`${{github.workspace}}` cannot be used directly for specifying an absolute path.
That is spelled out with backslashes, which don't work as intended when interpreted by the bash shell.
Instead, use either of:

- Use relative paths (the run commands start out with `${{github.workspace}}` as the current working directory anyway).
- Use `cygwin -u` to convert the backslashed into forward slashes.

## PKGBUILD

[pkgbuild.yml](pkgbuild.yml) shows how to build and test a package using a PKGBUILD recipe.
