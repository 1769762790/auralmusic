export interface ArtistSummary {
  id: number
  name: string
  picUrl: string
}

export interface DailySong {
  id?: number
  al?: {
    picUrl?: string
  }
}

export interface HomeFmData {
  album?: {
    picUrl?: string
    name?: string
    artist?: {
      name?: string
    }
  }
}

export interface NewSongArtist {
  name?: string
}

export interface NewSong {
  id: number
  name?: string
  picUrl?: string
  artist?: NewSongArtist
  song?: {
    artists?: NewSongArtist[]
  }
}

export interface AlbumSummary {
  id: number
  name: string
  picUrl: string
  artist: {
    name: string
  }
}
