interface LocalFontData {
  family: string
  fullName?: string
  postscriptName?: string
  style?: string
}

interface LocalFontWindow extends Window {
  queryLocalFonts?: () => Promise<LocalFontData[]>
}

export type SystemFontQueryStatus =
  | 'ok'
  | 'unsupported'
  | 'empty'
  | 'not-allowed'
  | 'security-error'
  | 'error'

export interface SystemFontQueryResult {
  fonts: string[]
  status: SystemFontQueryStatus
  message?: string
}

const BUILT_IN_FONT_FAMILIES = [
  'Inter Variable',
  'Geist Variable',
  'system-ui',
] as const

function normalizeFontFamilies(fonts: LocalFontData[]) {
  return Array.from(
    new Set(
      fonts
        .map(font => font.family?.trim())
        .filter((family): family is string => Boolean(family))
    )
  ).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

export async function querySystemFontFamilies(): Promise<SystemFontQueryResult> {
  const queryLocalFonts = (window as LocalFontWindow).queryLocalFonts

  if (!queryLocalFonts) {
    return {
      fonts: [],
      status: 'unsupported',
      message: '当前运行环境不支持读取本地字体。',
    }
  }

  try {
    const fonts = normalizeFontFamilies(await queryLocalFonts())

    return {
      fonts,
      status: fonts.length > 0 ? 'ok' : 'empty',
      message: fonts.length > 0 ? undefined : '系统字体接口返回了空列表。',
    }
  } catch (error) {
    const errorName = error instanceof DOMException ? error.name : ''
    const message = error instanceof Error ? error.message : String(error)

    if (errorName === 'NotAllowedError') {
      return {
        fonts: [],
        status: 'not-allowed',
        message: '未授权读取系统字体。',
      }
    }

    if (errorName === 'SecurityError') {
      return {
        fonts: [],
        status: 'security-error',
        message: '当前页面安全上下文或权限策略阻止了读取系统字体。',
      }
    }

    return {
      fonts: [],
      status: 'error',
      message,
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
