#!/bin/bash

if [[ -z $TWILIO_ACCOUNT_SID ]]; then
    echo "ERROR: The device service variable 'TWILIO_ACCOUNT_SID' is not set. This variable must be set for this service to run."
    exit 1
fi

if [[ -z $TWILIO_ACCOUNT_TOKEN ]]; then
    echo "ERROR: The device service variable 'TWILIO_ACCOUNT_TOKEN' is not set. This variable must be set for this service to run."
    exit 1
fi

if [[ -z $TWILIO_PHONE_NUMBER ]]; then
    echo "ERROR: The device service variable 'TWILIO_PHONE_NUMBER' is not set. This variable must be set for this service to run."
    exit 1
fi

node server.js