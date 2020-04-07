#!/bin/bash

source /env/bin/activate 
google-oauthlib-tool --scope https://www.googleapis.com/auth/assistant-sdk-prototype \
                     --scope https://www.googleapis.com/auth/gcm \
                     --save --headless --client-secrets /client_secret.json 

echo "The credentials ="
cat /root/.config/google-oauthlib-tool/credentials.json
echo ""
echo ""
echo "This script will now attempt to restart the google_assistant..."

curl --header "Content-Type:application/json" "$BALENA_SUPERVISOR_ADDRESS/v2/applications/$BALENA_APP_ID/restart-service?apikey=$BALENA_SUPERVISOR_API_KEY" \
     --data '{"serviceName": "google_assistant"}'