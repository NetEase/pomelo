#!/bin/sh

CURRENT_DIR="$(dirname $0)"

${CURRENT_DIR}/bin/mac/phantomjs ${CURRENT_DIR}/build-custom-jsb3.js $*
