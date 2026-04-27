import {
  isLogLevel,
  sanitizeLogMessage,
  sanitizeLogMeta,
  sanitizeLogScope,
  type LogLevel,
  type RendererLogPayload,
} from '../../shared/logging.ts'

type ScopedLogger = Record<LogLevel, (message: string, meta?: unknown) => void>

type NormalizedRendererLogPayload = {
  level: LogLevel
  scope: string
  message: string
  meta?: unknown
}

export function normalizeRendererLogPayload(
  payload: unknown
): NormalizedRendererLogPayload | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const value = payload as Partial<RendererLogPayload>
  if (!isLogLevel(value.level)) {
    return null
  }

  const scope = `renderer:${sanitizeLogScope(value.scope)}`
  const message = sanitizeLogMessage(value.message)
  const meta =
    value.meta === undefined ? undefined : sanitizeLogMeta(value.meta)

  return {
    level: value.level,
    scope,
    message,
    ...(meta === undefined ? {} : { meta }),
  }
}

export function writeRendererLogPayload(
  payload: unknown,
  createLogger: (scope: string) => ScopedLogger
) {
  const normalized = normalizeRendererLogPayload(payload)
  if (!normalized) {
    return false
  }

  const logger = createLogger(normalized.scope)
  logger[normalized.level](normalized.message, normalized.meta)
  return true
}
