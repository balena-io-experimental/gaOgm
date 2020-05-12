const express = require('express')
const twilio = require('twilio')

const PUBLIC_URL = `${process.env.BALENA_DEVICE_UUID}.balena-devices.com`
const MEET_DURATION = 60 * 60 * 4 // In seconds
const PORT = 80

console.log(`Starting meet server...`)

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/xml')
  res.send(twimlCall())
})

app.post('/join', async (req, res) => {
  const {
    meetPhone,
    meetPin,
    twilioAccountSid,
    twilioAuthToken,
    twilioPhoneNumber
  } = req.body

  try {
    const client = twilio(twilioAccountSid, twilioAuthToken)
    const call = await client.calls.create({
      method: 'GET',
      sendDigits: meetPin,
      url: `http://${PUBLIC_URL}/meet-api/`,
      to: meetPhone,
      from: twilioPhoneNumber
    })
    res.json({ status: 'ok', call })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message })
  }
})

app.post('/reply', async (req, res) => {
  const {
    twilioAccountSid,
    twilioAuthToken,
    twilioCallSid
  } = req.body

  try {
    const client = twilio(twilioAccountSid, twilioAuthToken)
    const call = client.calls(twilioCallSid)
    await call.update({ twiml: twimlReply('this is a reply') })
    res.json({ status: 'ok', call })
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

app.listen(PORT, () => console.log(`Server listening at port ${PORT}`))

function twimlCall () {
  return `
  <Response>
    <Say>Google assistant joined the call</Say>
    <Start>
      <Stream name="google-assistant" url='wss://${PUBLIC_URL}/meet-stream' />
    </Start>
    <Pause length='${MEET_DURATION}' />
    <Say>Google assistant left the call</Say>
  </Response>
  `
}

function twimlReply (message) {
  return `
  <Response>
    <Stop>
      <Stream name="google-assistant" />
    </Stop>
    <Say>'${message}'</Say>
    <Start>
      <Stream name="google-assistant" url='wss://${PUBLIC_URL}/meet-stream' />
    </Start>
    <Pause length='${MEET_DURATION}' />
    <Say>Google assistant left the call</Say>
  </Response>
  `
}