#!/bin/sh

CURRENT_DIR="$(dirname $0)"
CMD="${CURRENT_DIR}/build-custom.sh"

echo "Building examples/app/simple/app.jsb3"
${CMD} ${CURRENT_DIR}/../examples/app/simple/simple.html ${CURRENT_DIR}/../examples/app/simple/app.jsb3

echo "Building examples/app/nested-loading/app.jsb3"
${CMD} ${CURRENT_DIR}/../examples/app/nested-loading/nested-loading.html ${CURRENT_DIR}/../examples/app/nested-loading/app.jsb3

echo "Building examples/app/feed-viewer/app.jsb3"
${CMD} ${CURRENT_DIR}/../examples/app/feed-viewer/feed-viewer.html ${CURRENT_DIR}/../examples/app/feed-viewer/app.jsb3

echo "Building examples/portal/app.jsb3"
${CMD} ${CURRENT_DIR}/../examples/portal/portal.html ${CURRENT_DIR}/../examples/portal/app.jsb3

echo "Building examples/desktop/app.jsb3"
${CMD} ${CURRENT_DIR}/../examples/desktop/desktop.html ${CURRENT_DIR}/../examples/desktop/app.jsb3

echo "Building sdk.jsb3"
${CMD} --target=packages[3].files ${CURRENT_DIR}/all.html ${CURRENT_DIR}/sdk.jsb3
