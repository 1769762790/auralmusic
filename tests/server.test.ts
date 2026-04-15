import assert from 'node:assert/strict'
import net from 'node:net'
import test from 'node:test'

import {
  checkPortAvailable,
  findAvailableMusicApiPort,
  startMusicApi,
} from '../src/main/server.ts'

test('checkPortAvailable respects the requested host binding', async () => {
  const reservedServer = net.createServer()
  await new Promise<void>((resolve, reject) => {
    reservedServer.once('error', reject)
    reservedServer.listen(0, '127.0.0.1', () => resolve())
  })

  const address = reservedServer.address()
  assert.notEqual(address, null)
  assert.equal(typeof address, 'object')

  try {
    const port = address.port
    assert.equal(await checkPortAvailable(port, '127.0.0.1'), false)
  } finally {
    await new Promise<void>((resolve, reject) => {
      reservedServer.close(error => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }
})

test('findAvailableMusicApiPort skips busy ports on the target host', async () => {
  const attemptedPorts: number[] = []

  const port = await findAvailableMusicApiPort({
    startPort: 7703,
    maxRetries: 3,
    host: '127.0.0.1',
    checkPortAvailable: async nextPort => {
      attemptedPorts.push(nextPort)
      return nextPort === 7705
    },
    log: {
      log: () => {},
      error: () => {},
    },
  })

  assert.deepEqual(attemptedPorts, [7703, 7704, 7705])
  assert.equal(port, 7705)
})

test('startMusicApi launches the api in a child process with Electron node mode', async () => {
  const spawnCalls: Array<{
    port: number
    host: string
    env: NodeJS.ProcessEnv
  }> = []

  const runtime = await startMusicApi({
    startPort: 7703,
    host: '127.0.0.1',
    env: {
      TEST_ENV: '1',
    },
    checkPortAvailable: async nextPort => nextPort === 7704,
    spawnMusicApiProcess: options => {
      spawnCalls.push(options)

      return {
        pid: 1234,
        stdout: null,
        stderr: null,
        once: () => undefined,
        kill: () => true,
      }
    },
    waitForMusicApiListening: async () => {},
    log: {
      log: () => {},
      error: () => {},
    },
  })

  assert.equal(spawnCalls.length, 1)
  assert.equal(spawnCalls[0]?.port, 7704)
  assert.equal(spawnCalls[0]?.host, '127.0.0.1')
  assert.equal(spawnCalls[0]?.env.TEST_ENV, '1')
  assert.equal(runtime.baseURL, 'http://127.0.0.1:7704')
  assert.equal(runtime.port, 7704)
  assert.equal(typeof runtime.dispose, 'function')
})
