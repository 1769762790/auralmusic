import type { AlbumArtist, AlbumListItem } from '../Albums/albums.model.ts'

interface RawAlbumArtist {
  name?: string
}

interface RawAlbumItem {
  id?: number
  name?: string
  picUrl?: string
  blurPicUrl?: string
  artists?: RawAlbumArtist[]
  artist?: RawAlbumArtist
}

interface RawSubscribedAlbumsBody {
  data?: RawSubscribedAlbumsBody | RawAlbumItem[]
  albums?: RawAlbumItem[]
  more?: boolean
  hasMore?: boolean
  count?: number
}

interface NormalizeLibraryAlbumPageOptions {
  limit: number
  offset: number
}

export interface LibraryAlbumPage {
  list: AlbumListItem[]
  hasMore: boolean
}

function unwrapSubscribedAlbumsBody(
  response?: RawSubscribedAlbumsBody | RawAlbumItem[] | null
): RawSubscribedAlbumsBody | RawAlbumItem[] {
  if (!response) {
    return {}
  }

  if (Array.isArray(response)) {
    return response
  }

  if (
    Array.isArray(response.albums) ||
    Array.isArray(response.data) ||
    typeof response.more === 'boolean' ||
    typeof response.hasMore === 'boolean' ||
    typeof response.count === 'number'
  ) {
    return response
  }

  if (response.data && typeof response.data === 'object') {
    return unwrapSubscribedAlbumsBody(response.data)
  }

  return response
}

function normalizeArtists(
  artists?: RawAlbumArtist[]
): AlbumArtist[] | undefined {
  if (!Array.isArray(artists)) {
    return undefined
  }

  const normalized = artists.map(artist => ({
    name: artist.name || '未知歌手',
  }))

  return normalized.length ? normalized : undefined
}

function normalizeAlbumList(albums?: RawAlbumItem[]): AlbumListItem[] {
  if (!Array.isArray(albums)) {
    return []
  }

  return albums.flatMap(album => {
    if (!album?.id) {
      return []
    }

    const artists = normalizeArtists(album.artists)
    const artist = album.artist?.name
      ? { name: album.artist.name || '未知歌手' }
      : artists?.[0]

    return [
      {
        id: album.id,
        name: album.name || '未知专辑',
        picUrl: album.picUrl || album.blurPicUrl || '',
        blurPicUrl: album.blurPicUrl || album.picUrl || '',
        artists,
        artist,
      },
    ]
  })
}

export function normalizeLibraryAlbumPage(
  response?: RawSubscribedAlbumsBody | null,
  { limit, offset }: NormalizeLibraryAlbumPageOptions = { limit: 25, offset: 0 }
): LibraryAlbumPage {
  const body = unwrapSubscribedAlbumsBody(response)

  if (Array.isArray(body)) {
    return {
      list: normalizeAlbumList(body),
      hasMore: body.length >= limit,
    }
  }

  const list = normalizeAlbumList(
    body.albums ?? (Array.isArray(body.data) ? body.data : undefined)
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
