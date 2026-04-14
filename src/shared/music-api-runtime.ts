export const MUSIC_API_HOST = '127.0.0.1'
export const MUSIC_API_BASE_URL_ENV_KEY = 'AURAL_MUSIC_API_BASE_URL'
export const MUSIC_API_PORT_ENV_KEY = 'AURAL_MUSIC_API_PORT'

export function createMusicApiBaseUrl(
  port: number,
  host: string = MUSIC_API_HOST
) {
  return `http://${host}:${port}`
}

export function readMusicApiBaseUrlFromEnv(
  env: NodeJS.ProcessEnv = process.env
) {
  const baseURL = env[MUSIC_API_BASE_URL_ENV_KEY]?.trim()
  return baseURL || undefined
}
