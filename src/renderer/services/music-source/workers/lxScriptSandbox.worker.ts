import type {
  LxInitedData,
  LxScriptInfo,
} from '../../../../shared/lx-music-source'

type WorkerInitMessage = {
  type: 'initialize'
  script: string
  scriptInfo: LxScriptInfo
}

type WorkerHttpResponseMessage = {
  type: 'http-response'
  requestId: string
  response: unknown
  body: unknown
  error?: string
}

type HostMessage = WorkerInitMessage | WorkerHttpResponseMessage

type WorkerMessage =
  | { type: 'initialized'; data: LxInitedData }
  | { type: 'script-error'; message: string }
  | {
      type: 'http-request'
      requestId: string
      url: string
      options: RequestInit
    }
  | { type: 'log'; level: 'log' | 'warn' | 'error' | 'info'; args: unknown[] }

type LxRequestCallback = (
  err: Error | null,
  response: unknown,
  body: unknown
) => void

let requestCounter = 0
const pendingHttpCallbacks = new Map<string, LxRequestCallback>()

const postToHost = (message: WorkerMessage) => {
  globalThis.postMessage(message)
}

const postLog = (
  level: 'log' | 'warn' | 'error' | 'info',
  ...args: unknown[]
) => {
  postToHost({ type: 'log', level, args })
}

function hardenGlobalScope() {
  ;['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource'].forEach(key => {
    try {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: false,
        value: undefined,
      })
    } catch {
      // Some runtimes do not allow redefining these globals.
    }
  })
}

function createLxApi(scriptInfo: LxScriptInfo) {
  const unavailable = (name: string) => {
    return () => {
      throw new Error(`当前阶段暂不支持 lx.utils.${name}`)
    }
  }

  return {
    version: '2.8.0',
    env: 'desktop',
    appInfo: {
      version: '2.8.0',
      versionNum: 208,
      locale: 'zh-cn',
    },
    currentScriptInfo: scriptInfo,
    EVENT_NAMES: {
      inited: 'inited',
      request: 'request',
      updateAlert: 'updateAlert',
    },
    on: () => {
      // Playback request handling is intentionally not wired in this phase.
    },
    send: (eventName: string, data: unknown) => {
      if (eventName === 'inited') {
        postToHost({
          type: 'initialized',
          data: data as LxInitedData,
        })
      }

      if (eventName === 'updateAlert') {
        postLog('info', '[updateAlert]', data)
      }
    },
    request: (
      url: string,
      options: RequestInit,
      callback: LxRequestCallback
    ) => {
      const requestId = `lx_http_${Date.now()}_${requestCounter++}`
      pendingHttpCallbacks.set(requestId, callback)
      postToHost({
        type: 'http-request',
        requestId,
        url,
        options,
      })

      return () => {
        pendingHttpCallbacks.delete(requestId)
      }
    },
    utils: {
      buffer: {
        from: (data: string | ArrayBuffer | ArrayLike<number>) => {
          if (typeof data === 'string') {
            return new TextEncoder().encode(data)
          }

          return new Uint8Array(data)
        },
        bufToString: (buffer: Uint8Array, encoding?: string) => {
          return new TextDecoder(encoding || 'utf-8').decode(buffer)
        },
      },
      crypto: {
        md5: unavailable('crypto.md5'),
        sha1: unavailable('crypto.sha1'),
        sha256: unavailable('crypto.sha256'),
        randomBytes: unavailable('crypto.randomBytes'),
        aesEncrypt: unavailable('crypto.aesEncrypt'),
        aesDecrypt: unavailable('crypto.aesDecrypt'),
        rsaEncrypt: unavailable('crypto.rsaEncrypt'),
        rsaDecrypt: unavailable('crypto.rsaDecrypt'),
        base64Encode: unavailable('crypto.base64Encode'),
        base64Decode: unavailable('crypto.base64Decode'),
      },
      zlib: {
        inflate: unavailable('zlib.inflate'),
        deflate: unavailable('zlib.deflate'),
      },
    },
  }
}

async function initializeScript(script: string, scriptInfo: LxScriptInfo) {
  pendingHttpCallbacks.clear()
  requestCounter = 0
  hardenGlobalScope()
  ;(globalThis as { lx?: unknown }).lx = createLxApi(scriptInfo)

  const sandboxScript = `
    const globalThisRef = globalThis;
    const lx = globalThis.lx;
    ${script}
    export {};
  `
  const scriptUrl = URL.createObjectURL(
    new Blob([sandboxScript], { type: 'text/javascript' })
  )

  try {
    await import(/* @vite-ignore */ scriptUrl)
  } finally {
    URL.revokeObjectURL(scriptUrl)
  }
}

globalThis.onmessage = async (event: MessageEvent<HostMessage>) => {
  const message = event.data

  switch (message.type) {
    case 'initialize':
      try {
        await initializeScript(message.script, message.scriptInfo)
      } catch (error) {
        postToHost({
          type: 'script-error',
          message: error instanceof Error ? error.message : String(error),
        })
      }
      break
    case 'http-response': {
      const callback = pendingHttpCallbacks.get(message.requestId)
      if (!callback) {
        return
      }

      pendingHttpCallbacks.delete(message.requestId)

      if (message.error) {
        callback(new Error(message.error), null, null)
        return
      }

      callback(null, message.response, message.body)
      break
    }
    default:
      break
  }
}
