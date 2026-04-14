import {
  MUSIC_API_BASE_URL_ENV_KEY,
  MUSIC_API_PORT_ENV_KEY,
} from '../shared/music-api-runtime.ts'

export {
  createMusicApiBaseUrl,
  MUSIC_API_BASE_URL_ENV_KEY,
  MUSIC_API_HOST,
  MUSIC_API_PORT_ENV_KEY,
  readMusicApiBaseUrlFromEnv,
} from '../shared/music-api-runtime.ts'

export interface MusicApiRuntimeInfo {
  port: number
  baseURL: string
}

export function applyMusicApiRuntimeEnv(runtimeInfo: MusicApiRuntimeInfo) {
  process.env[MUSIC_API_BASE_URL_ENV_KEY] = runtimeInfo.baseURL
  process.env[MUSIC_API_PORT_ENV_KEY] = String(runtimeInfo.port)
}
