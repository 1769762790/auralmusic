import type { AppConfig } from '../../../../shared/config.ts'
import type {
  MusicSourceSettingsDraft,
  MusicSourceSettingsDraftInput,
} from '../types'

export function createMusicSourceSettingsDraft(
  config: MusicSourceSettingsDraftInput
): MusicSourceSettingsDraft {
  return {
    hasLegacyProviders: Array.isArray(config.musicSourceProviders)
      ? config.musicSourceProviders.length > 0
      : false,
    enhancedSourceModules: Array.isArray(config.enhancedSourceModules)
      ? config.enhancedSourceModules
      : [],
    luoxueSourceEnabled: Boolean(config.luoxueSourceEnabled),
    customMusicApiEnabled: Boolean(config.customMusicApiEnabled),
    customMusicApiUrl:
      typeof config.customMusicApiUrl === 'string'
        ? config.customMusicApiUrl
        : '',
  }
}

export function createMusicSourceSettingsSaveEntries(
  draft: Pick<
    MusicSourceSettingsDraft,
    | 'enhancedSourceModules'
    | 'luoxueSourceEnabled'
    | 'customMusicApiEnabled'
    | 'customMusicApiUrl'
  >
): Array<[keyof AppConfig, AppConfig[keyof AppConfig]]> {
  return [
    ['musicSourceProviders', []],
    ['enhancedSourceModules', draft.enhancedSourceModules],
    ['luoxueSourceEnabled', draft.luoxueSourceEnabled],
    ['customMusicApiEnabled', draft.customMusicApiEnabled],
    ['customMusicApiUrl', draft.customMusicApiUrl.trim()],
  ]
}
