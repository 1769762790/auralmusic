import type { LibraryMvItem } from './library.model'

interface RawMvArtist {
  name?: string
}

interface RawMvItem {
  id?: number
  name?: string
  cover?: string
  coverUrl?: string
  imgurl16v9?: string
  artistName?: string
  artists?: RawMvArtist[]
  playCount?: number
  publishTime?: number
}

interface RawSubscribedMvsBody {
  data?: RawSubscribedMvsBody | RawMvItem[]
  mvs?: RawMvItem[]
  more?: boolean
  hasMore?: boolean
  count?: number
}

interface NormalizeLibraryMvPageOptions {
  limit: number
  offset: number
}

export interface LibraryMvPage {
  list: LibraryMvItem[]
  hasMore: boolean
}

function unwrapSubscribedMvsBody(
  response?: RawSubscribedMvsBody | RawMvItem[] | null
): RawSubscribedMvsBody | RawMvItem[] {
  if (!response) {
    return {}
  }

  if (Array.isArray(response)) {
    return response
  }

  if (
    Array.isArray(response.mvs) ||
    Array.isArray(response.data) ||
    typeof response.more === 'boolean' ||
    typeof response.hasMore === 'boolean' ||
    typeof response.count === 'number'
  ) {
    return response
  }

  if (response.data && typeof response.data === 'object') {
    return unwrapSubscribedMvsBody(response.data)
  }

  return response
}

function formatMVArtistNames(artistName?: string, artists?: RawMvArtist[]) {
  if (artistName?.trim()) {
    return artistName.trim()
  }

  const joined =
    artists
      ?.map(artist => artist.name?.trim() || '')
      .filter(Boolean)
      .join(' / ') || ''

  return joined || '未知歌手'
}

function normalizeMvList(mvs?: RawMvItem[]): LibraryMvItem[] {
  if (!Array.isArray(mvs)) {
    return []
  }

  return mvs.flatMap(mv => {
    if (!mv?.id) {
      return []
    }

    return [
      {
        id: mv.id,
        name: mv.name || '未知 MV',
        coverUrl: mv.coverUrl || mv.cover || mv.imgurl16v9 || '',
        artistName: formatMVArtistNames(mv.artistName, mv.artists),
        playCount: mv.playCount || 0,
        publishTime: mv.publishTime,
      },
    ]
  })
}

export function normalizeLibraryMvPage(
  response?: RawSubscribedMvsBody | null,
  { limit, offset }: NormalizeLibraryMvPageOptions = { limit: 25, offset: 0 }
): LibraryMvPage {
  const body = unwrapSubscribedMvsBody(response)
  if (Array.isArray(body.data)) {
    return {
      list: body.data,
      hasMore: body.data.length >= limit,
    }
  }

  const list = normalizeMvList(
    body.mvs ?? (Array.isArray(data) ? data : undefined)
  )

  if (typeof body.more === 'boolean') {
    return {
      list,
      hasMore: body.more,
    }
  }

  if (typeof body.hasMore === 'boolean') {
    return {
      list,
      hasMore: body.hasMore,
    }
  }

  if (typeof body.count === 'number') {
    return {
      list,
      hasMore: offset + list.length < body.count,
    }
  }

  return {
    list,
    hasMore: list.length >= limit,
  }
}
