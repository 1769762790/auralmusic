/**
 * 全局应用配置类型（所有持久化配置都在这里定义）
 */
export interface AppConfig {
  // 主题设置
  theme: 'light' | 'dark' | 'system'
  // 音质设置（可无限扩展）
  quality: 'standard' | 'high' | 'lossless'
}

// 默认配置（初始化兜底，所有配置的默认值）
export const defaultConfig: AppConfig = {
  theme: 'system',
  quality: 'high',
}

// IPC 通道名（统一管理，避免魔法字符串）
export const IPC_CHANNELS = {
  CONFIG: {
    GET: 'config:get',
    SET: 'config:set',
    RESET: 'config:reset',
  },
} as const
