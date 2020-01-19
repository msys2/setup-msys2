#!/usr/bin/env sh

set -e

cd $(dirname $0)

#npm ci
#npm run build

if [ "x$1" = "x" ]; then
  echo "a release/branch name is required!"
  exit 1
fi

GIT_USER="$(git config user.name)"
GIT_EMAIL="$(git config user.email)"
GIT_SHA="$(git rev-parse HEAD)"
GIT_ORIGIN="$(git config --get remote.origin.url)"

mkdir dist
cp README.md action.yml index.js dist
cd dist
git init
git checkout --orphan "$1"
git add .
git config --local user.email "$GIT_EMAIL"
git config --local user.name "$GIT_USER"
git commit -a -m "$1 $GIT_SHA"
git remote add origin "$GIT_ORIGIN"
git push origin +"$1"
