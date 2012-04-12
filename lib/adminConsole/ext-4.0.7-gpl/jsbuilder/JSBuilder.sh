#!/bin/sh
UNAME="$(uname)"
ARGUMENTS=$*
DIRNAME="$(dirname $0)"
if [ $UNAME = "Darwin" ] ; then
    OS="mac"
elif [ ${UNAME%%_*} = "CYGWIN" ] ; then
    OS="win"
elif [ ${UNAME%%32*} = "MINGW" ] ; then
    OS="win"
elif [ ${UNAME%%64*} = "MINGW" ] ; then
    OS="win"
else
    OS="linux"
fi
CMD="$DIRNAME/jsdb/$OS/jsdb -path $DIRNAME $DIRNAME/bin/JSBuilder.js $ARGUMENTS"
$CMD
