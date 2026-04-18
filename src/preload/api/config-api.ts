import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc/index.ts'
import type { AppConfig } from '../../shared/config.ts'

// 定义暴露给渲染进程的 API 类型
export type ConfigApi = {
  getConfig: <K extends keyof AppConfig>(key: K) => Promise<AppConfig[K]>
  setConfig: <K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K]
  ) => Promise<void>
  resetConfig: () => Promise<void>
}

// 封装 API 实现
const configApi: ConfigApi = {
  getConfig: async key => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONFIG.GET, key)
  },
  setConfig: async (key, value) => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONFIG.SET, key, value)
  },
  resetConfig: async () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONFIG.RESET)
  },
}

// 暴露 API 到 window 对象
export function exposeConfigApi() {
  contextBridge.exposeInMainWorld('electronConfig', configApi)
}
