#!/bin/bash
echo "Build React Plugins For Ameripharma"
#prepare variables
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="nx-react-singlespa"
FILE_TGZ="nx-react-sspa.tgz"

# remove extra files
cd $PROJECT_ROOT

if [ -f ./package-lock.json ]; then
    rm -rf package-lock.json
fi

if [ -f ./yarn.lock ]; then
    rm -rf yarn.lock
fi

if [ -f ./${FILE_TGZ} ]; then
    rm -rf ./${FILE_TGZ}
fi

# Build the project
nx build $PROJECT_NAME

# Pack the built project
cd $PROJECT_ROOT/dist/packages/$PROJECT_NAME
yarn pack --filename ${FILE_TGZ}
# Check if the tarball file is created
if [ -f ./${FILE_TGZ} ]; then
    echo "Tarball file created: ${FILE_TGZ}"
else
    echo "Failed to create tarball file: ${FILE_TGZ}"
    exit 1
fi
# Add the tarball file
yarn add file:$PROJECT_ROOT/dist/packages/${PROJECT_NAME}/${FILE_TGZ}

#clean up
rm -rf $PROJECT_ROOT/dist/packages/${PROJECT_NAME}/${FILE_TGZ}