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
./release.sh v2.x.x

# Fetch the new branch and checkout it
git fetch --all
git checkout -b tmp origin/v2.x.x

# Reset the 'rolling' tag to the just released branch
git tag -d v2
git tag v2
git push origin +v2

# Remove the temporal branch
git checkout main
git branch -D tmp
```

> NOTE: although it feels unidiomatic having 'rolling' tags and/or storing release assets in specific branches, it is the recommended solution. Retrieving assets from GitHub Releases is not supported by GitHub Actions (yet). See [actions/javascript-action: Create a release branch](https://github.com/actions/javascript-action#create-a-release-branch), [actions/toolkit: docs/action-versioning.md](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md) and [actions/toolkit#214](https://github.com/actions/toolkit/issues/214).

> NOTE: tag `tag-for-git-describe` is used for testing `git describe --dirty --tags` in CI. See [actions/checkout#250](https://github.com/actions/checkout/issues/250).
