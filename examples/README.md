# Examples

## CMake

[cmake.yml](cmake.yml) shows how to install the relevant toolchain package for each msystem choice.
See [the MSYS2 documentation](https://www.msys2.org/docs/environments/) for explanations on the different msystem
options available.

See [msys2/msys2.github.io#144](https://github.com/msys2/msys2.github.io/issues/144).

Compared to the GitHub Actions CMake examples/templates
(see [actions/starter-workflows: ci/cmake.yml](https://github.com/actions/starter-workflows/blob/main/ci/cmake.yml)),
`${{github.workspace}}` cannot be used directly for specifying an absolute path.
That is spelled out with backslashes, which don't work as intended when interpreted by the bash shell.
Instead, use either of:

- Use relative paths (the run commands start out with `${{github.workspace}}` as the current working directory anyway).
- Use `cygwin -u` to convert the backslashed into forward slashes.

## PKGBUILD

[PKGBUILD.yml](../.github/workflows/PKGBUILD.yml) is a [Reusable Workflow](https://docs.github.com/en/actions/learn-github-actions/reusing-workflows) to build and test a package in GitHub Actions using a PKGBUILD recipe.
[Tool.yml](../.github/workflows/Tool.yml) shows how to use it from any repo.
As an example, the dummy TOOL in the [pkgbuild](pkgbuild) subdir of this repo is built and tested.
