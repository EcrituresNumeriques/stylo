#!/bin/sh
echo "{\
 \"backendEndpoint\": \"${SNOWPACK_PUBLIC_BACKEND_ENDPOINT}\",\
 \"graphqlEndpoint\": \"${SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT}\",\
 \"exportEndpoint\": \"${SNOWPACK_PUBLIC_EXPORT_ENDPOINT}\",\
 \"processEndpoint\": \"${SNOWPACK_PUBLIC_PROCESS_ENDPOINT}\",\
 \"humanIdRegisterEndpoint\": \"${SNOWPACK_PUBLIC_HUMAN_ID_REGISTER_ENDPOINT}\"\
 }" > /usr/share/nginx/html/config.json

nginx -g daemon off;
