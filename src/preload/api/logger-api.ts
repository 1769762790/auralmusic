import electron from 'electron'

import { LOGGING_IPC_CHANNELS } from '../../shared/ipc/index.ts'
import type { LogLevel } from '../../shared/logging.ts'

export type LoggerApi = Record<
  LogLevel,
  (scope: string, message: string, meta?: unknown) => void
> & {
  getLogFilePath: () => Promise<string>
  openLogDirectory: () => Promise<boolean>
}

type LoggerApiDependencies = {
  contextBridge?: {
    exposeInMainWorld: (key: string, value: unknown) => void
  }
  ipcRenderer?: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}

export function createLoggerApi(dependencies: LoggerApiDependencies = {}) {
  const bridge = dependencies.contextBridge ?? electron.contextBridge
  const renderer = dependencies.ipcRenderer ?? electron.ipcRenderer

  const write = (
    level: LogLevel,
    scope: string,
    message: string,
    meta?: unknown
  ) => {
    void renderer
      .invoke(LOGGING_IPC_CHANNELS.WRITE, {
        level,
        scope,
        message,
        meta,
      })
      .catch(() => undefined)
  }

  const api: LoggerApi = {
    debug: (scope, message, meta) => write('debug', scope, message, meta),
    info: (scope, message, meta) => write('info', scope, message, meta),
    warn: (scope, message, meta) => write('warn', scope, message, meta),
    error: (scope, message, meta) => write('error', scope, message, meta),
    getLogFilePath: async () => {
      return renderer.invoke(
        LOGGING_IPC_CHANNELS.GET_FILE_PATH
      ) as Promise<string>
    },
    openLogDirectory: async () => {
      return renderer.invoke(
        LOGGING_IPC_CHANNELS.OPEN_DIRECTORY
      ) as Promise<boolean>
    },
  }

  return {
    api,
    expose() {
      bridge.exposeInMainWorld('electronLogger', api)
    },
  }
}

export function exposeLoggerApi() {
  createLoggerApi().expose()
}
