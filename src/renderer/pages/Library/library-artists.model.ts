import type { ArtistListItem } from '../Artists/artists.model.ts'

interface RawArtistItem {
  id?: number
  name?: string
  picUrl?: string
  img1v1Url?: string
  alias?: string[]
  albumSize?: number
  musicSize?: number
}

interface RawSubscribedArtistsBody {
  artists?: RawArtistItem[]
  more?: boolean
  hasMore?: boolean
  count?: number
  data?: RawSubscribedArtistsBody
}

interface NormalizeLibraryArtistPageOptions {
  limit: number
  offset: number
}

export interface LibraryArtistPage {
  list: ArtistListItem[]
  hasMore: boolean
}

function unwrapSubscribedArtistsBody(
  response?: RawSubscribedArtistsBody | null
): RawSubscribedArtistsBody {
  if (!response) {
    return {}
  }

  if (
    Array.isArray(response.artists) ||
    typeof response.more === 'boolean' ||
    typeof response.hasMore === 'boolean' ||
    typeof response.count === 'number'
  ) {
    return response
  }

  if (response.data && typeof response.data === 'object') {
    return unwrapSubscribedArtistsBody(response.data)
  }

  return response
}

function normalizeArtistList(artists?: RawArtistItem[]): ArtistListItem[] {
  if (!Array.isArray(artists)) {
    return []
  }

  return artists.flatMap(artist => {
    if (!artist?.id) {
      return []
    }

    return [
      {
        id: artist.id,
        name: artist.name || '未知歌手',
        picUrl: artist.picUrl || artist.img1v1Url || '',
        alias: artist.alias,
        albumSize: artist.albumSize,
        musicSize: artist.musicSize,
      },
    ]
  })
}

export function normalizeLibraryArtistPage(
  response?: RawSubscribedArtistsBody | null,
  { limit, offset }: NormalizeLibraryArtistPageOptions = {
    limit: 25,
    offset: 0,
  }
): LibraryArtistPage {
  const body = unwrapSubscribedArtistsBody(response)
  const list = normalizeArtistList(body.data)

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
