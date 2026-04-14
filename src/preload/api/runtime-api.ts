import electron from 'electron'
import { readMusicApiBaseUrlFromEnv } from '../../shared/music-api-runtime.ts'

export type RuntimeApi = {
  getMusicApiBaseUrl: () => string | undefined
  getPlatform: () => NodeJS.Platform
}

type RuntimeApiDependencies = {
  env?: NodeJS.ProcessEnv
  platform?: NodeJS.Platform
}

export function createRuntimeApi(
  dependencies: RuntimeApiDependencies = {}
): RuntimeApi {
  const env = dependencies.env ?? process.env
  const platform = dependencies.platform ?? process.platform

  return {
    getMusicApiBaseUrl: () => readMusicApiBaseUrlFromEnv(env),
    getPlatform: () => platform,
  }
}

export function exposeRuntimeApi() {
  electron.contextBridge.exposeInMainWorld('appRuntime', createRuntimeApi())
}
