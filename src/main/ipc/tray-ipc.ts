import electron from 'electron'

import { TRAY_IPC_CHANNELS } from '../../shared/ipc/index.ts'
import type { TrayState } from '../../shared/tray.ts'

type TrayIpcOptions = {
  ipcMain?: {
    handle: (
      channel: string,
      handler: (...args: unknown[]) => unknown | Promise<unknown>
    ) => void
  }
  trayController: {
    setState: (state: TrayState) => void
  }
}

export function createTrayIpc(options: TrayIpcOptions) {
  const ipcMain = options.ipcMain ?? electron.ipcMain

  return {
    register() {
      ipcMain.handle(
        TRAY_IPC_CHANNELS.SYNC_STATE,
        (_event, state: TrayState) => {
          options.trayController.setState(state)
        }
      )
    },
  }
}

export function registerTrayIpc(options: TrayIpcOptions) {
  createTrayIpc(options).register()
}
