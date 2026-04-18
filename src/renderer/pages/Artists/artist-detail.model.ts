import type {
  ArtistDescPayload,
  ArtistDetailProfile,
  ArtistSimilarItem,
  RawSimilarArtistsBody,
} from './types'

function unwrapSimilarArtistsBody(
  response?: RawSimilarArtistsBody | null
): RawSimilarArtistsBody {
  if (!response) {
    return {}
  }

  if (
    Array.isArray(response.artists) ||
    !response.data ||
    typeof response.data !== 'object'
  ) {
    return response
  }

  return unwrapSimilarArtistsBody(response.data)
}

export function normalizeSimilarArtists(
  response?: RawSimilarArtistsBody | null
): ArtistSimilarItem[] {
  const payload = unwrapSimilarArtistsBody(response)

  return (payload?.artists || [])
    .map(artist => ({
      id: artist.id || 0,
      name: artist.name || '未知歌手',
      picUrl: artist.picUrl || artist.img1v1Url || '',
    }))
    .filter(artist => artist.id > 0)
}

export function formatArtistDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.floor(duration / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatArtistPublishDate(timestamp?: number | string) {
  if (!timestamp) return '暂无日期'

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '暂无日期'

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
}

export const EMPTY_ARTIST_DESCRIPTION: ArtistDescPayload = {
  summary: '',
  sections: [],
}

export function toArtistListItem(profile: ArtistDetailProfile) {
  return {
    id: profile.id,
    name: profile.name,
    picUrl: profile.coverUrl,
    albumSize: profile.albumSize,
    musicSize: profile.musicSize,
  }
}
