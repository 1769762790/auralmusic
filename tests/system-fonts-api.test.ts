import assert from 'node:assert/strict'
import test from 'node:test'

import { createSystemFontsApi } from '../src/preload/api/system-fonts-api.ts'
import { SYSTEM_FONTS_IPC_CHANNELS } from '../src/shared/ipc/system-fonts.ts'

test('createSystemFontsApi proxies invocations through the preload bridge', async () => {
  const invocations: Array<{ channel: string; args: unknown[] }> = []
  const exposed: Array<{ key: string; value: unknown }> = []

  const { api, expose } = createSystemFontsApi({
    contextBridge: {
      exposeInMainWorld: (key, value) => {
        exposed.push({ key, value })
      },
    },
    ipcRenderer: {
      invoke: async (channel, ...args) => {
        invocations.push({ channel, args })
        return ['Inter', 'Noto Sans SC']
      },
    },
  })

  expose()

  assert.equal(exposed.length, 1)
  assert.equal(exposed[0]?.key, 'electronSystemFonts')
  assert.deepEqual(await api.getAll(), ['Inter', 'Noto Sans SC'])
  assert.deepEqual(invocations, [
    {
      channel: SYSTEM_FONTS_IPC_CHANNELS.GET_ALL,
      args: [],
    },
  ])
})
