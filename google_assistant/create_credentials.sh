#!/bin/bash
set -e

echo "This script will create credentials for your google-assistant device."
echo "Run this script on your development machine, do not run on your edge device!"
echo "Checking requirements: A local python installation is required..."
# TODO: Check python and pip are installed

echo "Checking requirements: GOOGLE_ASSISTANT_CLIENT_SECRET env var is required..."

if [[ -n $GOOGLE_ASSISTANT_CLIENT_SECRET ]]; then
     echo $GOOGLE_ASSISTANT_CLIENT_SECRET > client_secret.json 
else
     echo "In order to create the credentials, you must set the Device Service Variable 'GOOGLE_ASSISTANT_CLIENT_SECRET' to the client secret!"
     exit 1
fi

python3 -m pip install --upgrade google-auth-oauthlib[tool]

echo "---------------------"
echo "Running google-oauthlib-tool"
google-oauthlib-tool --scope https://www.googleapis.com/auth/assistant-sdk-prototype \
                     --scope https://www.googleapis.com/auth/gcm \
                     --credentials credentials.json \
                     --save \
                     --headless \
                     --client-secrets ./client_secret.json


echo "Here is your google auth token. This needs to be set as environment variable GOOGLE_ASSISTANT_CREDENTIALS on your device."
echo "GOOGLE_ASSISTANT_CREDENTIALS='$(cat credentials.json)'"

# Cleanup
rm client_secret.json credentials.json