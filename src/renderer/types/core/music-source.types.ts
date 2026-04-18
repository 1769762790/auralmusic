import type { AppConfig } from '../../../shared/config.ts'
import type { AuthSession, AuthUser } from '../../../shared/auth.ts'
import type {
  LxInitedData,
  LxScriptInfo,
  LxScriptRequestPayload,
  LxScriptRequestResult,
} from '../../../shared/lx-music-source.ts'
import type {
  MusicResolverId,
  ResolveContext,
  ResolverPolicy,
} from '../../../shared/music-source/index.ts'
import type {
  PlaybackTrack,
  SongUrlV1Result,
} from '../../../shared/playback.ts'

export type MusicSourceMaybePromise<T> = T | Promise<T>

export type PlaybackResolverLoginStatus =
  | 'anonymous'
  | 'authenticated'
  | 'expired'

export interface PlaybackResolverAuthState {
  user?: AuthUser | null
  session?: AuthSession | null
  loginStatus?: PlaybackResolverLoginStatus | null
}

export type PlaybackResolverConfig = ResolveContext['config'] &
  Partial<Omit<AppConfig, keyof ResolveContext['config']>>

export interface PlaybackSourceProviderOptions {
  track: PlaybackTrack
  context: ResolveContext
  policy: ResolverPolicy
  config: PlaybackResolverConfig
}

export interface PlaybackSourceProvider {
  resolve: (
    options: PlaybackSourceProviderOptions
  ) => Promise<SongUrlV1Result | null>
}

export type PlaybackSourceTraceEvent =
  | {
      type: 'start'
      trackId: number
      isAuthenticated: boolean
      resolverOrder: MusicResolverId[]
      builtinPlatforms: ResolverPolicy['builtinPlatforms']
    }
  | {
      type: 'try' | 'miss' | 'hit' | 'skip'
      trackId: number
      resolverId: MusicResolverId
      reason?: string
    }
  | {
      type: 'error'
      trackId: number
      resolverId: MusicResolverId
      error: unknown
    }

export interface PlaybackSourceTraceLogger {
  log: (event: PlaybackSourceTraceEvent) => void
}

export interface PlaybackSourceResolverDeps {
  getAuthState?: () => MusicSourceMaybePromise<PlaybackResolverAuthState>
  getConfig?: () => MusicSourceMaybePromise<PlaybackResolverConfig>
  providers?: Partial<Record<MusicResolverId, PlaybackSourceProvider>>
  trace?: PlaybackSourceTraceLogger
}

export interface ResolvePlaybackSourceOptions {
  track: PlaybackTrack
  authState?: PlaybackResolverAuthState
  config?: PlaybackResolverConfig
}

export type LxPlaybackResolverConfig = Pick<
  AppConfig,
  | 'musicSourceEnabled'
  | 'luoxueSourceEnabled'
  | 'activeLuoxueMusicSourceScriptId'
  | 'luoxueMusicSourceScripts'
>

export interface WorkerInitializeMessage {
  type: 'initialize'
  script: string
  scriptInfo: LxScriptInfo
}

export interface WorkerHttpResponseMessage {
  type: 'http-response'
  requestId: string
  response: unknown
  body: unknown
  error?: string
}

export interface WorkerInvokeRequestMessage {
  type: 'invoke-request'
  callId: string
  payload: LxScriptRequestPayload
}

export type RunnerToWorkerMessage =
  | WorkerInitializeMessage
  | WorkerHttpResponseMessage
  | WorkerInvokeRequestMessage

export interface WorkerInitializedMessage {
  type: 'initialized'
  data: LxInitedData
}

export interface WorkerScriptErrorMessage {
  type: 'script-error'
  message: string
}

export interface WorkerHttpRequestMessage {
  type: 'http-request'
  requestId: string
  url: string
  options: RequestInit
}

export interface WorkerLogMessage {
  type: 'log'
  level: 'log' | 'warn' | 'error' | 'info'
  args: unknown[]
}

export interface WorkerInvokeResultMessage {
  type: 'invoke-result'
  callId: string
  result: LxScriptRequestResult
}

export interface WorkerInvokeErrorMessage {
  type: 'invoke-error'
  callId: string
  message: string
}

export type WorkerToRunnerMessage =
  | WorkerInitializedMessage
  | WorkerScriptErrorMessage
  | WorkerHttpRequestMessage
  | WorkerLogMessage
  | WorkerInvokeResultMessage
  | WorkerInvokeErrorMessage

export type HostMessage = RunnerToWorkerMessage
export type WorkerMessage = WorkerToRunnerMessage

export type LxRequestCallback = (
  err: Error | null,
  response: unknown,
  body: unknown
) => void
