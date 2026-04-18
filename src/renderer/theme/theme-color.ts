import type { ThemeColorTokenMap, ThemeColorVariableName } from '@/types/core'

const THEME_COLOR_VARIABLES: readonly ThemeColorVariableName[] = [
  '--primary',
  '--primary-foreground',
  '--ring',
  '--accent',
  '--accent-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
]

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function parseHexChannel(value: string, start: number) {
  return Number.parseInt(value.slice(start, start + 2), 16)
}

function hexToRgb(hex: string) {
  return {
    r: parseHexChannel(hex, 1),
    g: parseHexChannel(hex, 3),
    b: parseHexChannel(hex, 5),
  }
}

function toHexChannel(value: number) {
  return clampChannel(value).toString(16).padStart(2, '0').toUpperCase()
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`
}

function mixWithWhite(hex: string, ratio: number) {
  const { r, g, b } = hexToRgb(hex)

  return rgbToHex(
    r + (255 - r) * ratio,
    g + (255 - g) * ratio,
    b + (255 - b) * ratio
  )
}

function pickForegroundColor(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness >= 160 ? '#111827' : '#FFFFFF'
}

export function normalizeThemeColor(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const normalized = trimmedValue.replace(/^#?/, '#').toUpperCase()

  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : null
}

export function deriveThemeColorTokens(color: string): ThemeColorTokenMap {
  const normalizedColor = normalizeThemeColor(color)

  if (!normalizedColor) {
    throw new Error('Invalid theme color')
  }

  const accentColor = mixWithWhite(normalizedColor, 0.82)
  const sidebarAccentColor = mixWithWhite(normalizedColor, 0.88)

  return {
    '--primary': normalizedColor,
    '--primary-foreground': pickForegroundColor(normalizedColor),
    '--ring': `${normalizedColor}66`,
    '--accent': accentColor,
    '--accent-foreground': pickForegroundColor(accentColor),
    '--sidebar-primary': normalizedColor,
    '--sidebar-primary-foreground': pickForegroundColor(normalizedColor),
    '--sidebar-accent': sidebarAccentColor,
    '--sidebar-accent-foreground': pickForegroundColor(sidebarAccentColor),
  }
}

export function applyThemeColorOverrides(
  style: Pick<CSSStyleDeclaration, 'setProperty'>,
  color: string
) {
  const tokens = deriveThemeColorTokens(color)

  for (const [name, value] of Object.entries(tokens)) {
    style.setProperty(name, value)
  }
}

export function clearThemeColorOverrides(
  style: Pick<CSSStyleDeclaration, 'removeProperty'>
) {
  for (const name of THEME_COLOR_VARIABLES) {
    style.removeProperty(name)
  }
}
