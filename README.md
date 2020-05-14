# Google Assistant on Google Meet

Google Assistant bot that joins your Google Meet and listens for commands.

## Installation

1. Deploy to a balena device and enable Public URL for it.
2. Register for a twilio account and create a project.
3. Set environment variables:

| Env var | Description |
| ----- | ----- |
| TWILIO_ACCOUNT_SID | Account SID for the twilio project. Get it from https://www.twilio.com/console |
| TWILIO_ACCOUNT_TOKEN | Auth token for the twilio project. Get it from https://www.twilio.com/console |
| TWILIO_PHONE_NUMBER | Phone number registered in twilio. Get it here: https://www.twilio.com/console/phone-numbers/incoming |
| GOOGLE_ASSISTANT_PROJECT_ID | See: https://developers.google.com/assistant/sdk/guides/library/python/embed/config-dev-project-and-account |
| GOOGLE_ASSISTANT_DEVICE_MODEL_ID | See: https://developers.google.com/assistant/sdk/guides/library/python/embed/config-dev-project-and-account |
| GOOGLE_ASSISTANT_CREDENTIALS | String with credentials in JSON format. Run `google-assistant/create-credentials.sh` in your development machine to get it |

## Usage

To have the bot join a call you need to send a POST request to the following endpoint:

`https://<DEVICE_UUID>.balena-devices.com/meet-api/join`

Include the following parameters on a JSON body:

- meetPhone: Google Meet phone number. i.e: +1234-567-1234
- meetPin: PIN number for the meet. ie: 7962456655321#

Both can be obtained from the meeting details.


## Commands

Currently commands don't do much, you only get an ack reply in the form of a short audio cue. 
Command examples:

`ok google, start new meeting`

`ok google, add highlight <highlight>`

`ok google, new section`

`ok google, new item`


## Limitations

**Cost $$$**

Usage of the twilio platform incurs charges:
- A registered twilio phone number which costs about $1/month for a US number.
- Processing fees amounting to $1.02/hour of call.

This processing fees are charged by minute, with the following breakdown:
- [Outbound Voice](https://www.twilio.com/voice/pricing/us): $ 0.0130/ min
- [Media streams](https://www.twilio.com/media-streams): $0.004 / min

**Each device can only process one call at a time**

Some limitations that could be easily solved:
- Twilio phone numbers can only be connected to one call at a time. Fixed by buying more phone numbers.
- Pulseaudio currently has only one sink where all audio is sent. Could be expanded to allow for dynamically created sinks so that each audio stream would be routed to a different sink.

While the above limitations could be easily solved there is a bigger issue. Google assistant instances can only process one stream at a time. In order to have multiple calls on a single device we would need to scale `google-assistant` instances and figure out a way of associating them univocally to the media stream source.

**Twilio media streams**

The project uses twilio media streams to stream the audio from the call back to a Raspberry Pi. This streaming has a few notable inconveniences which are summarized here:
- Media streams are not bi-directional, they can only stream *outbound* live audio. There is a workaround for inbound audio but it only allows playing back mp3 files or text-to-speech.
- It takes several seconds for the audio to reach the Raspberry Pi, usually ranging from 3 to 6 seconds. This is good enough for command procesing but not for having a conversation with the assistant (though uni-directional media streams are a bigger challenge in this regard).
- When creating a media stream you need to specify the exact amount of time you want it to be open. This is not a big issue though, there is no documented maximum time streams can be functional and twilio calls will drop after 60 seconds of inactivity/silence. 


