import assert from 'node:assert/strict'
import test from 'node:test'

import { createTrayApi } from '../src/preload/api/tray-api.ts'
import { TRAY_IPC_CHANNELS } from '../src/shared/ipc/tray.ts'

test('createTrayApi proxies tray state sync and command listeners', async () => {
  const invocations: Array<{ channel: string; args: unknown[] }> = []
  const listeners = new Map<string, (...args: unknown[]) => void>()
  const exposed: Array<{ key: string; value: unknown }> = []

  const state = {
    currentTrackName: 'Song',
    currentArtistNames: 'Artist',
    status: 'playing',
    playbackMode: 'repeat-all',
    hasCurrentTrack: true,
  } as const

  const { api, expose } = createTrayApi({
    contextBridge: {
      exposeInMainWorld: (key, value) => {
        exposed.push({ key, value })
      },
    },
    ipcRenderer: {
      invoke: async (channel, ...args) => {
        invocations.push({ channel, args })
        return undefined
      },
      on: (channel, listener) => {
        listeners.set(channel, listener)
      },
      removeListener: (channel, listener) => {
        if (listeners.get(channel) === listener) {
          listeners.delete(channel)
        }
      },
    },
  })

  expose()
  await api.syncState(state)

  const commands: unknown[] = []
  const unsubscribe = api.onCommand(command => {
    commands.push(command)
  })

  listeners.get(TRAY_IPC_CHANNELS.COMMAND)?.({}, { type: 'open-settings' })
  unsubscribe()

  assert.equal(exposed[0]?.key, 'electronTray')
  assert.deepEqual(invocations, [
    {
      channel: TRAY_IPC_CHANNELS.SYNC_STATE,
      args: [state],
    },
  ])
  assert.deepEqual(commands, [{ type: 'open-settings' }])
  assert.equal(listeners.has(TRAY_IPC_CHANNELS.COMMAND), false)
})
