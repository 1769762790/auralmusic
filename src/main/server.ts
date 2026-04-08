import {
  createMusicApiBaseUrl,
  type MusicApiRuntimeInfo,
} from './music-api-runtime'

/**
 * Check if a port is available
 * @param port
 * @returns
 */
function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const net = require('net')
    const tester = net
      .createServer()
      .once('error', () => {
        resolve(false)
      })
      .once('listening', () => {
        tester.close(() => resolve(true))
      })
      .listen(port)
  })
}

async function waitForMusicApiListening(server?: {
  listening?: boolean
  once: (event: string, listener: (...args: unknown[]) => void) => void
}): Promise<void> {
  if (!server || server.listening) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    server.once('listening', () => resolve())
    server.once('error', error => reject(error))
  })
}

async function startMusicApi(): Promise<MusicApiRuntimeInfo> {
  console.log('MUSIC API STARTING...')
  let port = 7703
  const maxRetries = 10

  for (let i = 0; i < maxRetries; i++) {
    const isAvailable = await checkPortAvailable(port)
    if (isAvailable) {
      break
    }

    console.log(`port ${port} is busy, switching to ${port + 1}`)
    port++
  }

  try {
    const musicApiServer = require('@neteasecloudmusicapienhanced/api/server')
    const app = await musicApiServer.serveNcmApi({
      port,
      host: '127.0.0.1',
    })

    await waitForMusicApiListening(app?.server)

    const runtimeInfo = {
      port,
      baseURL: createMusicApiBaseUrl(port),
    }

    console.log(`MUSIC API STARTED on port ${port}`)
    return runtimeInfo
  } catch (error) {
    console.error('MUSIC API start failed:', error)
    throw error
  }
}

export { startMusicApi }
