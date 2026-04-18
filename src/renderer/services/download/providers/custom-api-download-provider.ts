import type { DownloadResolverProvider } from '@/types/core'

export function createCustomApiDownloadProvider(): DownloadResolverProvider {
  return {
    resolve: async () => {
      return null
    },
  }
}
