import { normalizeSongUrlMatchResponse } from '../../../../shared/playback.ts'
import { getSongUrlMatch as defaultGetSongUrlMatch } from '../../../api/list.ts'
import type { PlaybackSourceProvider } from '../playback-source-resolver.ts'
import type { AppConfig } from '../../../../main/config/types.ts'

type GetSongUrlMatch = typeof defaultGetSongUrlMatch

export const DEFAULT_BUILTIN_UNBLOCK_MATCH_SOURCES = [
  'unm',
  'bikonoo',
  'gdmusic',
  'msls',
  'qijieya',
] as const

export function createBuiltinUnblockPlaybackProvider(
  deps: {
    getSongUrlMatch?: GetSongUrlMatch
    matchSources?: readonly string[]
  } = {}
): PlaybackSourceProvider {
  const getSongUrlMatch = deps.getSongUrlMatch ?? defaultGetSongUrlMatch
  const matchSources =
    deps.matchSources ?? DEFAULT_BUILTIN_UNBLOCK_MATCH_SOURCES

  return {
    resolve: async options => {
      const configuredMatchSources =
        Array.isArray(
          (options.config as Partial<AppConfig>).enhancedSourceModules
        ) &&
        (options.config as Partial<AppConfig>).enhancedSourceModules!.length
          ? (options.config as Partial<AppConfig>).enhancedSourceModules!
          : matchSources

      for (const source of configuredMatchSources) {
        try {
          const response = await getSongUrlMatch({
            id: options.track.id,
            source,
          })
          const matched = normalizeSongUrlMatchResponse(response.data, {
            id: options.track.id,
            time: options.track.duration,
            br: 0,
          })

          if (matched?.url) {
            return matched
          }
        } catch {
          continue
        }
      }

      return null
    },
  }
}
