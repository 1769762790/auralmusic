import type { SongDownloadPayload } from '../../../main/download/download-types'

export const TRACK_DOWNLOAD_TOASTS = {
  disabled: '下载功能未开启，请先在设置中打开',
  unavailable: '下载能力暂不可用，请稍后重试',
  enqueued: '已加入下载队列',
  enqueueFailed: '加入下载队列失败，请稍后重试',
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

export async function handleTrackDownload(options: {
  item: TrackListDownloadSong
  coverUrl?: string
  requestedQuality?: SongDownloadPayload['requestedQuality']
  downloadEnabled: boolean
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

  await options.enqueueSongDownload({
    ...context,
    requestedQuality: options.requestedQuality || context.requestedQuality,
  })

  return true
}
