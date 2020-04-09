#!/bin/bash

if [[ -z $TWILIO_ACCOUNT_SID ]]; then
    echo "ERROR: The device service variable 'TWILIO_ACCOUNT_SID' is not set.  This variable must be set for the service 'meet'"
    exit 1
fi

if [[ -z $TWILIO_ACCOUNT_TOKEN ]]; then
    echo "ERROR: The device service variable 'TWILIO_ACCOUNT_TOKEN' is not set.  This variable must be set for the service 'meet'"
    exit 1
fi

if [[ -z $TWILIO_PHONE_NUMBER ]]; then
    echo "ERROR: The device service variable 'TWILIO_PHONE_NUMBER' is not set.  This variable must be set for the service 'meet'"
    exit 1
fi

if [[ -z $MEET_PIN ]]; then
    echo "ERROR: The device service variable 'MEET_PIN' is not set.  This variable must be set for the service 'meet'"
    exit 1
fi

if [[ -z $MEET_PHONE_NUMBER ]]; then
    echo "ERROR: The device service variable 'MEET_PHONE_NUMBER' is not set.  This variable must be set for the service 'meet'"
    exit 1
fi

node server.js