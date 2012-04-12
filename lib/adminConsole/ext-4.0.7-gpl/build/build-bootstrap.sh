CURRENT_DIR="$(dirname $0)"
cd ${CURRENT_DIR}

JSBUILDER_PATH="../jsbuilder/JSBuilder.sh"

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
BUILD_BOOTSTRAP_DATA_CMD="${JSDB_PATH}/jsdb build-bootstrap-data.js ../bootstrap ${OS}"

${BUILD_BOOTSTRAP_DATA_CMD}
