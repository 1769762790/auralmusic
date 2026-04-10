import { contextBridge, ipcRenderer } from 'electron'

import { WINDOW_IPC_CHANNELS } from '../../main/window/types'

export type WindowApi = {
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<boolean>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void
}

const windowApi: WindowApi = {
  minimize: async () => {
    await ipcRenderer.invoke(WINDOW_IPC_CHANNELS.MINIMIZE)
  },
  toggleMaximize: async () => {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.TOGGLE_MAXIMIZE)
  },
  close: async () => {
    await ipcRenderer.invoke(WINDOW_IPC_CHANNELS.CLOSE)
  },
  isMaximized: async () => {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.IS_MAXIMIZED)
  },
  onMaximizeChange: callback => {
    const listener = (_event: unknown, isMaximized: boolean) => {
      callback(isMaximized)
    }

    ipcRenderer.on(WINDOW_IPC_CHANNELS.MAXIMIZE_CHANGED, listener)

    return () => {
      ipcRenderer.removeListener(WINDOW_IPC_CHANNELS.MAXIMIZE_CHANGED, listener)
    }
  },
}

export function exposeWindowApi() {
  contextBridge.exposeInMainWorld('electronWindow', windowApi)
}
