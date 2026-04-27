import electronLog from 'electron-log/main'
import electron from 'electron'
import path from 'node:path'

import {
  sanitizeLogMessage,
  sanitizeLogMeta,
  sanitizeLogScope,
  type LogLevel,
} from '../../shared/logging.ts'
import {
  cleanupOldLogFiles,
  MAIN_LOG_MAX_SIZE_BYTES,
  rotateLogFile,
} from './log-retention.model.ts'

type ScopedLogger = Record<LogLevel, (message: string, meta?: unknown) => void>

let initialized = false

function hasMeta(meta: unknown) {
  return meta !== undefined
}

function writeScopedLog(
  logger: Pick<typeof electronLog, LogLevel>,
  level: LogLevel,
  message: string,
  meta?: unknown
) {
  const safeMessage = sanitizeLogMessage(message)

  if (hasMeta(meta)) {
    logger[level](safeMessage, sanitizeLogMeta(meta))
    return
  }

  logger[level](safeMessage)
}

export function initializeMainLogger() {
  if (initialized) {
    return
  }

  electronLog.initialize({
    preload: true,
    spyRendererConsole: false,
  })

  electronLog.transports.file.level = 'info'
  electronLog.transports.file.maxSize = MAIN_LOG_MAX_SIZE_BYTES
  electronLog.transports.file.format =
    '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{scope}] {text}'
  electronLog.transports.file.archiveLogFn = oldLogFile => {
    rotateLogFile(oldLogFile.path)
  }
  electronLog.transports.console.level =
    process.env.NODE_ENV_ELECTRON_VITE === 'development' ? 'debug' : 'warn'
  electronLog.transports.console.format =
    '[{h}:{i}:{s}.{ms}] [{level}] [{scope}] {text}'

  electronLog.errorHandler.startCatching({ showDialog: false })
  electronLog.eventLogger.startLogging({
    scope: 'electron',
    level: 'warn',
  })

  cleanupOldLogFiles(path.dirname(getMainLogFilePath()))

  initialized = true
}

export function createMainLogger(scope: string): ScopedLogger {
  const logger = electronLog.scope(sanitizeLogScope(scope))

  return {
    debug: (message, meta) => writeScopedLog(logger, 'debug', message, meta),
    info: (message, meta) => writeScopedLog(logger, 'info', message, meta),
    warn: (message, meta) => writeScopedLog(logger, 'warn', message, meta),
    error: (message, meta) => writeScopedLog(logger, 'error', message, meta),
  }
}

export function getMainLogFilePath() {
  return electronLog.transports.file.getFile().path
}

export async function openMainLogDirectory() {
  const result = await electron.shell.openPath(
    path.dirname(getMainLogFilePath())
  )
  return result === ''
}
