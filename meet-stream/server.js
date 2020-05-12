const WebSocket = require('ws')
const PulseAudio = require('pulseaudio2')

const pulse = new PulseAudio()
const WEBSOCKET_PORT = 80
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT })

wss.on('connection', function connection (ws) {
  let playback

  ws.on('message', function incoming (message) {
    const msg = JSON.parse(message)

    switch (msg.event) {
      case 'connected':
        console.log(`A new call has connected...`)

        // Close any open stream and start a new one
        if (playback) playback.end()
        playback = pulse.createPlaybackStream({
          channels: 1,
          rate: 8000,
          format: 'ULAW',
        })
        break
      case 'start':
        console.log(`Media stream started: ${msg.streamSid}`)
        break
      case 'media':
        playback.write(Buffer.from(msg.media.payload, 'base64'))
        break
      case 'stop':
        console.log(`Media stream stopped`)
        playback.end()
        break
    }
  })

  ws.on('error', function (error) {
    console.log(error)
    playback.end()
  })

})

console.log(`Websocket server listening at port ${WEBSOCKET_PORT}`)