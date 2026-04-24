import assert from 'node:assert/strict'
import test from 'node:test'

import { createLocalLibraryIpc } from '../src/main/ipc/local-library-ipc.ts'
import { LOCAL_LIBRARY_IPC_CHANNELS } from '../src/shared/ipc/local-library.ts'

test('local library open-directory handler falls back to file url open on Windows when openPath fails', async () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>()
  const openExternalCalls: string[] = []

  createLocalLibraryIpc({
    ipcMain: {
      handle: (channel, handler) => {
        handlers.set(channel, handler)
      },
    },
    dialog: {
      showOpenDialog: async () => ({
        canceled: true,
        filePaths: [],
      }),
    },
    shell: {
      openPath: async () => 'openPath failed',
      openExternal: async target => {
        openExternalCalls.push(target)
        return ''
      },
    },
    platform: 'win32',
  }).register()

  const didOpen = await handlers.get(
    LOCAL_LIBRARY_IPC_CHANNELS.OPEN_DIRECTORY
  )?.({}, 'F:\\音乐')

  assert.equal(didOpen, true)
  assert.deepEqual(openExternalCalls, ['file:///F:/%E9%9F%B3%E4%B9%90'])
})
