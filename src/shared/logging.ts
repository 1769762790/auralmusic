export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

export type LogMeta = Record<string, unknown>

export type RendererLogPayload = {
  level: LogLevel | string
  scope: string
  message: string
  meta?: unknown
}

const SENSITIVE_KEY_PATTERN =
  /cookie|authorization|token|password|secret|music_u/i
const PATH_KEY_PATTERN = /path|filepath|targetpath|localpath/i
const URL_KEY_PATTERN = /sourceurl|audiourl|playurl|musicurl/i
const MAX_SANITIZE_DEPTH = 6

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function toBaseName(value: string) {
  return value.split(/[\\/]/).filter(Boolean).at(-1) || value
}

function shouldRedactUrl(key: string, value: string) {
  if (URL_KEY_PATTERN.test(key)) {
    return true
  }

  return (
    /^https?:\/\//i.test(value) &&
    /\.(mp3|flac|m4a|aac|ogg|wav)(\?|$)/i.test(value)
  )
}

function sanitizeValue(value: unknown, key: string, depth: number): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return '[redacted]'
  }

  if (typeof value === 'string') {
    if (shouldRedactUrl(key, value)) {
      return '[redacted-url]'
    }

    if (PATH_KEY_PATTERN.test(key)) {
      return toBaseName(value)
    }

    return value
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    }
  }

  if (value === null || typeof value !== 'object') {
    return value
  }

  if (depth >= MAX_SANITIZE_DEPTH) {
    return '[max-depth]'
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, key, depth + 1))
  }

  if (!isPlainObject(value)) {
    return String(value)
  }

  return Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      sanitizeValue(entryValue, entryKey, depth + 1),
    ])
  )
}

/**
 * 统一处理日志元数据，避免用户凭证、音频直链和本地完整路径写入日志。
 * @param meta 原始日志元数据
 * @returns 可安全落盘的元数据
 */
export function sanitizeLogMeta(meta: unknown): LogMeta {
  const sanitized = sanitizeValue(meta, '', 0)
  return isPlainObject(sanitized) ? sanitized : { value: sanitized }
}

export function isLogLevel(value: unknown): value is LogLevel {
  return LOG_LEVELS.includes(value as LogLevel)
}

export function sanitizeLogScope(value: unknown) {
  const scope = String(value || 'app')
    .trim()
    .replace(/[^a-zA-Z0-9:_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return (scope || 'app').slice(0, 64)
}

export function sanitizeLogMessage(value: unknown) {
  return (
    String(value || '')
      .trim()
      .slice(0, 500) || 'log'
  )
}

export function readLogUrlHost(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  try {
    return new URL(value).host || null
  } catch {
    return null
  }
}
