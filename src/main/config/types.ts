import type { ImportedLxMusicSource } from '../../shared/lx-music-source'
import {
  DEFAULT_SHORTCUT_BINDINGS,
  type ShortcutBindings,
} from '../../shared/shortcut-keys'

export const AUDIO_QUALITY_LEVELS = [
  'standard',
  'higher',
  'exhigh',
  'lossless',
  'hires',
  'jyeffect',
  'sky',
  'dolby',
  'jymaster',
] as const

export type AudioQualityLevel = (typeof AUDIO_QUALITY_LEVELS)[number]

export const MUSIC_SOURCE_PROVIDERS = [
  'migu',
  'kugou',
  'pyncmd',
  'bilibili',
  'lxMusic',
] as const

export type MusicSourceProvider = (typeof MUSIC_SOURCE_PROVIDERS)[number]

export interface AppConfig {
  theme: 'light' | 'dark' | 'system'
  fontFamily: string
  audioOutputDeviceId: string
  musicSourceEnabled: boolean
  musicSourceProviders: MusicSourceProvider[]
  luoxueSourceEnabled: boolean
  luoxueSourceUrl: string
  luoxueMusicSourceScript: ImportedLxMusicSource | null
  luoxueMusicSourceScripts: ImportedLxMusicSource[]
  activeLuoxueMusicSourceScriptId: string | null
  customMusicApiEnabled: boolean
  customMusicApiUrl: string
  quality: AudioQualityLevel
  globalShortcutEnabled: boolean
  shortcutBindings: ShortcutBindings
}

export const defaultConfig: AppConfig = {
  theme: 'system',
  fontFamily: 'Inter Variable',
  audioOutputDeviceId: 'default',
  musicSourceEnabled: false,
  musicSourceProviders: ['migu', 'kugou', 'pyncmd', 'bilibili'],
  luoxueSourceEnabled: false,
  luoxueSourceUrl: '',
  luoxueMusicSourceScript: null,
  luoxueMusicSourceScripts: [],
  activeLuoxueMusicSourceScriptId: null,
  customMusicApiEnabled: false,
  customMusicApiUrl: '',
  quality: 'higher',
  globalShortcutEnabled: false,
  shortcutBindings: DEFAULT_SHORTCUT_BINDINGS,
}

export const IPC_CHANNELS = {
  CONFIG: {
    GET: 'config:get',
    SET: 'config:set',
    RESET: 'config:reset',
  },
  MUSIC_SOURCE: {
    SELECT_LX_SCRIPT: 'music-source:select-lx-script',
    SAVE_LX_SCRIPT: 'music-source:save-lx-script',
    READ_LX_SCRIPT: 'music-source:read-lx-script',
    REMOVE_LX_SCRIPT: 'music-source:remove-lx-script',
    DOWNLOAD_LX_SCRIPT: 'music-source:download-lx-script',
    LX_HTTP_REQUEST: 'music-source:lx-http-request',
  },
} as const
