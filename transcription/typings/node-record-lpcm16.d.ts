declare module 'node-record-lpcm16' {
  import { Writable } from 'stream'

  export function record(params: {
    sampleRateHertz: number,
    threshold?: number,
    silence?: number
  }): Recording

  export class Recording {
    stream(): Writable {
    }
  }

}