import electron from 'electron'

import { TRAY_IPC_CHANNELS } from '../../shared/ipc/tray.ts'
import type { TrayCommand, TrayState } from '../../shared/tray.ts'

export type TrayApi = {
  syncState: (state: TrayState) => Promise<void>
  onCommand: (listener: (command: TrayCommand) => void) => () => void
}

type TrayApiDependencies = {
  contextBridge?: {
    exposeInMainWorld: (key: string, value: unknown) => void
  }
  ipcRenderer?: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
    on: (channel: string, listener: (...args: unknown[]) => void) => void
    removeListener: (
      channel: string,
      listener: (...args: unknown[]) => void
    ) => void
  }
}

export function createTrayApi(dependencies: TrayApiDependencies = {}) {
  const bridge = dependencies.contextBridge ?? electron.contextBridge
  const renderer = dependencies.ipcRenderer ?? electron.ipcRenderer

  const api: TrayApi = {
    syncState: async state => {
      await renderer.invoke(TRAY_IPC_CHANNELS.SYNC_STATE, state)
    },
    onCommand: listener => {
      const ipcListener = (_event: unknown, command: unknown) => {
        listener(command as TrayCommand)
      }

      renderer.on(TRAY_IPC_CHANNELS.COMMAND, ipcListener)

      return () => {
        renderer.removeListener(TRAY_IPC_CHANNELS.COMMAND, ipcListener)
      }
    },
  }

  return {
    api,
    expose() {
      bridge.exposeInMainWorld('electronTray', api)
    },
  }
}

export function exposeTrayApi() {
  createTrayApi().expose()
}
