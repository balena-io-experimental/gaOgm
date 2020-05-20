const path = require('path')
const twilio = require('twilio')
const express = require('express')

const SERVER_PORT = 80
const DEFAULT_MEET_DURATION = 60 * 60 * 1.5 // In seconds
const BALENA_DEVICE_UUID = process.env.BALENA_DEVICE_UUID
const PUBLIC_URL = `${BALENA_DEVICE_UUID}.balena-devices.com`

// Init twilio client
const VoiceResponse = twilio.twiml.VoiceResponse
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_TOKEN)

// Limit server to only process 1 call. This is not a limitation of the meet-api but:
// 1. Twilio phone number can only be connected to 1 call
// 2. google-assistant can only process 1 call at a time
let currentCallSid = null

console.log(`Starting meet server...`)

const app = express()
app.use(express.json())
app.use('/sounds', express.static(path.join(__dirname, 'sounds')))

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/xml')
  res.send(twimlCall())
})

// join: call this endpoint to have the bot join an ongoing google meet
// The bot will exit any other meeting it's currently on
app.post('/join', async (req, res) => {
  const {
    meetPhone,
    meetPin
  } = req.body

  if (!meetPhone || !meetPin) {
    res.status(500).json({ status: 'error', message: 'Provide meetPhone and meetPin.' })
  }

  try {
    if (currentCallSid) {
      console.log(`Terminating previous call with sid: ${currentCallSid}`)
      await twilioClient.calls(currentCallSid).update({ status: 'completed' })
    }

    const call = await twilioClient.calls.create({
      method: 'GET',
      sendDigits: meetPin,
      url: `http://${PUBLIC_URL}/meet-api/`,
      to: meetPhone,
      from: process.env.TWILIO_PHONE_NUMBER
    })
    currentCallSid = call.sid
    console.log(`New call started with sid: ${currentCallSid}`)
    res.json({ status: 'ok', call })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
})

// ack: call this endpoint to send an ack sound to the meet if a command was successfully executed
// google-assistant makes use of this endpoint
app.post('/ack', async (req, res) => {
  try {
    const call = twilioClient.calls(currentCallSid)
    await call.update({ twiml: twimlReply() })
    res.json({ status: 'ok', call })
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

app.listen(SERVER_PORT, () => console.log(`Server listening at port ${SERVER_PORT}. Public URL: ${PUBLIC_URL}`))

function twimlCall () {
  const response = new VoiceResponse()
  response.say('Google assistant joined the call')
  const start = response.start()
  start.stream({ name: BALENA_DEVICE_UUID, url: `wss://${PUBLIC_URL}/meet-stream` })
  response.pause({ length: DEFAULT_MEET_DURATION })
  response.say('Google assistant left the call')
  return response.toString()
}

function twimlReply () {
  const response = new VoiceResponse()
  const stop = response.stop()
  stop.stream({ name: BALENA_DEVICE_UUID })
  response.play(`https://${PUBLIC_URL}/meet-api/sounds/coin.mp3`)
  const start = response.start()
  start.stream({ name: BALENA_DEVICE_UUID, url: `wss://${PUBLIC_URL}/meet-stream` })
  response.pause({ length: DEFAULT_MEET_DURATION })
  response.say('Google assistant left the call')
  return response.toString()
}