import electron from 'electron'

import { SYSTEM_FONTS_IPC_CHANNELS } from '../../shared/ipc/index.ts'

export type SystemFontsApi = {
  getAll: () => Promise<string[]>
}

type SystemFontsApiDependencies = {
  contextBridge?: {
    exposeInMainWorld: (key: string, value: unknown) => void
  }
  ipcRenderer?: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}

export function createSystemFontsApi(
  dependencies: SystemFontsApiDependencies = {}
) {
  const bridge = dependencies.contextBridge ?? electron.contextBridge
  const renderer = dependencies.ipcRenderer ?? electron.ipcRenderer

  const api: SystemFontsApi = {
    getAll: async () => {
      return renderer.invoke(SYSTEM_FONTS_IPC_CHANNELS.GET_ALL) as Promise<
        string[]
      >
    },
  }

  return {
    api,
    expose() {
      bridge.exposeInMainWorld('electronSystemFonts', api)
    },
  }
}

export function exposeSystemFontsApi() {
  createSystemFontsApi().expose()
}
