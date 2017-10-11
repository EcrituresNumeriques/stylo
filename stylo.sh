#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

case "$1" in
"deploy")  echo "Deploy stylo platform"
    docker-compose up
    ;;
"install")  echo  "install"
    npm install -g pm2
    ;;
"dev")  echo  "dev environment"
    cd $SCRIPTPATH
    cd sails
    pm2 start app.js
    chromium-browser "http://localhost:3000"
    cd $SCRIPTPATH
    cd front
    npm run start

    ;;
*) echo "Usage: $0 deploy|install|dev"
   ;;
esac
