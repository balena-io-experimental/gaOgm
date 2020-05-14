#!/bin/bash

CREDENTIALS_FILE_PATH=/root/.config/google-oauthlib-tool
CREDENTIALS_FILE="$CREDENTIALS_FILE_PATH"/credentials.json

if [[ -z $GOOGLE_ASSISTANT_DEVICE_MODEL_ID ]]; then
    echo "ERROR: The device service variable 'GOOGLE_ASSISTANT_DEVICE_MODEL_ID' is not set.  This variable must be set for the service 'google_assistant'"
    echo "Get the value from Google's developer portal."
    exit 1
fi

if [[ -z $GOOGLE_ASSISTANT_PROJECT_ID ]]; then
    echo "ERROR: device service variable 'GOOGLE_ASSISTANT_PROJECT_ID' is not set.  This variable must be set for the service 'google_assistant'"
    echo "Get the value from Google's developer portal."
    exit 1
fi

if [[ -z $GOOGLE_ASSISTANT_CREDENTIALS ]]; then
    echo "ERROR: device service variable 'GOOGLE_ASSISTANT_CREDENTIALS' is not set.  This variable must be set for the service 'google_assistant'"
    echo "Run create-credentials.sh script on your development machine to generate it."
    exit 1
fi

mkdir -p $CREDENTIALS_FILE_PATH
echo $GOOGLE_ASSISTANT_CREDENTIALS > $CREDENTIALS_FILE

echo "Starting hotword detection ..."
python hotword.py --project-id $GOOGLE_ASSISTANT_PROJECT_ID --device-model-id $GOOGLE_ASSISTANT_DEVICE_MODEL_ID
