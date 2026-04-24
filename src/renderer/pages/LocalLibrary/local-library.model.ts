import type {
  LocalLibraryAlbumRecord,
  LocalLibraryArtistRecord,
  LocalLibraryEntityType,
  LocalLibrarySnapshot,
  LocalLibraryTrackRecord,
} from '../../../shared/local-library.ts'

export interface LocalLibrarySongScope {
  type: 'all' | 'album' | 'artist'
  key: number | null
  value: string | null
  artistName?: string | null
}

export const EMPTY_LOCAL_LIBRARY_SNAPSHOT: LocalLibrarySnapshot = {
  roots: [],
  stats: {
    rootCount: 0,
    trackCount: 0,
    albumCount: 0,
    artistCount: 0,
    lastScannedAt: null,
  },
  tracks: [],
  albums: [],
  artists: [],
}

function includesKeyword(value: string, keyword: string) {
  return value.toLowerCase().includes(keyword.toLowerCase())
}

export function filterLocalLibraryTracks(
  tracks: LocalLibraryTrackRecord[],
  keyword: string,
  scope: LocalLibrarySongScope
) {
  return tracks.filter(track => {
    const matchesScope =
      scope.type === 'all' ||
      (scope.type === 'album' &&
        track.albumName === scope.value &&
        (!scope.artistName || track.artistName === scope.artistName)) ||
      (scope.type === 'artist' && track.artistName === scope.value)

    if (!matchesScope) {
      return false
    }

    if (!keyword.trim()) {
      return true
    }

    return [track.title, track.artistName, track.albumName].some(value =>
      includesKeyword(value, keyword)
    )
  })
}

export function filterLocalLibraryAlbums(
  albums: LocalLibraryAlbumRecord[],
  keyword: string
) {
  if (!keyword.trim()) {
    return albums
  }

  return albums.filter(album => {
    return [album.name, album.artistName].some(value =>
      includesKeyword(value, keyword)
    )
  })
}

export function filterLocalLibraryArtists(
  artists: LocalLibraryArtistRecord[],
  keyword: string
) {
  if (!keyword.trim()) {
    return artists
  }

  return artists.filter(artist => includesKeyword(artist.name, keyword))
}

export function getLocalLibraryEmptyState(
  snapshot: LocalLibrarySnapshot,
  configuredRootCount: number
): 'missing-roots' | 'not-scanned' | 'empty-library' | null {
  if (configuredRootCount === 0) {
    return 'missing-roots'
  }

  if (snapshot.stats.lastScannedAt === null) {
    return 'not-scanned'
  }

  if (snapshot.stats.trackCount === 0) {
    return 'empty-library'
  }

  return null
}

export function getLocalLibrarySearchPlaceholder(
  entityType: LocalLibraryEntityType
) {
  if (entityType === 'albums') {
    return '搜索专辑或歌手'
  }

  if (entityType === 'artists') {
    return '搜索歌手'
  }

  return '搜索歌曲、歌手或专辑'
}
