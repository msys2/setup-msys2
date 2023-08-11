#!/usr/bin/env sh

set -e

cd $(dirname $0)

if [ "x$1" = "x" ]; then
  echo "a release tag name is required!"
  exit 1
fi

GIT_USER="$(git config user.name)"
GIT_EMAIL="$(git config user.email)"
GIT_SHA="$(git rev-parse HEAD)"
GIT_ORIGIN="$(git config --get remote.origin.url)"

# build
rm -Rf node_modules
npm ci
npm run pkg

# add new release to dist branch and tag it
rm -Rf release
git clone "$GIT_ORIGIN" release
cd release
git checkout dist
rm -Rf ./*
cp -R ../dist/* ./
git add .
git config --local user.email "$GIT_EMAIL"
git config --local user.name "$GIT_USER"
git commit -a -m "$1 $GIT_SHA"
git tag "$1"
git tag -d "v2"
git tag "v2"
