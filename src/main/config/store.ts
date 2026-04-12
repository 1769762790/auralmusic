import Store from 'electron-store'
import {
  AppConfig,
  AUDIO_QUALITY_LEVELS,
  MUSIC_SOURCE_PROVIDERS,
  defaultConfig,
  type AudioQualityLevel,
  type MusicSourceProvider,
} from './types'
import {
  normalizeImportedLxMusicSource,
  normalizeImportedLxMusicSources,
  resolveActiveLxMusicSourceScriptId,
} from '../../shared/lx-music-source'
import { normalizeShortcutBindings } from '../../shared/shortcut-keys'
import { normalizePlaybackVolume } from '../../shared/playback'

function normalizeQuality(value: unknown): AudioQualityLevel {
  if (value === 'high') {
    return 'higher'
  }

  if (
    typeof value === 'string' &&
    AUDIO_QUALITY_LEVELS.includes(value as AudioQualityLevel)
  ) {
    return value as AudioQualityLevel
  }

  return defaultConfig.quality
}

function normalizeMusicSourceProviders(value: unknown): MusicSourceProvider[] {
  if (!Array.isArray(value)) {
    return defaultConfig.musicSourceProviders
  }

  const providers = value.filter((item): item is MusicSourceProvider => {
    return (
      typeof item === 'string' &&
      MUSIC_SOURCE_PROVIDERS.includes(item as MusicSourceProvider)
    )
  })

  return providers.length ? providers : defaultConfig.musicSourceProviders
}

function areProvidersEqual(
  left: unknown,
  right: MusicSourceProvider[]
): left is MusicSourceProvider[] {
  return (
    Array.isArray(left) &&
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  )
}

function normalizeProvidersForLxState(
  providers: MusicSourceProvider[],
  activeLxScriptId: string | null
) {
  if (activeLxScriptId) {
    return providers
  }

  const normalizedProviders = providers.filter(
    provider => provider !== 'lxMusic'
  )

  return normalizedProviders.length
    ? normalizedProviders
    : defaultConfig.musicSourceProviders
}

// 单例模式：保证整个应用只有一个配置存储实例
class ConfigStore {
  private static instance: Store<AppConfig>

  // 私有化构造，禁止外部实例化
  private constructor() {}

