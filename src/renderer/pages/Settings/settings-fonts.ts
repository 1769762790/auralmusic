import type { SystemFontQueryResult } from './types'

export type { SystemFontQueryResult, SystemFontQueryStatus } from './types'

const BUILT_IN_FONT_FAMILIES = [
  'Inter Variable',
  'Geist Variable',
  'system-ui',
] as const

function normalizeFontFamilies(fonts: string[]) {
  return Array.from(
    new Set(
      fonts
        .map(font => font.trim())
        .filter((family): family is string => Boolean(family))
    )
  ).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

export async function querySystemFontFamilies(): Promise<SystemFontQueryResult> {
  const systemFontsApi = window.electronSystemFonts

  if (!systemFontsApi) {
    return {
      fonts: [],
      status: 'unsupported',
      message: '当前运行环境不支持读取系统字体。',
    }
  }

  try {
    const fonts = normalizeFontFamilies(await systemFontsApi.getAll())

    return {
      fonts,
      status: fonts.length > 0 ? 'ok' : 'empty',
      message: fonts.length > 0 ? undefined : '系统字体列表为空。',
    }
  } catch (error) {
    return {
      fonts: [],
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

export function mergeFontFamilies(
  systemFonts: string[],
  currentFontFamily?: string
) {
  return Array.from(
    new Set([
      ...BUILT_IN_FONT_FAMILIES,
      ...(currentFontFamily ? [currentFontFamily] : []),
      ...systemFonts,
    ])
  )
}
