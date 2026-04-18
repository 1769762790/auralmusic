import { normalizeBuiltinPlatforms } from './builtin-platforms.ts'
import type {
  MusicResolverId,
  ResolveContext,
  ResolverPolicy,
} from './types.ts'

function compactResolvers(
  resolvers: Array<MusicResolverId | null | undefined>
): MusicResolverId[] {
  const result: MusicResolverId[] = []
  const seen = new Set<MusicResolverId>()

  for (const resolver of resolvers) {
    if (!resolver || seen.has(resolver)) {
      continue
    }

    seen.add(resolver)
    result.push(resolver)
  }

  return result
}

export function buildResolverPolicy(context: ResolveContext): ResolverPolicy {
  const builtinPlatforms = normalizeBuiltinPlatforms(
    context.config.musicSourceProviders
  )
  const enhancedSourceModules = context.config.enhancedSourceModules
  const hasExplicitEnhancedModules = Array.isArray(enhancedSourceModules)
  const hasEnabledEnhancedModules =
    !hasExplicitEnhancedModules || enhancedSourceModules.length > 0
  const builtinUnblockEnabled =
    hasEnabledEnhancedModules || builtinPlatforms.length > 0
  const customApiEnabled =
    context.config.customMusicApiEnabled &&
    context.config.customMusicApiUrl.trim().length > 0
  const resolverOrder: MusicResolverId[] = context.config.musicSourceEnabled
    ? compactResolvers(
        context.isAuthenticated
          ? [
              'official',
              builtinUnblockEnabled ? 'builtinUnblock' : null,
              context.config.luoxueSourceEnabled ? 'lxMusic' : null,
              customApiEnabled ? 'customApi' : null,
            ]
          : [
              builtinUnblockEnabled ? 'builtinUnblock' : null,
              context.config.luoxueSourceEnabled ? 'lxMusic' : null,
              customApiEnabled ? 'customApi' : null,
            ]
      )
    : ['official']

  return {
    resolverOrder,
    builtinPlatforms,
  }
}
