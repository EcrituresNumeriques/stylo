#!/bin/bash
case "$1" in

"deploy")  echo "Deploy stylo platform"
    docker-compose up
    ;;
"install")  echo  "install"
    ;;
"dev")  echo  "dev environment"
    ;;
*) echo "Usage: $0 deploy|install|dev"
   ;;
esac
