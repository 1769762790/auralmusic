import type { SongDownloadPayload } from '../../../main/download/download-types'
import type { ResolvedDownloadSource } from '../../services/download/download-source-resolver'

export const TRACK_DOWNLOAD_TOASTS = {
  disabled: '下载功能未开启，请先在设置中打开',
  unavailable: '下载能力暂不可用，请稍后重试',
  enqueued: '已加入下载队列',
  enqueueFailed: '加入下载队列失败，请稍后重试',
  sourceResolutionFailed: '无法解析下载源，歌曲未加入队列，请稍后重试',
} as const

export interface TrackListDownloadSong {
  artists?: Array<{ name: string }> | null
  id: number
  coverUrl?: string
  name: string
  artistNames?: string
  duration: number
  albumName?: string
}

function formatArtistNames(artists?: Array<{ name: string }> | null) {
  if (!artists?.length) {
    return ''
  }

  return artists.map(artist => artist.name).join(' / ')
}

export function buildTrackDownloadContext(
  item: TrackListDownloadSong,
  fallbackCoverUrl?: string
): SongDownloadPayload | null {
  if (!item.id || !item.name) {
    return null
  }

  return {
    songId: item.id,
    songName: item.name,
    artistName:
      item.artistNames || formatArtistNames(item.artists) || '未知歌手',
    coverUrl: item.coverUrl || fallbackCoverUrl || '',
    albumName: item.albumName,
    requestedQuality: 'higher',
  }
}

type ResolveDownloadSource = (
  payload: SongDownloadPayload
) => Promise<ResolvedDownloadSource | null>

export async function handleTrackDownload(options: {
  item: TrackListDownloadSong
  coverUrl?: string
  requestedQuality?: SongDownloadPayload['requestedQuality']
  downloadEnabled: boolean
  resolveDownloadSource?: ResolveDownloadSource
  enqueueSongDownload: (payload: SongDownloadPayload) => Promise<unknown>
  toastError: (message: string) => void
}) {
  if (!options.downloadEnabled) {
    options.toastError(TRACK_DOWNLOAD_TOASTS.disabled)
    return false
  }

  const context = buildTrackDownloadContext(options.item, options.coverUrl)
  if (!context) {
    return false
  }

  const requestedQuality = options.requestedQuality || context.requestedQuality
  const resolvedSource = options.resolveDownloadSource
    ? await options.resolveDownloadSource({
        ...context,
        requestedQuality,
      })
    : null

  if (options.resolveDownloadSource && !resolvedSource?.url) {
    options.toastError(TRACK_DOWNLOAD_TOASTS.sourceResolutionFailed)
    return false
  }

  const enqueuePayload: SongDownloadPayload = {
    ...context,
    requestedQuality,
  }

  if (resolvedSource?.url) {
    enqueuePayload.sourceUrl = resolvedSource.url
    enqueuePayload.resolvedQuality = resolvedSource.quality
    enqueuePayload.sourceProvider = resolvedSource.provider
    enqueuePayload.fileExtension = resolvedSource.fileExtension
  } else if (context.sourceUrl) {
    enqueuePayload.sourceUrl = context.sourceUrl
  }

  await options.enqueueSongDownload(enqueuePayload)

  return true
}
