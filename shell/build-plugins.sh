#!/bin/bash
npm config set strict-ssl false

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

#execiute the build for react
$SCRIPT_DIR/build-plugins-react.sh

#execute the build for angular
$SCRIPT_DIR/build-plugins-angular.sh