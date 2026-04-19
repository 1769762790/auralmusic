import type {
  PlaybackResolverAuthState,
  PlaybackResolverConfig,
  PlaybackSourceResolverDeps,
} from '@/types/core'
import { createPlaybackSourceResolver as createPlaybackSourceResolverBase } from './model/playback-source-resolver.model.ts'
import { useAuthStore } from '../../stores/auth-store.ts'
import { useConfigStore } from '../../stores/config-store.ts'

async function getDefaultAuthState(): Promise<PlaybackResolverAuthState> {
  return useAuthStore.getState()
}

async function getDefaultConfig(): Promise<PlaybackResolverConfig> {
  return useConfigStore.getState().config
}

export function createPlaybackSourceResolver(
  deps: PlaybackSourceResolverDeps = {}
) {
  return createPlaybackSourceResolverBase({
    ...deps,
    getAuthState: deps.getAuthState ?? getDefaultAuthState,
    getConfig: deps.getConfig ?? getDefaultConfig,
  })
}

export const resolvePlaybackSource = createPlaybackSourceResolver()
