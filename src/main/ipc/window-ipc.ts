import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'

import { WINDOW_IPC_CHANNELS } from '../window/types'

function getEventWindow(event: IpcMainInvokeEvent) {
  return BrowserWindow.fromWebContents(event.sender)
}

export function registerWindowIpc() {
  ipcMain.handle(WINDOW_IPC_CHANNELS.MINIMIZE, event => {
    const window = getEventWindow(event)
    window?.minimize()
  })

  ipcMain.handle(WINDOW_IPC_CHANNELS.TOGGLE_MAXIMIZE, event => {
    const window = getEventWindow(event)
    if (!window) {
      return false
    }

    if (window.isMaximized()) {
      window.unmaximize()
      return false
    }

    window.maximize()
    return true
  })

  ipcMain.handle(WINDOW_IPC_CHANNELS.CLOSE, event => {
    const window = getEventWindow(event)
    window?.close()
  })

  ipcMain.handle(WINDOW_IPC_CHANNELS.IS_MAXIMIZED, event => {
    const window = getEventWindow(event)
    return window?.isMaximized() ?? false
  })
}

export function bindWindowStateEvents(window: BrowserWindow) {
  const emitState = () => {
    window.webContents.send(
      WINDOW_IPC_CHANNELS.MAXIMIZE_CHANGED,
      window.isMaximized()
    )
  }

  window.on('maximize', emitState)
  window.on('unmaximize', emitState)
}
