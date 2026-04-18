import type { PlaybackSourceProvider } from '@/types/core'

export function createCustomApiPlaybackProvider(): PlaybackSourceProvider {
  return {
    resolve: async () => {
      return null
    },
  }
}
