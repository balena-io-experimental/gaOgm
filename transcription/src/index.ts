import * as recorder from 'node-record-lpcm16'
import { Writable } from 'stream'
import {
  AudioEncoding,
  InfiniteStreamingRecognize
} from './recognize'

let recognizeStream = new InfiniteStreamingRecognize({
  config: {
    encoding: AudioEncoding.LINEAR16,
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    useEnhanced: true,
    model: 'video',
    enableAutomaticPunctuation: true,
    speechContexts: [{
      phrases: [
        'balena',
        'balenaOS',
        'balenaCloud',
        'balenaEtcher',
        'etcher'
      ]
    }]
  },
  interimResults: false
})

const audioInputStreamTransform = new Writable({
  write(chunk, _encoding, next) {
    recognizeStream.write(chunk)
    next()
  },
  final() {
    recognizeStream.end()
  }
})

// Start recorder and stream recognizer
recorder
  .record({
    sampleRateHertz: 16000,
    threshold: 0,
    silence: 1000
  })
  .stream()
  .on('error', err => {
    console.error('Audio recording error ' + err);
  })
  .pipe(audioInputStreamTransform)

recognizeStream.start()

console.log('=========================================================')
console.log('Transcription service started, press Ctrl+C to stop...')
console.log('=========================================================')