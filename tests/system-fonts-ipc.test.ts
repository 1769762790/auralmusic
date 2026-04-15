import assert from 'node:assert/strict'
import test from 'node:test'

import { createSystemFontsIpc } from '../src/main/ipc/system-fonts-ipc.ts'
import { SYSTEM_FONTS_IPC_CHANNELS } from '../src/shared/ipc/system-fonts.ts'

test('createSystemFontsIpc registers a handler that normalizes font-list output', async () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>()
  const requests: Array<Record<string, unknown> | undefined> = []

  createSystemFontsIpc({
    ipcMain: {
      handle: (channel, handler) => {
        handlers.set(channel, handler)
      },
    },
    getFonts: async options => {
      requests.push(options)
      return ['  Inter  ', 'Noto Sans SC', 'Inter', '']
    },
  }).register()

  assert.deepEqual(await handlers.get(SYSTEM_FONTS_IPC_CHANNELS.GET_ALL)?.(), [
    'Inter',
    'Noto Sans SC',
  ])
  assert.deepEqual(requests, [{ disableQuoting: true }])
})
