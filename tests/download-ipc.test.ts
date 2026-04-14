import assert from 'node:assert/strict'
import test from 'node:test'

import { createDownloadIpc } from '../src/main/ipc/download-ipc.ts'
import { DOWNLOAD_IPC_CHANNELS } from '../src/main/download/download-types.ts'

test('createDownloadIpc registers handlers and broadcasts task changes', async () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>()
  const sentEvents: Array<{ channel: string; payload: unknown }> = []
  let subscribedListener: ((tasks: unknown) => void) | null = null
  const selectedWindow = { id: 'window-1' }
  const fakeTasks = [
    {
      id: 'task-1',
      status: 'completed',
    },
  ]

  const downloadService = {
    getDefaultDirectory: (directory?: string) => directory || 'F:\\downloads',
    openDirectory: async () => true,
    enqueueSongDownload: async (payload: unknown) => payload,
    getTasks: () => fakeTasks,
    removeTask: (taskId: string) => taskId === 'task-1',
    openDownloadedFile: async (taskId: string) => taskId === 'task-1',
    openDownloadedFileFolder: async (taskId: string) => taskId === 'task-1',
    subscribe: (listener: (tasks: unknown) => void) => {
      subscribedListener = listener
      return () => {
        subscribedListener = null
      }
    },
  }

  createDownloadIpc({
    ipcMain: {
      handle: (channel, handler) => {
        handlers.set(channel, handler)
      },
    },
    browserWindowFromWebContents: () => selectedWindow,
    getAllWindows: () => [
      {
        webContents: {
          send: (channel: string, payload: unknown) => {
            sentEvents.push({ channel, payload })
          },
        },
      },
    ],
    dialog: {
      showOpenDialog: async (window, options) => {
        assert.equal(window, selectedWindow)
        assert.equal(options.defaultPath, 'F:\\downloads')
        return {
          canceled: false,
          filePaths: ['F:\\selected-downloads'],
        }
      },
    },
    downloadService,
  }).register()

  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.GET_DEFAULT_DIRECTORY)?.(),
    'F:\\downloads'
  )
  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.SELECT_DIRECTORY)?.({
      sender: {},
    }),
    'F:\\selected-downloads'
  )
  assert.deepEqual(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.ENQUEUE_SONG_DOWNLOAD)?.(
      { sender: {} },
      { songId: '1' }
    ),
    { songId: '1' }
  )
  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.GET_TASKS)?.(),
    fakeTasks
  )
  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.REMOVE_TASK)?.(
      { sender: {} },
      'task-1'
    ),
    true
  )
  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.OPEN_DIRECTORY)?.(),
    true
  )
  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.OPEN_DOWNLOADED_FILE)?.(
      { sender: {} },
      'task-1'
    ),
    true
  )
  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.OPEN_DOWNLOADED_FILE_FOLDER)?.(
      { sender: {} },
      'task-1'
    ),
    true
  )

  subscribedListener?.(fakeTasks)

  assert.deepEqual(sentEvents, [
    {
      channel: DOWNLOAD_IPC_CHANNELS.TASKS_CHANGED,
      payload: fakeTasks,
    },
  ])
})

test('createDownloadIpc resolves the system downloads directory when no custom service is provided', async () => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>()

  createDownloadIpc({
    ipcMain: {
      handle: (channel, handler) => {
        handlers.set(channel, handler)
      },
    },
    appGetPath: name => {
      assert.equal(name, 'downloads')
      return 'C:\\Users\\tester\\Downloads'
    },
    getAllWindows: () => [],
  }).register()

  assert.equal(
    await handlers.get(DOWNLOAD_IPC_CHANNELS.GET_DEFAULT_DIRECTORY)?.(),
    'C:\\Users\\tester\\Downloads'
  )
})
