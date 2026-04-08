import { create } from 'zustand'
import { AppConfig, defaultConfig } from '../../main/config/types'

// 定义 Store 状态类型
interface ConfigStoreState {
  // 配置状态（全局共享）
  config: AppConfig
  // 加载状态（避免组件渲染时用默认值）
  isLoading: boolean

  // 动作 Action
  initConfig: () => Promise<void> // 初始化：从本地读取配置
  setConfig: <K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K]
  ) => Promise<void>
  resetConfig: () => Promise<void> // 重置为默认配置
}

// 创建 Zustand Store
export const useConfigStore = create<ConfigStoreState>((set, get) => ({
  // 初始状态（用默认值兜底，加载完成后覆盖）
  config: defaultConfig,
  isLoading: true,

  // 1. 初始化：应用启动时从主进程拉取持久化配置
  initConfig: async () => {
    try {
      set({ isLoading: true })
      // 批量读取所有配置项
      const configKeys = Object.keys(defaultConfig) as (keyof AppConfig)[]
      const loadedConfig = {} as AppConfig

      for (const key of configKeys) {
        loadedConfig[key] = await window.electronConfig.getConfig(key)
      }

      // 更新 Zustand 全局状态
      set({ config: loadedConfig })
    } catch (err) {
      console.error('❌ 配置初始化失败:', err)
      // 出错时保持默认值，避免应用崩溃
    } finally {
      set({ isLoading: false })
    }
  },

  // 2. 修改配置：同步更新 Zustand 状态 + 持久化到本地
  setConfig: async (key, value) => {
    const currentConfig = get().config
    const newConfig = { ...currentConfig, [key]: value }

    // 第一步：更新内存状态（Zustand，所有组件实时响应）
    set({ config: newConfig })

    // 第二步：同步持久化到本地（electron-store，重启不丢失）
    try {
      await window.electronConfig.setConfig(key, value)
    } catch (err) {
      console.error('❌ 配置保存失败:', err)
      // 出错时回滚状态，保证数据一致性
      set({ config: currentConfig })
    }
  },

  // 3. 重置所有配置为默认值
  resetConfig: async () => {
    set({ config: defaultConfig, isLoading: true })
    try {
      await window.electronConfig.resetConfig()
    } catch (err) {
      console.error('❌ 配置重置失败:', err)
    } finally {
      set({ isLoading: false })
    }
  },
}))
