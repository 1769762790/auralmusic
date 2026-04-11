import type {
  LxInitedData,
  LxScriptInfo,
} from '../../../shared/lx-music-source'
import { parseLxScriptInfo } from '../../../shared/lx-music-source'

type WorkerInitializeMessage = {
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

type RunnerToWorkerMessage = WorkerInitializeMessage | WorkerHttpResponseMessage

type WorkerInitializedMessage = {
  type: 'initialized'
  data: LxInitedData
}

type WorkerScriptErrorMessage = {
  type: 'script-error'
  message: string
}

type WorkerHttpRequestMessage = {
  type: 'http-request'
  requestId: string
  url: string
  options: RequestInit
}

type WorkerLogMessage = {
  type: 'log'
  level: 'log' | 'warn' | 'error' | 'info'
  args: unknown[]
}

type WorkerToRunnerMessage =
  | WorkerInitializedMessage
  | WorkerScriptErrorMessage
  | WorkerHttpRequestMessage
  | WorkerLogMessage

export class LxMusicSourceRunner {
  private readonly script: string
  private readonly scriptInfo: LxScriptInfo
  private worker: Worker | null = null
  private initialized = false
  private initPromise: Promise<LxInitedData> | null = null
  private initResolver: ((data: LxInitedData) => void) | null = null
  private initRejecter: ((error: Error) => void) | null = null
  private initTimeoutId: number | null = null

  constructor(script: string) {
    this.script = script
    this.scriptInfo = parseLxScriptInfo(script)
  }

  getScriptInfo() {
    return this.scriptInfo
  }

  private ensureWorker() {
    if (this.worker) {
      return this.worker
    }

    const worker = new Worker(
      new URL('./workers/lxScriptSandbox.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (event: MessageEvent<WorkerToRunnerMessage>) => {
      void this.handleWorkerMessage(event.data)
    }
    worker.onerror = event => {
      const error = new Error(event.message || '音源脚本 Worker 运行错误')
      this.rejectInitialization(error)
    }

    this.worker = worker
    return worker
  }

  private postToWorker(message: RunnerToWorkerMessage) {
    this.ensureWorker().postMessage(message)
  }

  private clearInitState() {
    this.initResolver = null
    this.initRejecter = null

    if (this.initTimeoutId) {
      window.clearTimeout(this.initTimeoutId)
      this.initTimeoutId = null
    }
  }

  private resolveInitialization(data: LxInitedData) {
    this.initialized = true
    this.initResolver?.(data)
    this.clearInitState()
  }

  private rejectInitialization(error: Error) {
    this.initRejecter?.(error)
    this.clearInitState()
    this.initPromise = null
  }

  private async handleWorkerMessage(message: WorkerToRunnerMessage) {
    switch (message.type) {
      case 'initialized':
        this.resolveInitialization(message.data)
        break
      case 'script-error':
        this.rejectInitialization(new Error(message.message))
        break
      case 'http-request':
        await this.handleWorkerHttpRequest(message)
        break
      case 'log':
        console[message.level]('[LxScript]', ...message.args)
        break
      default:
        break
    }
  }

  private async handleWorkerHttpRequest(message: WorkerHttpRequestMessage) {
    try {
      const response = await window.electronMusicSource.lxHttpRequest(
        message.url,
        message.options
      )

      this.postToWorker({
        type: 'http-response',
        requestId: message.requestId,
        response,
        body: response.body,
      })
    } catch (error) {
      this.postToWorker({
        type: 'http-response',
        requestId: message.requestId,
        response: null,
        body: null,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  async initialize(): Promise<LxInitedData> {
    if (this.initPromise) {
      return this.initPromise
    }

    if (this.initialized) {
      return { sources: {} }
    }

    this.initPromise = new Promise<LxInitedData>((resolve, reject) => {
      this.initResolver = resolve
      this.initRejecter = reject
      this.initTimeoutId = window.setTimeout(() => {
        this.rejectInitialization(new Error('音源脚本初始化超时'))
      }, 10000)
    })

    this.postToWorker({
      type: 'initialize',
      script: this.script,
      scriptInfo: this.scriptInfo,
    })

    return this.initPromise
  }

  dispose() {
    this.clearInitState()
    this.worker?.terminate()
    this.worker = null
    this.initPromise = null
    this.initialized = false
  }
}

export async function validateLxMusicSourceScript(script: string) {
  const runner = new LxMusicSourceRunner(script)

  try {
    return await runner.initialize()
  } finally {
    runner.dispose()
  }
}
