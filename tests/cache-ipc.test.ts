import assert from 'node:assert/strict'
import test from 'node:test'

import { createCacheIpc } from '../src/main/ipc/cache-ipc.ts'
import { CACHE_IPC_CHANNELS } from '../src/main/cache/cache-types.ts'

test('createCacheIpc registers handlers and resolves the system cache directory lazily', async () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>()
  const selectedWindow = { id: 'cache-window' }
  let appGetPathCalls = 0

  const cacheService = {
    getDefaultCacheRoot: () =>
      'C:\\Users\\tester\\AppData\\Roaming\\AuralMusic',
    resolveCacheRoot: (cacheDir?: string) =>
      cacheDir || 'C:\\Users\\tester\\AppData\\Roaming\\AuralMusic',
    getStatus: async () => ({
      usedBytes: 0,
      audioCount: 0,
      lyricsCount: 0,
    }),
    clear: async () => undefined,
    resolveAudioSource: async () => ({
      url: 'https://cdn.example.com/song.mp3',
      fromCache: false,
    }),
    readLyricsPayload: async () => null,
    writeLyricsPayload: async () => undefined,
  }

  createCacheIpc({
    ipcMain: {
      handle: (channel, handler) => {
        handlers.set(channel, handler)
      },
    },
    browserWindowFromWebContents: () => selectedWindow,
    dialog: {
      showOpenDialog: async (window, options) => {
        assert.equal(window, selectedWindow)
        assert.equal(
          options.defaultPath,
          'C:\\Users\\tester\\AppData\\Roaming\\AuralMusic'
        )
        return {
          canceled: false,
          filePaths: ['D:\\cache'],
        }
      },
    },
    appGetPath: name => {
      appGetPathCalls += 1
      assert.equal(name, 'sessionData')
      return 'C:\\Users\\tester\\AppData\\Roaming'
    },
    getConfigValue: key => {
      if (key === 'diskCacheDir') {
        return ''
      }
      if (key === 'diskCacheEnabled') {
        return true
      }
      if (key === 'diskCacheMaxBytes') {
        return 1024
      }
      throw new Error(`Unexpected config key: ${String(key)}`)
    },
    cacheService,
  }).register()

  assert.equal(appGetPathCalls, 0)
  assert.equal(
    await handlers.get(CACHE_IPC_CHANNELS.GET_DEFAULT_DIRECTORY)?.(),
    'C:\\Users\\tester\\AppData\\Roaming\\AuralMusic'
  )
  assert.equal(appGetPathCalls, 0)
  assert.equal(
    await handlers.get(CACHE_IPC_CHANNELS.SELECT_DIRECTORY)?.({
      sender: {},
    }),
    'D:\\cache'
  )
})
