export interface DailySongRowItem {
  id: number
  name: string
  artistNames: string
  albumName: string
  coverUrl: string
  duration: number
}

export interface DailySongsPageState {
  songs: DailySongRowItem[]
}

interface RawDailySongArtist {
  name?: string
}

interface RawDailySongAlbum {
  name?: string
  picUrl?: string
}

interface RawDailySong {
  id?: number
  name?: string
  dt?: number
  al?: RawDailySongAlbum
  ar?: RawDailySongArtist[]
}

interface RawRecommendSongsResponse {
  dailySongs?: RawDailySong[]
  data?: {
    dailySongs?: RawDailySong[]
  }
}

export const EMPTY_DAILY_SONGS_STATE: DailySongsPageState = {
  songs: [],
}

function unwrapDailySongs(
  response: RawRecommendSongsResponse | null | undefined
): RawDailySong[] {
  if (!response) {
    return []
  }

  if (Array.isArray(response.dailySongs)) {
    return response.dailySongs
  }

  if (Array.isArray(response.data?.dailySongs)) {
    return response.data.dailySongs
  }

  return []
}

function formatArtistNames(artists: RawDailySongArtist[] | undefined) {
  const joined =
    (artists || [])
      .map(artist => artist.name || '')
      .filter(Boolean)
      .join(' / ') || ''

  return joined || '未知歌手'
}

export function normalizeDailySongs(
  response: RawRecommendSongsResponse | null | undefined
): DailySongRowItem[] {
  return unwrapDailySongs(response).flatMap(song => {
    if (!song?.id) {
      return []
    }

    return [
      {
        id: song.id,
        name: song.name || '未知歌曲',
        artistNames: formatArtistNames(song.ar),
        albumName: song.al?.name || '未知专辑',
        coverUrl: song.al?.picUrl || '',
        duration: song.dt || 0,
      },
    ]
  })
}

export function formatDailySongDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.floor(duration / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
