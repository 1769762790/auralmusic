import type { EqualizerConfig } from '../../../shared/equalizer.ts'

export interface ConnectableAudioNode {
  connect: (node: unknown) => unknown
  disconnect: () => void
}

export type EqualizerAudioContext = Pick<
  AudioContext,
  | 'destination'
  | 'state'
  | 'createMediaElementSource'
  | 'createGain'
  | 'createBiquadFilter'
  | 'resume'
  | 'close'
> & {
  setSinkId?: (sinkId: string) => Promise<void>
}

export interface EqualizerGraph {
  update: (config: EqualizerConfig) => void
  resume: () => Promise<void>
  setOutputDevice: (deviceId: string) => Promise<boolean>
  dispose: () => void
}
