import type { LibraryMvItem } from './types'
import type {
  LibraryMvPage,
  NormalizeLibraryMvPageOptions,
  RawLibraryMvItem,
  RawMvArtist,
  RawSubscribedMvsBody,
} from './types'

function unwrapSubscribedMvsBody(
  response?: RawSubscribedMvsBody | RawLibraryMvItem[] | null
): {
  mvs: RawLibraryMvItem[]
  more?: boolean
  hasMore?: boolean
  count?: number
} {
  if (!response) {
    return { mvs: [] }
  }

  if (Array.isArray(response)) {
    return { mvs: response }
  }

  const nested =
    response.data && typeof response.data === 'object'
      ? unwrapSubscribedMvsBody(response.data)
      : { mvs: [] as RawLibraryMvItem[] }

  return {
    mvs: Array.isArray(response.mvs) ? response.mvs : nested.mvs,
    more: typeof response.more === 'boolean' ? response.more : nested.more,
    hasMore:
      typeof response.hasMore === 'boolean' ? response.hasMore : nested.hasMore,
    count: typeof response.count === 'number' ? response.count : nested.count,
  }
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

function normalizeMvList(mvs?: RawLibraryMvItem[]): LibraryMvItem[] {
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
  const list = normalizeMvList(body.mvs)

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
