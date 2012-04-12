#!/bin/sh
UNAME="$(uname)"
ARGUMENTS=$*
DIRNAME="$(dirname $0)/lib/JSBuilder"
if [ $UNAME = "Darwin" ] ; then
    OS="mac"
else
    OS="linux"
fi
CMD="$DIRNAME/jsdb/$OS/jsdb -path $DIRNAME $DIRNAME/bin/Dispatch.js $ARGUMENTS"
$CMD
