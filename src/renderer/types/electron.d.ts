import type { ConfigApi } from '@preload/api/config-api'
import type { AuthApi } from '@preload/api/auth-api'
import type { RuntimeApi } from '@preload/api/runtime-api'
import type { WindowApi } from '@preload/api/window-api'
import type { MusicSourceApi } from '@preload/api/music-source-api'

declare global {
  interface Window {
    appRuntime: RuntimeApi
    electronAuth: AuthApi
    electronConfig: ConfigApi
    electronMusicSource: MusicSourceApi
    electronWindow: WindowApi
  }
}

export {}
