#!/usr/bin/env sh

ANSI_RED="\033[31m"
ANSI_CYAN="\033[36;1m"
ANSI_NOCOLOR="\033[0m"

run_cmd() {
  printf "${ANSI_CYAN}"
  echo "$@"
  printf "${ANSI_NOCOLOR}"
  "$@"
}

run_cmd uname -a

env | run_cmd grep MSYSTEM

if [ "x$MSYSTEM" != "xMSYS" ]; then
  env | run_cmd grep MINGW
fi

if [ "x$MSYSTEM" != "x$1" ]; then
  printf "${ANSI_RED}Error MSYSTEM: '$MSYSTEM' != '$1'${ANSI_NOCOLOR}\n"
  exit 1
fi
