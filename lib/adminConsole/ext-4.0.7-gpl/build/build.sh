#!/bin/sh

USAGE="Usage: ./build.sh DEPLOY_DIR [TYPE]

The type option can be one of the following:
sdk             - Build the whole Ext SDK
sass            - Build css files. Assumes compass is installed
bootstrap-data  - Build bootstrap data
tests           - Build test indexes"

CURRENT_DIR="$(dirname $0)"
DEPLOY_DIR="$1"
BUILD_OPTION="$2"

cd ${CURRENT_DIR}

JSBUILDER_PATH="../jsbuilder/JSBuilder.sh"
BUILD_SDK_CMD="${JSBUILDER_PATH} --projectFile sdk.jsb3 --deployDir ${DEPLOY_DIR} --verbose"
BUILD_SASS="compass compile ../resources/sass -f"
BUILD_TESTS="./build-tests.sh"

# Build Ext.Loader paths to platform for dynamic loading
UNAME="$(uname)"
ARGUMENTS=$*
JSBUILDER_DIRNAME="$(dirname $JSBUILDER_PATH)"
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
JSDB_PATH="${JSBUILDER_DIRNAME}/jsdb/${OS}"
BUILD_BOOTSTRAP_DATA_CMD="${JSDB_PATH}/jsdb build-bootstrap-data.js ${DEPLOY_DIR} ${OS}"

# error checking
if [ -z ${DEPLOY_DIR} ] ; then
    IFS='%'
    echo ${USAGE}
    unset IFS
    exit 1
fi

if [ -z ${BUILD_OPTION} ] ; then
    # empty second arg, build sdk/all
    ${BUILD_SDK_CMD}

    CUSTOM_BUILD_EXAMPLES="app/simple app/feed-viewer app/nested-loading portal desktop"

    for CUSTOM_BUILD_EXAMPLE in $CUSTOM_BUILD_EXAMPLES
        do
            echo "Processing custom build: ${CUSTOM_BUILD_EXAMPLE}..."
            ${JSBUILDER_PATH} --projectFile ../examples/${CUSTOM_BUILD_EXAMPLE}/app.jsb3 --deployDir ${DEPLOY_DIR}/examples/${CUSTOM_BUILD_EXAMPLE} --verbose
    done

    # I know this is dirty but there's no other way to automate this
    # JSBuilder does not support file moving
    MVC_EXAMPLES="simple feed-viewer nested-loading"
    for MVC_EXAMPLE_NAME in $MVC_EXAMPLES
        do
            echo "Processing MVC example: ${MVC_EXAMPLE_NAME}..."
            mv -f ${DEPLOY_DIR}/examples/app/${MVC_EXAMPLE_NAME}/${MVC_EXAMPLE_NAME}-release.html ${DEPLOY_DIR}/examples/app/${MVC_EXAMPLE_NAME}/${MVC_EXAMPLE_NAME}.html
    done

    # Portal example
    echo "Processing Portal example..."
    mv -f ${DEPLOY_DIR}/examples/portal/portal-release.html ${DEPLOY_DIR}/examples/portal/portal.html

    # Portal example
    echo "Processing Desktop example..."
    mv -f ${DEPLOY_DIR}/examples/desktop/desktop-release.html ${DEPLOY_DIR}/examples/desktop/desktop.html

else
    # Check second arg is valid, build it
    if [ ${BUILD_OPTION} = "sdk" ] ; then
        ${BUILD_SDK_CMD}
    elif [ ${BUILD_OPTION} = "ext-all" ] ; then
        echo "There's no longer a separate ext-all build, simply build sdk instead"
    elif [ ${BUILD_OPTION} = "sass" ] ; then
        ${BUILD_SASS}
    elif [ ${BUILD_OPTION} = "bootstrap-data" ] ; then
		echo "[HINT] You can simply execute `build-bootstrap.sh` instead for convenience"
        ${BUILD_BOOTSTRAP_DATA_CMD}

    elif [ ${BUILD_OPTION} = "tests" ] ; then
		echo "[HINT] You can simply execute build-tests.sh instead for convenience"
        ${BUILD_TESTS}
    else
        IFS='%'
        echo ${USAGE}
        unset IFS
        exit 1
    fi
fi
