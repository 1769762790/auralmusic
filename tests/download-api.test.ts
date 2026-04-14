import assert from 'node:assert/strict'
import test from 'node:test'

import { createDownloadApi } from '../src/preload/api/download-api.ts'
import { DOWNLOAD_IPC_CHANNELS } from '../src/main/download/download-types.ts'

test('createDownloadApi proxies invocations and cleans up task listeners', async () => {
  const invocations: Array<{ channel: string; args: unknown[] }> = []
  const listeners = new Map<string, (...args: unknown[]) => void>()
  const exposed: Array<{ key: string; value: unknown }> = []

  const { api, expose } = createDownloadApi({
    contextBridge: {
      exposeInMainWorld: (key, value) => {
        exposed.push({ key, value })
      },
    },
    ipcRenderer: {
      invoke: async (channel, ...args) => {
        invocations.push({ channel, args })
        if (channel === DOWNLOAD_IPC_CHANNELS.GET_TASKS) {
          return [{ id: 'task-1', status: 'queued' }]
        }

        return `${channel}:ok`
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

  assert.equal(exposed.length, 1)
  assert.equal(exposed[0]?.key, 'electronDownload')

  assert.equal(
    await api.getDefaultDirectory(),
    `${DOWNLOAD_IPC_CHANNELS.GET_DEFAULT_DIRECTORY}:ok`
  )
  assert.equal(
    await api.selectDirectory(),
    `${DOWNLOAD_IPC_CHANNELS.SELECT_DIRECTORY}:ok`
  )
  assert.equal(
    await api.openDirectory(),
    `${DOWNLOAD_IPC_CHANNELS.OPEN_DIRECTORY}:ok`
  )
  assert.equal(
    await api.enqueueSongDownload({ songId: '1' }),
    `${DOWNLOAD_IPC_CHANNELS.ENQUEUE_SONG_DOWNLOAD}:ok`
  )
  assert.deepEqual(await api.getTasks(), [{ id: 'task-1', status: 'queued' }])
  assert.equal(
    await api.removeTask('task-1'),
    `${DOWNLOAD_IPC_CHANNELS.REMOVE_TASK}:ok`
  )
  assert.equal(
    await api.openDownloadedFile('task-1'),
    `${DOWNLOAD_IPC_CHANNELS.OPEN_DOWNLOADED_FILE}:ok`
  )
  assert.equal(
    await api.openDownloadedFileFolder('task-1'),
    `${DOWNLOAD_IPC_CHANNELS.OPEN_DOWNLOADED_FILE_FOLDER}:ok`
  )

  const receivedTasks: unknown[] = []
  const unsubscribe = api.onTasksChanged(tasks => {
    receivedTasks.push(tasks)
  })

  listeners.get(DOWNLOAD_IPC_CHANNELS.TASKS_CHANGED)?.({}, [{ id: 'task-1' }])
  unsubscribe()

  assert.deepEqual(receivedTasks, [[{ id: 'task-1' }]])
  assert.equal(listeners.has(DOWNLOAD_IPC_CHANNELS.TASKS_CHANGED), false)
  assert.deepEqual(invocations, [
    { channel: DOWNLOAD_IPC_CHANNELS.GET_DEFAULT_DIRECTORY, args: [] },
    { channel: DOWNLOAD_IPC_CHANNELS.SELECT_DIRECTORY, args: [] },
    { channel: DOWNLOAD_IPC_CHANNELS.OPEN_DIRECTORY, args: [undefined] },
    {
      channel: DOWNLOAD_IPC_CHANNELS.ENQUEUE_SONG_DOWNLOAD,
      args: [{ songId: '1' }],
    },
    { channel: DOWNLOAD_IPC_CHANNELS.GET_TASKS, args: [] },
    { channel: DOWNLOAD_IPC_CHANNELS.REMOVE_TASK, args: ['task-1'] },
    {
      channel: DOWNLOAD_IPC_CHANNELS.OPEN_DOWNLOADED_FILE,
      args: ['task-1'],
    },
    {
      channel: DOWNLOAD_IPC_CHANNELS.OPEN_DOWNLOADED_FILE_FOLDER,
      args: ['task-1'],
    },
  ])
})
