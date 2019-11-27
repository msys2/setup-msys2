#!/usr/bin/env sh

uname -a

env | grep MSYS

if [ "x$MSYSTEM" != "x$1" ]; then
  echo "Error MSYSTEM: '$MSYSTEM' != '$1'"
  exit 1
fi
