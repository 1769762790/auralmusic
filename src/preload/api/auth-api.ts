import { contextBridge, ipcRenderer } from 'electron'
import { AUTH_IPC_CHANNELS } from '../../shared/ipc/auth.ts'
import type { AuthSession } from '../../shared/auth'

export type AuthApi = {
  getAuthSession: () => Promise<AuthSession | null>
  setAuthSession: (authSession: AuthSession) => Promise<AuthSession>
  clearAuthSession: () => Promise<void>
}

const authApi: AuthApi = {
  getAuthSession: async () => {
    return ipcRenderer.invoke(AUTH_IPC_CHANNELS.GET)
  },
  setAuthSession: async authSession => {
    return ipcRenderer.invoke(AUTH_IPC_CHANNELS.SET, authSession)
  },
  clearAuthSession: async () => {
    return ipcRenderer.invoke(AUTH_IPC_CHANNELS.CLEAR)
  },
}

export function exposeAuthApi() {
  contextBridge.exposeInMainWorld('electronAuth', authApi)
}
