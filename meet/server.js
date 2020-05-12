const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const twilio = require('twilio')
const PulseAudio = require('pulseaudio2')

const pulse = new PulseAudio()
const PUBLIC_URL = `${process.env.BALENA_DEVICE_UUID}.balena-devices.com`
const PORT = 80

// Get details from twilio account page
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_ACCOUNT_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
}

// Get details from hubot created google meet
const meet = {
  pin: process.env.MEET_PIN,
  phoneNumber: process.env.MEET_PHONE_NUMBER
}

console.log(`Starting meet server...`)
console.log(`Twilio config:`)
console.log(`- Account SID: ${twilioConfig.accountSid}`)
console.log(`- Auth token: ${twilioConfig.authToken}`)
console.log(`- Phone number: ${twilioConfig.phoneNumber}`)
console.log(`Meet config:`)
console.log(`- Phone number: ${meet.phoneNumber}`)
console.log(`- PIN: ${meet.pin}`)

// Create web server
const app = express()
const server = http.createServer(app)

// // Handle Web Socket Connection
const wss = new WebSocket.Server({ server })
wss.on('connection', function connection (ws) {
  console.log('New Connection Initiated')

  let play
  ws.on('message', function incoming (message) {
    const msg = JSON.parse(message)
    console.log(msg)
    switch (msg.event) {
      case 'connected':
        console.log(`A new call has connected.`)
        if (play) play.end()
        play = pulse.createPlaybackStream({
          channels: 1,
          rate: 8000,
          format: 'ULAW',
        })
        break
      case 'start':
        console.log(`Starting Media Stream ${msg.streamSid}`)
        break
      case 'media':
        play.write(Buffer.from(msg.media.payload, 'base64'))
        break
      case 'stop':
        console.log(`Call Has Ended`)
        play.end()
        // pulse.end()
        break
    }
  })

  ws.on('error', function (error) {
    console.log(error)
  })

})

//Handle HTTP Requests
const pause = 60 * 60 * 4
let sid = null
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/xml')
  res.send(`
  <Response>
    <Say>I will stream the next ${pause} seconds of audio through your websocket</Say>
    <Start>
      <Stream name="my_first_stream" url='wss://${PUBLIC_URL}' />
    </Start>
    <Pause length='${pause}' />
    <Say>I will close the stream now</Say>
  </Response>`)
})

app.post('/join', async (req, res) => {
  console.log('Making the call...')
  try {
    const client = twilio(twilioConfig.accountSid, twilioConfig.authToken)
    const call = await client.calls.create({
      method: 'GET',
      sendDigits: meet.pin,
      url: `http://${PUBLIC_URL}`,
      to: meet.phoneNumber,
      from: twilioConfig.phoneNumber
    })
    res.json({ status: 'ok', call })
    sid = call.sid
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
})

app.post('/reply', async (req, res) => {
  try {
    const client = twilio(twilioConfig.accountSid, twilioConfig.authToken)
    const call = await client.calls(sid)
    await call.update({
      twiml: `<Response>
      <Stop>
        <Stream name="my_first_stream" />
      </Stop>
      <Say>Ahoy there</Say>
      <Start>
      <Stream name="my_first_stream" url='wss://${PUBLIC_URL}' />
    </Start>
    <Pause length='${pause}' />
    <Say>I will close the stream now</Say>
    </Response>`})
  } catch (error) {
    console.log(error)
  }
})

console.log(`Listening at Port ${PORT}. Public URL: ${PUBLIC_URL}`)
server.listen(PORT)