  // 获取全局唯一实例
  public static getInstance(): Store<AppConfig> {
    if (!ConfigStore.instance) {
      ConfigStore.instance = new Store<AppConfig>({
        name: 'aural-music-config', // 存储文件名：aural-music-config.json
        defaults: defaultConfig,
        // 可选：添加 schema 校验，防止非法配置写入
        schema: {
          theme: { type: 'string', enum: ['light', 'dark', 'system'] },
          fontFamily: { type: 'string' },
          audioOutputDeviceId: { type: 'string' },
          playbackVolume: { type: 'number', minimum: 0, maximum: 100 },
          musicSourceEnabled: { type: 'boolean' },
          musicSourceProviders: {
            type: 'array',
            items: { type: 'string', enum: MUSIC_SOURCE_PROVIDERS },
          },
          luoxueSourceEnabled: { type: 'boolean' },
          luoxueSourceUrl: { type: 'string' },
          luoxueMusicSourceScript: {
            anyOf: [
              { type: 'null' },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  fileName: { type: 'string' },
                  description: { type: 'string' },
                  version: { type: 'string' },
                  author: { type: 'string' },
                  homepage: { type: 'string' },
                  createdAt: { type: 'number' },
                  updatedAt: { type: 'number' },
                },
                required: ['id', 'name', 'fileName', 'createdAt', 'updatedAt'],
              },
            ],
          },
          luoxueMusicSourceScripts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                fileName: { type: 'string' },
                sources: {
                  type: 'array',
                  items: { type: 'string' },
                },
                description: { type: 'string' },
                version: { type: 'string' },
                author: { type: 'string' },
                homepage: { type: 'string' },
                createdAt: { type: 'number' },
                updatedAt: { type: 'number' },
              },
              required: ['id', 'name', 'fileName', 'createdAt', 'updatedAt'],
            },
          },
          activeLuoxueMusicSourceScriptId: {
            anyOf: [{ type: 'string' }, { type: 'null' }],
          },
          customMusicApiEnabled: { type: 'boolean' },
          customMusicApiUrl: { type: 'string' },
          quality: { type: 'string', enum: AUDIO_QUALITY_LEVELS },
          globalShortcutEnabled: { type: 'boolean' },
          shortcutBindings: { type: 'object' },
        },
      })

      const quality = ConfigStore.instance.get('quality')
      const normalizedQuality = normalizeQuality(quality)
      if (quality !== normalizedQuality) {
        ConfigStore.instance.set('quality', normalizedQuality)
      }

      const playbackVolume = ConfigStore.instance.get('playbackVolume')
      const normalizedPlaybackVolume = normalizePlaybackVolume(playbackVolume)
      if (playbackVolume !== normalizedPlaybackVolume) {
        ConfigStore.instance.set('playbackVolume', normalizedPlaybackVolume)
      }

      const globalShortcutEnabled = ConfigStore.instance.get(
        'globalShortcutEnabled'
      )
      if (typeof globalShortcutEnabled !== 'boolean') {
        ConfigStore.instance.set(
          'globalShortcutEnabled',
          defaultConfig.globalShortcutEnabled
        )
      }

      const shortcutBindings = ConfigStore.instance.get('shortcutBindings')
      const normalizedShortcutBindings =
        normalizeShortcutBindings(shortcutBindings)
      if (
        JSON.stringify(shortcutBindings) !==
        JSON.stringify(normalizedShortcutBindings)
      ) {
        ConfigStore.instance.set('shortcutBindings', normalizedShortcutBindings)
      }

      const providers = ConfigStore.instance.get('musicSourceProviders')
      const normalizedProviders = normalizeMusicSourceProviders(providers)
      if (!areProvidersEqual(providers, normalizedProviders)) {
        ConfigStore.instance.set('musicSourceProviders', normalizedProviders)
      }

      const lxScript = ConfigStore.instance.get('luoxueMusicSourceScript')
      const normalizedLxScript = normalizeImportedLxMusicSource(lxScript)
      if (lxScript !== normalizedLxScript) {
        ConfigStore.instance.set('luoxueMusicSourceScript', normalizedLxScript)
      }

      const lxScripts = ConfigStore.instance.get('luoxueMusicSourceScripts')
      const normalizedLxScripts = normalizeImportedLxMusicSources(
        lxScripts,
        normalizedLxScript
      )
      ConfigStore.instance.set('luoxueMusicSourceScripts', normalizedLxScripts)

      const activeLxScriptId = ConfigStore.instance.get(
        'activeLuoxueMusicSourceScriptId'
      )
      const normalizedActiveLxScriptId = resolveActiveLxMusicSourceScriptId(
        activeLxScriptId,
        normalizedLxScripts
      )
      if (activeLxScriptId !== normalizedActiveLxScriptId) {
        ConfigStore.instance.set(
          'activeLuoxueMusicSourceScriptId',
          normalizedActiveLxScriptId
        )
      }

      const normalizedLxAwareProviders = normalizeProvidersForLxState(
        normalizedProviders,
        normalizedActiveLxScriptId
      )
      if (!areProvidersEqual(providers, normalizedLxAwareProviders)) {
        ConfigStore.instance.set(
          'musicSourceProviders',
          normalizedLxAwareProviders
        )
      }
    }
    return ConfigStore.instance
  }
}

// 导出配置实例
export const configStore = ConfigStore.getInstance()

// 导出快捷读写方法
export const getConfig = <K extends keyof AppConfig>(key: K): AppConfig[K] => {
  return configStore.get(key)
}

export const setConfig = <K extends keyof AppConfig>(
  key: K,
  value: AppConfig[K]
): void => {
  configStore.set(key, value)
}

export const resetConfig = (): void => {
  configStore.reset()
}
