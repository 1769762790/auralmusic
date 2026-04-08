import type { ConfigApi } from '@preload/api/config-api'
import type { RuntimeApi } from '@preload/api/runtime-api'

declare global {
  interface Window {
    appRuntime: RuntimeApi
    electronConfig: ConfigApi
  }
}

export {}
