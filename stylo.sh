#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

case "$1" in
"deploy")  echo "Deploy stylo platform"
    sudo docker-compose up -d
    ;;
"install")  echo  "install"
    sudo npm install -g pm2
    cd $SCRIPTPATH
    cd sails
    npm install
    cd $SCRIPTPATH
    cd front
    npm install
    ;;
"dev")  echo  "dev environment"
    cd $SCRIPTPATH
    cd sails
    pm2 start app.js  --watch
    chromium-browser "http://localhost:8000" &
    cd $SCRIPTPATH
    cd front
    npm run start
    ;;
  "rebuild") echo "cleaning images + building"
   cd $SCRIPTPATH
   sudo docker rmi $(sudo docker images --filter dangling=true)
   git pull
   sudo docker-compose build
   sudo docker-compose up
   ;;
*) echo "Usage: $0 deploy|rebuild|install|dev"
   ;;
esac
