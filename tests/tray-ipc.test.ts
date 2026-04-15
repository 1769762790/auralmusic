import assert from 'node:assert/strict'
import test from 'node:test'

import { createTrayIpc } from '../src/main/ipc/tray-ipc.ts'
import { TRAY_IPC_CHANNELS } from '../src/shared/ipc/tray.ts'

test('createTrayIpc registers a state sync handler for the tray controller', async () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>()
  const syncedStates: unknown[] = []

  createTrayIpc({
    ipcMain: {
      handle: (channel, handler) => {
        handlers.set(channel, handler)
      },
    },
    trayController: {
      setState: state => {
        syncedStates.push(state)
      },
    },
  }).register()

  const state = {
    currentTrackName: 'Song',
    currentArtistNames: 'Artist',
    status: 'paused',
    playbackMode: 'repeat-one',
    hasCurrentTrack: true,
  }

  await handlers.get(TRAY_IPC_CHANNELS.SYNC_STATE)?.({}, state)

  assert.deepEqual(syncedStates, [state])
})
