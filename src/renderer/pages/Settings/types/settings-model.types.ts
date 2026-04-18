import type { AppConfig } from '../../../../main/config/types.ts'

export type SystemFontQueryStatus = 'ok' | 'unsupported' | 'empty' | 'error'

export interface SystemFontQueryResult {
  fonts: string[]
  status: SystemFontQueryStatus
  message?: string
}

export type AudioOutputDeviceQueryStatus =
  | 'ok'
  | 'empty'
  | 'unsupported'
  | 'permission-denied'
  | 'error'

export interface AudioOutputDeviceOption {
  deviceId: string
  label: string
  isDefault: boolean
}

export interface AudioOutputDeviceQueryResult {
  devices: AudioOutputDeviceOption[]
  status: AudioOutputDeviceQueryStatus
  message?: string
}

export interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext
}

export interface PlaybackRateAudioLike {
  playbackRate: number
}

export type MusicSourceSettingsDraftInput = Pick<
  AppConfig,
  | 'musicSourceProviders'
  | 'enhancedSourceModules'
  | 'luoxueSourceEnabled'
  | 'customMusicApiEnabled'
  | 'customMusicApiUrl'
>

export interface MusicSourceSettingsDraft {
  hasLegacyProviders: boolean
  enhancedSourceModules: AppConfig['enhancedSourceModules']
  luoxueSourceEnabled: boolean
  customMusicApiEnabled: boolean
  customMusicApiUrl: string
}

export interface EqualizerPresetOption {
  value: string
  label: string
}
