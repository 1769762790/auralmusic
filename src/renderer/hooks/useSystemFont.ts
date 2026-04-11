import { useEffect } from 'react'
import { useConfigStore } from '@/stores/config-store'

const SYSTEM_FONT_VALUE = 'system-ui'
const SYSTEM_FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function resolveFontStack(fontFamily: string) {
  if (fontFamily === SYSTEM_FONT_VALUE) {
    return SYSTEM_FONT_STACK
  }

  return `${JSON.stringify(fontFamily)}, ${SYSTEM_FONT_STACK}`
}

export function useSystemFont() {
  const fontFamily = useConfigStore(state => state.config.fontFamily)
  const initConfig = useConfigStore(state => state.initConfig)
  const isLoading = useConfigStore(state => state.isLoading)
  const setConfig = useConfigStore(state => state.setConfig)

  useEffect(() => {
    if (!isLoading) {
      return
    }

    void initConfig()
  }, [initConfig, isLoading])

  useEffect(() => {
    if (isLoading || !fontFamily) {
      return
    }

    document.documentElement.style.setProperty(
      '--font-sans',
      resolveFontStack(fontFamily)
    )
  }, [fontFamily, isLoading])

  return {
    currentFontFamily: fontFamily,
    isFontLoading: isLoading,
    setFontFamily: (value: string) => setConfig('fontFamily', value),
  }
}

export { SYSTEM_FONT_VALUE }
