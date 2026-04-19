import type {
  LxInitedData,
  LxScriptInfo,
  LxScriptRequestPayload,
  LxScriptRequestResult,
} from '../../../../shared/lx-music-source.ts'
import type {
  HostMessage,
  LxRequestCallback,
  WorkerMessage,
} from '@/types/core'
import {
  createLxCurrentScriptInfo,
  createLxRuntimeBuffer,
  createLxRuntimeMd5,
  lxRuntimeBufferToString,
} from '../model/lx-runtime-utils.ts'
import { installLxScriptCompatGlobals } from '../model/lx-script-compat.ts'
import { executeLxScript } from '../model/lx-script-executor.ts'

let requestCounter = 0
let requestHandler:
  | ((
      payload: LxScriptRequestPayload
    ) => Promise<LxScriptRequestResult> | LxScriptRequestResult)
  | null = null

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

function createLxApi(scriptInfo: LxScriptInfo, rawScript: string) {
  const unavailable = (name: string) => {
    return () => {
      throw new Error(`Current worker does not support lx.utils.${name}`)
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
    currentScriptInfo: createLxCurrentScriptInfo(scriptInfo, rawScript),
    EVENT_NAMES: {
      inited: 'inited',
      request: 'request',
      updateAlert: 'updateAlert',
    },
    on: (eventName: string, handler: unknown) => {
      if (eventName !== 'request') {
        return
      }

      if (typeof handler !== 'function') {
        throw new Error('lx.on(request) requires a function handler')
      }

      requestHandler = handler as (
        payload: LxScriptRequestPayload
      ) => Promise<LxScriptRequestResult> | LxScriptRequestResult
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
        from: createLxRuntimeBuffer,
        bufToString: lxRuntimeBufferToString,
      },
      crypto: {
        md5: createLxRuntimeMd5,
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

async function resolveInvocation(
  callId: string,
  payload: LxScriptRequestPayload
) {
  if (!requestHandler) {
    postToHost({
      type: 'invoke-error',
      callId,
      message: 'LX script did not register lx.on(request)',
    })
    return
  }

  try {
    const result = await requestHandler(payload)
    postToHost({
      type: 'invoke-result',
      callId,
      result,
    })
  } catch (error) {
    postToHost({
      type: 'invoke-error',
      callId,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

async function initializeScript(script: string, scriptInfo: LxScriptInfo) {
  requestHandler = null
  pendingHttpCallbacks.clear()
  requestCounter = 0
  hardenGlobalScope()
  installLxScriptCompatGlobals(globalThis as Record<string, unknown>)
  ;(globalThis as { lx?: unknown }).lx = createLxApi(scriptInfo, script)
  const workerScope = globalThis as unknown as Record<string, unknown> & {
    lx: unknown
  }
  executeLxScript(script, workerScope)
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
    case 'invoke-request':
      await resolveInvocation(message.callId, message.payload)
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
