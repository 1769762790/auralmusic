import { useEffect } from 'react'

import { useConfigStore } from '../stores/config-store'
import {
  applyThemeColorOverrides,
  clearThemeColorOverrides,
  normalizeThemeColor,
} from '../theme/theme-color'

export function useTheme() {
  const theme = useConfigStore(state => state.config.theme)
  const themeColor = useConfigStore(state => state.config.themeColor)
  const initConfig = useConfigStore(state => state.initConfig)
  const isLoading = useConfigStore(state => state.isLoading)
  const setConfig = useConfigStore(state => state.setConfig)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      if (!isLoading && isMounted) {
        return
      }

      await initConfig()
    }

    void init()

    return () => {
      isMounted = false
    }
  }, [initConfig, isLoading])

  useEffect(() => {
    if (isLoading || !theme) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateDarkMode = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches)

      document.documentElement.classList.toggle('dark', isDark)
    }

    updateDarkMode()
    mediaQuery.addEventListener('change', updateDarkMode)

    return () => {
      mediaQuery.removeEventListener('change', updateDarkMode)
    }
  }, [theme, isLoading])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const rootStyle = document.documentElement.style
    const normalizedThemeColor = normalizeThemeColor(themeColor)

    if (!normalizedThemeColor) {
      clearThemeColorOverrides(rootStyle)
      return
    }

    applyThemeColorOverrides(rootStyle, normalizedThemeColor)
  }, [themeColor, isLoading])

  return {
    currentTheme: theme,
    isThemeLoading: isLoading,
    setLightTheme: () => setConfig('theme', 'light'),
    setDarkTheme: () => setConfig('theme', 'dark'),
    setSystemTheme: () => setConfig('theme', 'system'),
  }
}
