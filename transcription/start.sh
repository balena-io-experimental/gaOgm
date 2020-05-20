#!/bin/bash

CREDENTIALS_FILE=/usr/src/credentials.json

if [[ -z $GOOGLE_SPEECH_CREDENTIALS ]]; then
    echo "ERROR: The device service variable 'GOOGLE_SPEECH_CREDENTIALS' is not set. This variable must be set for this service to run."
    exit 1
fi

echo $GOOGLE_SPEECH_CREDENTIALS > $CREDENTIALS_FILE

exec env GOOGLE_APPLICATION_CREDENTIALS=$CREDENTIALS_FILE node /usr/src/build/index.js