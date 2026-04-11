import { contextBridge, ipcRenderer } from 'electron'

import { WINDOW_IPC_CHANNELS } from '../../main/window/types'

export type WindowApi = {
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<boolean>
  toggleFullScreen: () => Promise<boolean>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  isFullScreen: () => Promise<boolean>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void
  onFullScreenChange: (callback: (isFullScreen: boolean) => void) => () => void
}

const windowApi: WindowApi = {
  minimize: async () => {
    await ipcRenderer.invoke(WINDOW_IPC_CHANNELS.MINIMIZE)
  },
  toggleMaximize: async () => {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.TOGGLE_MAXIMIZE)
  },
  toggleFullScreen: async () => {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.TOGGLE_FULLSCREEN)
  },
  close: async () => {
    await ipcRenderer.invoke(WINDOW_IPC_CHANNELS.CLOSE)
  },
  isMaximized: async () => {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.IS_MAXIMIZED)
  },
  isFullScreen: async () => {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.IS_FULLSCREEN)
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
  onFullScreenChange: callback => {
    const listener = (_event: unknown, isFullScreen: boolean) => {
      callback(isFullScreen)
    }

    ipcRenderer.on(WINDOW_IPC_CHANNELS.FULLSCREEN_CHANGED, listener)

    return () => {
      ipcRenderer.removeListener(
        WINDOW_IPC_CHANNELS.FULLSCREEN_CHANGED,
        listener
      )
    }
  },
}

export function exposeWindowApi() {
  contextBridge.exposeInMainWorld('electronWindow', windowApi)
}
