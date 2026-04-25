import type { AppConfig } from '../config.ts'

export type ResolveScene = 'playback' | 'download'

export type MusicResolverId =
  | 'official'
  | 'builtinUnblock'
  | 'lxMusic'
  | 'customApi'

export type BuiltinPlatformId = 'migu' | 'kugou' | 'pyncmd' | 'bilibili'

export type ResolveContext = {
  scene: ResolveScene
  isAuthenticated: boolean
  isVip: boolean
  trackFee: number
  config: Pick<
    AppConfig,
    | 'musicSourceEnabled'
    | 'musicSourceProviders'
    | 'luoxueSourceEnabled'
    | 'customMusicApiEnabled'
    | 'customMusicApiUrl'
  > & {
    enhancedSourceModules?: AppConfig['enhancedSourceModules']
    quality?: AppConfig['quality']
  }
}

export type ResolverPolicy = {
  resolverOrder: MusicResolverId[]
  builtinPlatforms: BuiltinPlatformId[]
}
