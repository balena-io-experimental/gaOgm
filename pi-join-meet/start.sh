#!/bin/bash

export PULSE_SERVER=127.0.0.1
export PULSE_SINK="GMeetOUT" 
export PULSE_SOURCE="GMeetIN.monitor" 

# This works
# export PULSE_SOURCE="sine_input"

npm start