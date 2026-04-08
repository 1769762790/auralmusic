import Store from 'electron-store'
import { AppConfig, defaultConfig } from './types'

// 单例模式：保证整个应用只有一个配置存储实例
class ConfigStore {
  private static instance: Store<AppConfig>

  // 私有化构造，禁止外部实例化
  private constructor() {}

  // 获取全局唯一实例
  public static getInstance(): Store<AppConfig> {
    if (!ConfigStore.instance) {
      ConfigStore.instance = new Store<AppConfig>({
        name: 'aural-music-config', // 存储文件名：aural-music-config.json
        defaults: defaultConfig,
        // 可选：添加 schema 校验，防止非法配置写入
        schema: {
          theme: { type: 'string', enum: ['light', 'dark', 'system'] },
          quality: { type: 'string', enum: ['standard', 'high', 'lossless'] },
        },
      })
    }
    return ConfigStore.instance
  }
}

// 导出配置实例
export const configStore = ConfigStore.getInstance()

// 导出快捷读写方法
export const getConfig = <K extends keyof AppConfig>(key: K): AppConfig[K] => {
  return configStore.get(key)
}

export const setConfig = <K extends keyof AppConfig>(
  key: K,
  value: AppConfig[K]
): void => {
  configStore.set(key, value)
}

export const resetConfig = (): void => {
  configStore.reset()
}
