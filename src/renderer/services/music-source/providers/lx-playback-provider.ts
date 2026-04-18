import type { AudioQualityLevel } from '../../../../shared/config.ts'
import { resolveTrackWithLxMusicSource } from '../lx-playback-resolver.ts'
import type {
  LxPlaybackResolverConfig,
  PlaybackResolverConfig,
  PlaybackSourceProvider,
  PlaybackSourceProviderOptions,
} from '@/types/core'

function getQuality(options: PlaybackSourceProviderOptions): AudioQualityLevel {
  return options.context.config.quality ?? 'higher'
}

function isValidLxPlaybackConfig(
  config: PlaybackResolverConfig
): config is PlaybackResolverConfig & LxPlaybackResolverConfig {
  return (
    Array.isArray(config.luoxueMusicSourceScripts) &&
    (typeof config.activeLuoxueMusicSourceScriptId === 'string' ||
      config.activeLuoxueMusicSourceScriptId === null)
  )
}

export function createLxPlaybackProvider(): PlaybackSourceProvider {
  return {
    resolve: async options => {
      if (!isValidLxPlaybackConfig(options.config)) {
        return null
      }

      return resolveTrackWithLxMusicSource({
        track: options.track,
        quality: getQuality(options),
        config: options.config,
      })
    },
  }
}
