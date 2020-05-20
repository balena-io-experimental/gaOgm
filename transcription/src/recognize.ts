import { v1p1beta1 } from "@google-cloud/speech" // Currently, only v1p1beta1 contains result-end-time

type SpeechClient = v1p1beta1.SpeechClient

export enum AudioEncoding {
  ENCODING_UNSPECIFIED = 'ENCODING_UNSPECIFIED',
  LINEAR16 = 'LINEAR16',
  FLAC = 'FLAC',
  MULAW = 'MULAW',
  AMR = 'AMR',
  AMR_WB = 'AMR_WB',
  OGG_OPUS = 'OGG_OPUS',
  SPEEX_WITH_HEADER_BYTE = 'SPEEX_WITH_HEADER_BYTE',
  MP3 = 'MP3'
}

interface RecognitionConfig {
  encoding: AudioEncoding,
  sampleRateHertz: number,
  languageCode: string,
  useEnhanced?: boolean,
  model?: string,
  enableAutomaticPunctuation?: boolean,
  speechContexts?: SpeechContext[]
}

interface SpeechContext {
  phrases: string[]
}

interface StreamingRecognizeRequest {
  config: RecognitionConfig,
  interimResults: boolean
}

interface StreamingRecognizeResponse {
  results: StreamingRecognitionResult[]
}

interface StreamingRecognitionResult {
  isFinal: boolean,
  resultEndTime: Duration,
  alternatives: SpeechRecognitionAlternative[]
}

interface SpeechRecognitionAlternative {
  transcript: string,
  confidence: number,
}

interface Duration {
  seconds: number,
  nanos: number
}

export class StreamingRecognize {

  private client: SpeechClient
  public stream: any

  constructor(public request: StreamingRecognizeRequest) {
    this.client = new v1p1beta1.SpeechClient()
  }

  start(callback: (response: StreamingRecognizeResponse) => void) {
    this.stream = this.client
      .streamingRecognize(this.request)
      .on('error', err => {
        console.error(`API request error: ${err}`)
      })
      .on('data', callback)
  }

  write(chunk) {
    if (this.stream) {
      this.stream.write(chunk)
    }
  }

  end() {
    if (this.stream) {
      this.stream.destroy()
      this.stream = null
    }
  }
}

export class InfiniteStreamingRecognize extends StreamingRecognize {

  private resultEndTime: number = 0
  private finalEndTime: number = 0
  private finalRequestEndTime: number = 0
  private audioInput: any[] = []
  private lastAudioInput: any[] = []
  private newStream: boolean = true
  private bridgingOffset: number = 0

  constructor(
    public request: StreamingRecognizeRequest,
    public streamingLimit: number = 290000  // Google Speech API max audio length ~5m
  ) {
    super(request)
  }

  start() {
    super.start(this.callback)
    setTimeout(this.restart.bind(this), this.streamingLimit)
  }

  restart() {
    console.log(`Streaming limit (${this.streamingLimit} msec) reached, restarting streaming recognize instance...`)
    
    if (this.stream) {
      this.stream.removeListener('data', this.callback)
      this.stream = null
    }

    if (this.resultEndTime > 0) {
      this.finalRequestEndTime = this.finalEndTime
    }
    this.resultEndTime = 0
    this.lastAudioInput = []
    this.lastAudioInput = this.audioInput
    this.newStream = true

    this.start()
  }

  write(chunk) {  
    // If stream was just restarted, add saved audio chunks from last run
    if (this.newStream && this.lastAudioInput.length > 0) {
      // Approximate math to calculate time of chunks
      const chunkTime = this.streamingLimit / this.lastAudioInput.length
      if (chunkTime > 0) {
        this.bridgingOffset = Math.max(this.bridgingOffset, 0)
        this.bridgingOffset = Math.min(this.bridgingOffset, this.finalRequestEndTime)
        const chunksFromMS = Math.floor((this.finalRequestEndTime - this.bridgingOffset) / chunkTime)
        this.bridgingOffset = Math.floor((this.lastAudioInput.length - chunksFromMS) * chunkTime)

        for (let i = chunksFromMS; i < this.lastAudioInput.length; i++) {
          super.write(this.lastAudioInput[i])
        }
      }
      this.newStream = false
    }

    // Save current chunk and process it
    this.audioInput.push(chunk)
    super.write(chunk)
  }

  callback(response: StreamingRecognizeResponse) {
    const { resultEndTime, isFinal, alternatives } = response.results[0]

    this.resultEndTime = resultEndTime.seconds * 1000 + Math.round(resultEndTime.nanos / 1000000)

    if (isFinal) {
      this.finalEndTime = this.resultEndTime
    }

    console.log(alternatives)
  }
}