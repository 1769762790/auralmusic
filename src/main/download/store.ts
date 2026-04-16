import ElectronStore from 'electron-store'
import { resolveAppStoreDirectory } from '../storage/store-path.ts'

import type { DownloadTask } from './download-types.ts'

interface DownloadStoreSchema {
  tasks: DownloadTask[]
}

const Store =
  (
    ElectronStore as typeof ElectronStore & {
      default?: typeof ElectronStore
    }
  ).default ?? ElectronStore

export function buildDownloadStoreOptions(
  resolveStoreDirectory: () => string = resolveAppStoreDirectory
) {
  return {
    cwd: resolveStoreDirectory(),
    name: 'aural-music-downloads',
    defaults: {
      tasks: [],
    },
  }
}

function createDownloadStore() {
  return new Store<DownloadStoreSchema>(buildDownloadStoreOptions())
}

class DownloadStore {
  private static instance: ReturnType<typeof createDownloadStore>

  private constructor() {}

  static getInstance(): ReturnType<typeof createDownloadStore> {
    if (!DownloadStore.instance) {
      DownloadStore.instance = createDownloadStore()
    }

    return DownloadStore.instance
  }
}

function getDownloadStore() {
  return DownloadStore.getInstance()
}

export function getPersistedDownloadTasks() {
  return getDownloadStore().get('tasks') || []
}

export function setPersistedDownloadTasks(tasks: DownloadTask[]) {
  getDownloadStore().set('tasks', tasks)
}
