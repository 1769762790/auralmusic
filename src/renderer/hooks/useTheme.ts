import { useEffect, useState } from 'react'
import { useConfigStore } from '../stores/config-store'

// 🔥 自动初始化 + 自动同步主题，组件直接用
export function useTheme() {
  // 从 Zustand 获取状态
  const theme = useConfigStore(state => state.config.theme)
  const initConfig = useConfigStore(state => state.initConfig)
  const isLoading = useConfigStore(state => state.isLoading)
  const setConfig = useConfigStore(state => state.setConfig)

  // 🔥 关键：组件挂载时自动初始化配置（只执行一次）
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      // 避免重复初始化
      if (!isLoading && isMounted) return
      await initConfig()
    }
    init()

    return () => {
      isMounted = false
    }
  }, [initConfig, isLoading])

  // 🔥 自动同步 Tailwind 暗模式
  useEffect(() => {
    if (isLoading || !theme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateDarkMode = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches)
      document.documentElement.classList.toggle('dark', isDark)
    }

    updateDarkMode()
    mediaQuery.addEventListener('change', updateDarkMode)
    return () => mediaQuery.removeEventListener('change', updateDarkMode)
  }, [theme, isLoading])

  // 返回主题操作方法
  return {
    currentTheme: theme,
    isThemeLoading: isLoading, // 组件可用加载状态占位
    setLightTheme: () => setConfig('theme', 'light'),
    setDarkTheme: () => setConfig('theme', 'dark'),
    setSystemTheme: () => setConfig('theme', 'system'),
  }
}
