#!/usr/bin/env bash

# README
# *=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*
# This script is used to run the Postfix Quartz
# documentation site locally for development and
# testing purposes. It creates all of the necessary
# build artifacts and serves the site on a specified
# port (default port is set to 8081).
#
# In order for this script to work, you must have the
# necessary prerequisites installed, please check
# the README.md file for more information.
#
# Current File: run.sh
# *=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*

PORT=8081
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

info "Running Postfix Docs Locally on http://localhost:$PORT"
npx quartz build --serve --port $PORT
