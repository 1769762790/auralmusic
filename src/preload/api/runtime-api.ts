import { contextBridge } from 'electron'
import { readMusicApiBaseUrlFromEnv } from '../../main/music-api-runtime'

export type RuntimeApi = {
  getMusicApiBaseUrl: () => string | undefined
  getPlatform: () => NodeJS.Platform
}

const runtimeApi: RuntimeApi = {
  getMusicApiBaseUrl: () => readMusicApiBaseUrlFromEnv(),
  getPlatform: () => process.platform,
}

export function exposeRuntimeApi() {
  contextBridge.exposeInMainWorld('appRuntime', runtimeApi)
}
