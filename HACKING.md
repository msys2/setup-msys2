## Development

The steps to publish a new release are the following:

```sh
# Remove/clean everything
git clean -xfd

# Create a clone of this repo under "release" with all the new commits/tags
./release.sh v2.x.x

# Review and push to the remote
cd release
git push
git push --tags
git push origin +v2

# Fetch the new changed major version tag
cd ..
git fetch origin --tags --force

# Create a new GH release named "v2.x.x" from the release tag
# https://github.com/msys2/setup-msys2/releases/new?tag=v2.x.x
# Copy over the changelog entry to the GH release and set as latest release
```

> NOTE: tag `tag-for-git-describe` is used for testing `git describe --dirty --tags` in CI. See [actions/checkout#250](https://github.com/actions/checkout/issues/250).
