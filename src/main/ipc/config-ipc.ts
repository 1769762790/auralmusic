import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../config/types'
import { getConfig, setConfig, resetConfig } from '../config/store'
import type { AppConfig } from '../config/types'

// 注册配置相关 IPC 处理器
export function registerConfigIpc() {
  // 读取单个配置项
  ipcMain.handle(IPC_CHANNELS.CONFIG.GET, (_event, key: keyof AppConfig) => {
    return getConfig(key)
  })

  // 修改单个配置项
  ipcMain.handle(
    IPC_CHANNELS.CONFIG.SET,
    (_event, key: keyof AppConfig, value: AppConfig[keyof AppConfig]) => {
      setConfig(key, value)
    }
  )

  // 重置所有配置为默认值
  ipcMain.handle(IPC_CHANNELS.CONFIG.RESET, () => {
    resetConfig()
  })
}
