import { contextBridge } from 'electron'
import { readMusicApiBaseUrlFromEnv } from '../../main/music-api-runtime'

export type RuntimeApi = {
  getMusicApiBaseUrl: () => string | undefined
}

const runtimeApi: RuntimeApi = {
  getMusicApiBaseUrl: () => readMusicApiBaseUrlFromEnv(),
}

export function exposeRuntimeApi() {
  contextBridge.exposeInMainWorld('appRuntime', runtimeApi)
}
