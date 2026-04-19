import { isAuthenticatedForMusicResolution } from '../../../shared/music-source/index.ts'
import type {
  DownloadResolverConfig,
  DownloadSourceMaybePromise,
  DownloadSourceResolverDeps,
} from '@/types/core'
import { createDownloadSourceResolver as createDownloadSourceResolverBase } from './model/download-source-resolver.model.ts'
import { useAuthStore } from '../../stores/auth-store.ts'
import { useConfigStore } from '../../stores/config-store.ts'

export type {
  DownloadResolutionPolicy,
  ResolvedDownloadSource,
} from '@/types/core'

async function getDefaultConfig(): Promise<DownloadResolverConfig> {
  return useConfigStore.getState().config
}

async function getDefaultIsAuthenticated(): Promise<boolean> {
  const authState = useAuthStore.getState()
  return isAuthenticatedForMusicResolution({
    loginStatus: authState.loginStatus,
    userId: authState.user?.userId ?? authState.session?.userId ?? null,
    cookie: authState.session?.cookie ?? null,
  })
}

export function createDownloadSourceResolver(
  deps: DownloadSourceResolverDeps = {}
) {
  return createDownloadSourceResolverBase({
    ...deps,
    getConfig: deps.getConfig ?? getDefaultConfig,
    getIsAuthenticated:
      deps.getIsAuthenticated ??
      (getDefaultIsAuthenticated as () => DownloadSourceMaybePromise<boolean>),
  })
}
