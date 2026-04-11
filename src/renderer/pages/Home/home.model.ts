import type { PlaybackTrack } from '../../../shared/playback.ts'

type RawArtist = {
  name?: string
}

type RawAlbum = {
  name?: string
  picUrl?: string
  artist?: RawArtist
}

export type HomeFmSong = {
  id?: number
  name?: string
  duration?: number
  dt?: number
  artists?: RawArtist[]
  ar?: RawArtist[]
  album?: RawAlbum
  al?: RawAlbum
}

function resolveArtistNames(song: HomeFmSong) {
  const artists = song.artists || song.ar || []
  const names = artists
    .map(artist => artist.name?.trim())
    .filter((name): name is string => Boolean(name))

  if (names.length) {
    return names.join(' / ')
  }

  return song.album?.artist?.name || song.al?.artist?.name || '未知歌手'
}

export function normalizeHomeFmTrack(song: HomeFmSong): PlaybackTrack | null {
  const id = song.id || 0
  const name = song.name?.trim() || ''

  if (!id || !name) {
    return null
  }

  const album = song.album || song.al

  return {
    id,
    name,
    artistNames: resolveArtistNames(song),
    albumName: album?.name || '私人 FM',
    coverUrl: album?.picUrl || '',
    duration: song.duration || song.dt || 0,
  }
}
