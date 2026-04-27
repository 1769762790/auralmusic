import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createLocalMediaUrl } from '../../shared/local-media.ts'
import type { ResolveAudioSourceResult } from './cache-types'

const AUDIO_DIR_NAME = 'audio'

type PlaybackTempCacheServiceOptions = {
  defaultRootDir: string
  fetcher?: typeof fetch
}

type ResolvePlaybackTempAudioSourceParams = {
  cacheKey: string
  sourceUrl: string
}

function buildTempCacheId(cacheKey: string, sourceUrl: string) {
  return createHash('sha256')
    .update(cacheKey)
    .update(':')
    .update(sourceUrl)
    .digest('hex')
}

function getUrlExtension(sourceUrl: string) {
  try {
    const extension = path.extname(new URL(sourceUrl).pathname)
    if (/^\.[a-zA-Z0-9]{1,8}$/.test(extension)) {
      return extension.toLowerCase()
    }
  } catch {
    // ignore invalid source urls and fall back to content type
  }

  return '.bin'
}

function getContentTypeExtension(contentType: string | null) {
  if (!contentType) {
    return '.bin'
  }

  if (contentType.includes('audio/mpeg')) {
    return '.mp3'
  }
  if (contentType.includes('audio/flac')) {
    return '.flac'
  }
  if (contentType.includes('audio/aac')) {
    return '.aac'
  }
  if (contentType.includes('audio/mp4')) {
    return '.m4a'
  }
  if (contentType.includes('audio/ogg')) {
    return '.ogg'
  }
  if (
    contentType.includes('audio/wav') ||
    contentType.includes('audio/x-wav')
  ) {
    return '.wav'
  }

  return '.bin'
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export class PlaybackTempCacheService {
  private readonly defaultRootDir: string
  private readonly fetcher: typeof fetch
  private clearInFlight: Promise<void> = Promise.resolve()

  constructor(options: PlaybackTempCacheServiceOptions) {
    this.defaultRootDir = options.defaultRootDir
    this.fetcher = options.fetcher ?? fetch
  }

  getDefaultTempRoot() {
    return this.defaultRootDir
  }

  async resolveAudioSource(
    params: ResolvePlaybackTempAudioSourceParams
  ): Promise<ResolveAudioSourceResult> {
    await this.clearInFlight

    const audioDir = path.join(this.defaultRootDir, AUDIO_DIR_NAME)
    const id = buildTempCacheId(params.cacheKey, params.sourceUrl)
    const knownExtensions = [
      '.mp3',
      '.flac',
      '.aac',
      '.m4a',
      '.ogg',
      '.wav',
      '.bin',
    ]

    await fs.mkdir(audioDir, { recursive: true })

    for (const extension of knownExtensions) {
      const cachedPath = path.join(audioDir, `${id}${extension}`)
      if (await fileExists(cachedPath)) {
        return { url: createLocalMediaUrl(cachedPath), fromCache: true }
      }
    }

    try {
      const response = await this.fetcher(params.sourceUrl)
      if (!response.ok) {
        return { url: params.sourceUrl, fromCache: false }
      }

      const bytes = Buffer.from(await response.arrayBuffer())
      const urlExt = getUrlExtension(params.sourceUrl)
      const contentExt = getContentTypeExtension(
        response.headers.get('content-type')
      )
      const extension = urlExt !== '.bin' ? urlExt : contentExt
      const absolutePath = path.join(audioDir, `${id}${extension}`)

      await fs.writeFile(absolutePath, bytes)

      return { url: createLocalMediaUrl(absolutePath), fromCache: true }
    } catch {
      return { url: params.sourceUrl, fromCache: false }
    }
  }

  async clear() {
    this.clearInFlight = this.clearAudioDir()
    await this.clearInFlight
  }

  private async clearAudioDir() {
    const audioDir = path.join(this.defaultRootDir, AUDIO_DIR_NAME)
    await fs.rm(audioDir, { recursive: true, force: true })
    await fs.mkdir(audioDir, { recursive: true })
  }
}
