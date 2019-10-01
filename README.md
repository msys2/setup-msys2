# Setup msys2

This is a GitHub action to setup an msys2 environment

In actions.yml:

```
steps:
  - uses: numworks/setup-msys2@v1
  - run: msys2do uname -a
```
