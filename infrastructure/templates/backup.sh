#!/bin/bash

timestamp=$(date '+%Y%m%d-%H%M%S')
docker exec mongodb-stylo sh -c 'mongodump --gzip --archive --db {{ mongo_server_db }}' > "{{ mongo_backup_path }}/{{ mongo_server_db }}--${timestamp}.bson.gz"
