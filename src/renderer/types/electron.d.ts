import type { ConfigApi } from '@preload/api/config-api'
import type { AuthApi } from '@preload/api/auth-api'
import type { RuntimeApi } from '@preload/api/runtime-api'

declare global {
  interface Window {
    appRuntime: RuntimeApi
    electronAuth: AuthApi
    electronConfig: ConfigApi
  }
}

export {}
