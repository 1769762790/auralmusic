import type {
  MvDetailHeroData,
  MvDetailPageState,
  MvPlaybackData,
  RawMvArtist,
  RawMvDetail,
  RawMvDetailResponse,
  RawMvPlaybackItem,
  RawMvPlaybackResponse,
  RawSimilarMv,
  RawSimilarMvResponse,
  SimilarMvItem,
} from './types'

export const EMPTY_MV_DETAIL_STATE: MvDetailPageState = {
  hero: null,
  playback: null,
  similarMvs: [],
}

function unwrapPayload<T>(
  response: { data?: T | { data?: T } } | null | undefined
) {
  if (!response?.data) {
    return null
  }

  if (
    typeof response.data === 'object' &&
    response.data !== null &&
    'data' in response.data
  ) {
    return response.data.data ?? null
  }

  return response.data
}

function formatArtistName(
  artistName?: string,
  artists?: RawMvArtist[]
): string {
  if (artistName?.trim()) {
    return artistName.trim()
  }

  const joined = (artists || [])
    .map(item => item.name || '')
    .filter(Boolean)
    .join(' / ')

  return joined || '未知歌手'
}

function normalizeCoverUrl(payload: RawMvDetail | RawSimilarMv) {
  return (
    payload.cover ||
    payload.coverUrl ||
    payload.imgurl16v9 ||
    payload.imgurl ||
    ''
  )
}

export function normalizeMvDetailHero(
  response: RawMvDetailResponse | null | undefined
): MvDetailHeroData | null {
  const detail = unwrapPayload(response) as RawMvDetail | null

  if (!detail?.id) {
    return null
  }

  return {
    id: detail.id,
    name: detail.name || '未知 MV',
    artistName: formatArtistName(detail.artistName, detail.artists),
    coverUrl: normalizeCoverUrl(detail),
    playCount: detail.playCount || 0,
    publishTime: detail.publishTime,
    duration: detail.duration || 0,
    description: detail.desc || '',
    resolutions: detail.brs || [],
  }
}

export function normalizeMvPlayback(
  response: RawMvPlaybackResponse | null | undefined
): MvPlaybackData | null {
  const payload = unwrapPayload(response) as
    | RawMvPlaybackItem[]
    | RawMvPlaybackItem
    | null

  if (Array.isArray(payload)) {
    const first = payload[0]
    if (!first?.url) {
      return null
    }

    return {
      url: first.url,
      size: first.size,
      quality: first.br,
    }
  }

  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'url' in payload &&
    payload.url
  ) {
    const item = payload as RawMvPlaybackItem

    return {
      url: item.url || '',
      size: item.size,
      quality: item.br,
    }
  }

  return null
}

export function normalizeSimilarMvs(
  response: RawSimilarMvResponse
): SimilarMvItem[] {
  const payload = response

  console.log('normalizeSimilarMvs', response)

  return (payload?.mvs || []).map((item: RawSimilarMv) => ({
    id: item.id || 0,
    name: item.name || '未知 MV',
    artistName: formatArtistName(item.artistName, item.artists),
    coverUrl: normalizeCoverUrl(item),
    duration: item.duration || 0,
    playCount: item.playCount || 0,
    publishTime: item.publishTime,
  }))
}

export function formatMvPublishDate(timestamp?: number) {
  if (!timestamp) return '暂无日期'

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '暂无日期'

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

export function formatMvDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.floor(duration / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
