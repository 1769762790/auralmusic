import electron from 'electron'
import { LOCAL_LIBRARY_IPC_CHANNELS } from '../../shared/ipc/index.ts'
import type {
  LocalLibraryOnlineLyricMatchInput,
  LocalLibraryOnlineLyricMatchResult,
  LocalLibraryScanSummary,
  LocalLibraryRootRecord,
  LocalLibrarySnapshot,
  LocalLibraryTrackDeleteInput,
  LocalLibraryTrackDeleteResult,
} from '../../shared/local-library.ts'

export type LocalLibraryApi = {
  getSnapshot: () => Promise<LocalLibrarySnapshot>
  scan: () => Promise<LocalLibraryScanSummary>
  syncRoots: (roots: string[]) => Promise<LocalLibraryRootRecord[]>
  selectDirectories: () => Promise<string[]>
  openDirectory: (targetPath: string) => Promise<boolean>
  removeTrack: (
    input: LocalLibraryTrackDeleteInput
  ) => Promise<LocalLibraryTrackDeleteResult>
  matchOnlineLyrics: (
    input: LocalLibraryOnlineLyricMatchInput
  ) => Promise<LocalLibraryOnlineLyricMatchResult | null>
}

type LocalLibraryApiDependencies = {
  contextBridge?: {
    exposeInMainWorld: (key: string, value: unknown) => void
  }
  ipcRenderer?: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}

export function createLocalLibraryApi(
  dependencies: LocalLibraryApiDependencies = {}
) {
  const bridge = dependencies.contextBridge ?? electron.contextBridge
  const renderer = dependencies.ipcRenderer ?? electron.ipcRenderer

  const api: LocalLibraryApi = {
    getSnapshot: async () => {
      return renderer.invoke(
        LOCAL_LIBRARY_IPC_CHANNELS.GET_SNAPSHOT
      ) as Promise<LocalLibrarySnapshot>
    },
    scan: async () => {
      return renderer.invoke(
        LOCAL_LIBRARY_IPC_CHANNELS.SCAN
      ) as Promise<LocalLibraryScanSummary>
    },
    syncRoots: async roots => {
      return renderer.invoke(
        LOCAL_LIBRARY_IPC_CHANNELS.SYNC_ROOTS,
        roots
      ) as Promise<LocalLibraryRootRecord[]>
    },
    selectDirectories: async () => {
      return renderer.invoke(
        LOCAL_LIBRARY_IPC_CHANNELS.SELECT_DIRECTORIES
      ) as Promise<string[]>
    },
    openDirectory: async targetPath => {
      if (!targetPath.trim()) {
        return false
      }

      return renderer.invoke(
        LOCAL_LIBRARY_IPC_CHANNELS.OPEN_DIRECTORY,
        targetPath
      ) as Promise<boolean>
    },
    removeTrack: async input => {
      return renderer.invoke(
        LOCAL_LIBRARY_IPC_CHANNELS.REMOVE_TRACK,
        input
      ) as Promise<LocalLibraryTrackDeleteResult>
    },
    matchOnlineLyrics: async input => {
      return renderer.invoke(
        LOCAL_LIBRARY_IPC_CHANNELS.MATCH_ONLINE_LYRICS,
        input
      ) as Promise<LocalLibraryOnlineLyricMatchResult | null>
    },
  }

  return {
    api,
    expose() {
      bridge.exposeInMainWorld('electronLocalLibrary', api)
    },
  }
}

export function exposeLocalLibraryApi() {
  createLocalLibraryApi().expose()
}
