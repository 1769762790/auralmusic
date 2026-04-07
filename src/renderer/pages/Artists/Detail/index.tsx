import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getArtistAlbums,
  getArtistDesc,
  getArtistDetail,
  getArtistMvs,
  getArtistTopSongs,
  // getSimilarArtists,
} from '@/api/artist'
import ArtistDescription from './components/ArtistDescription'
import ArtistDetailSkeleton from './components/ArtistDetailSkeleton'
import ArtistHero from './components/ArtistHero'
import ArtistLatestRelease from './components/ArtistLatestRelease'
import ArtistMediaTabs from './components/ArtistMediaTabs'
import ArtistTopSongs from './components/ArtistTopSongs'
// import SimilarArtists from './components/SimilarArtists'
import {
  EMPTY_ARTIST_DESCRIPTION,
  type ArtistDescPayload,
  type ArtistDetailPageState,
  type ArtistDetailProfile,
  type ArtistTopSongItem,
} from '../artist-detail.model'

const INITIAL_STATE: ArtistDetailPageState = {
  profile: null,
  topSongs: [],
  albums: [],
  mvs: [],
  similarArtists: [],
  description: EMPTY_ARTIST_DESCRIPTION,
}

const PAGE_SIZE = 12

interface RawArtistProfile {
  id?: number
  name?: string
  cover?: string
  avatar?: string
  picUrl?: string
  img1v1Url?: string
  musicSize?: number
  albumSize?: number
  mvSize?: number
  identifyTag?: string[]
}

interface RawIdentify {
  imageDesc?: string
  identityName?: string
}

interface RawArtistDetailPayload {
  artist?: RawArtistProfile
  identify?: RawIdentify
}

interface RawArtistResponse<T> {
  data?: T | { data?: T }
}

interface RawSongArtist {
  id?: number
  name?: string
}

interface RawSongAlbum {
  name?: string
  picUrl?: string
}

interface RawTopSong {
  id: number
  name?: string
  alia?: string[]
  tns?: string[]
  dt?: number
  al?: RawSongAlbum
  album?: RawSongAlbum
  ar?: RawSongArtist[]
}

interface RawArtistAlbum {
  id: number
  name?: string
  picUrl?: string
  blurPicUrl?: string
  publishTime?: number
  size?: number
}

interface RawArtistMv {
  id?: number
  vid?: number
  name?: string
  imgurl16v9?: string
  cover?: string
  publishTime?: string
  playCount?: number
}

interface RawDescSection {
  ti?: string
  txt?: string
}

interface RawArtistDescResponse {
  briefDesc?: string
  introduction?: RawDescSection[]
}

function unwrapPayload<T>(
  response: RawArtistResponse<T> | null | undefined
): T | null {
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

function normalizeArtistProfile(
  response: RawArtistResponse<RawArtistDetailPayload>
): ArtistDetailProfile | null {
  const payload = unwrapPayload(response) || {}
  const artist = payload.artist || {}

  if (!artist.id) {
    return null
  }

  return {
    id: artist.id,
    name: artist.name || '未知歌手',
    coverUrl:
      artist.cover || artist.avatar || artist.picUrl || artist.img1v1Url || '',
    musicSize: artist.musicSize || 0,
    albumSize: artist.albumSize || 0,
    mvSize: artist.mvSize || 0,
    identity:
      payload.identify?.imageDesc ||
      payload.identify?.identityName ||
      artist.identifyTag?.[0] ||
      '艺人',
  }
}

function normalizeTopSongs(
  response: RawArtistResponse<{ songs?: RawTopSong[] }>
): ArtistTopSongItem[] {
  const payload = unwrapPayload(response)
  return (payload?.songs || []).map(song => ({
    id: song.id,
    name: song.name || '未知歌曲',
    subtitle: song.alia?.[0] || song.tns?.[0] || '',
    duration: song.dt || 0,
    albumName: song.al?.name || '',
    coverUrl: song.al?.picUrl || song.album?.picUrl || '',
    artists: (song.ar || []).map(artist => ({
      id: artist.id,
      name: artist.name || '未知歌手',
    })),
  }))
}

function normalizeAlbums(
  response: RawArtistResponse<{
    hotAlbums?: RawArtistAlbum[]
    albums?: RawArtistAlbum[]
  }>
) {
  const payload = unwrapPayload(response)
  return (payload?.hotAlbums || payload?.albums || []).map(album => ({
    id: album.id,
    name: album.name || '未知专辑',
    picUrl: album.picUrl || album.blurPicUrl || '',
    publishTime: album.publishTime,
    size: album.size,
  }))
}

function normalizeMvs(response: RawArtistResponse<{ mvs?: RawArtistMv[] }>) {
  const payload = unwrapPayload(response)
  return (payload?.mvs || []).map(mv => ({
    id: mv.id || mv.vid || 0,
    name: mv.name || '未知 MV',
    coverUrl: mv.imgurl16v9 || mv.cover || '',
    publishTime: mv.publishTime,
    playCount: mv.playCount,
  }))
}

function normalizeSimilarArtists(
  response: RawArtistResponse<{ artists?: RawArtistProfile[] }>
) {
  const payload = unwrapPayload(response)
  return (payload?.artists || []).map(artist => ({
    id: artist.id || 0,
    name: artist.name || '未知歌手',
    picUrl: artist.picUrl || artist.img1v1Url || '',
    musicSize: artist.musicSize,
    albumSize: artist.albumSize,
  }))
}

function normalizeDescription(
  response: RawArtistResponse<RawArtistDescResponse>
): ArtistDescPayload {
  const payload = unwrapPayload(response) || {}
  const briefDesc = (payload.briefDesc || '').trim()
  const sections = (payload.introduction || [])
    .map(item => ({
      title: item.ti || '',
      content: (item.txt || '').trim(),
    }))
    .filter(section => Boolean(section.content))

  const summary =
    briefDesc || sections.map(section => section.content).join('\n\n')

  return {
    summary,
    sections,
  }
}

function getHeroSummary(description: ArtistDescPayload) {
  const source = description.summary || description.sections[0]?.content || ''
  if (!source) {
    return ''
  }

  return source.length > 180 ? `${source.slice(0, 180)}...` : source
}

const ArtistDetail = () => {
  const { id } = useParams()
  const artistId = Number(id)
  const [state, setState] = useState<ArtistDetailPageState>(INITIAL_STATE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!artistId) {
      setLoading(false)
      setError('无效的歌手 ID')
      return
    }

    let isActive = true

    const fetchArtistData = async () => {
      setLoading(true)
      setError('')
      setState(INITIAL_STATE)

      try {
        const [
          detailResponse,
          topSongsResponse,
          albumsResponse,
          mvsResponse,
          // similarResponse,
          descResponse,
        ] = await Promise.all([
          getArtistDetail({ id: artistId }),
          getArtistTopSongs({ id: artistId }),
          getArtistAlbums({ id: artistId, limit: PAGE_SIZE, offset: 0 }),
          getArtistMvs({ id: artistId, limit: PAGE_SIZE, offset: 0 }),
          // getSimilarArtists({ id: artistId }),
          getArtistDesc({ id: artistId }),
        ])

        if (!isActive) {
          return
        }

        console.log('detailResponse', detailResponse)

        setState({
          profile: normalizeArtistProfile(detailResponse),
          topSongs: normalizeTopSongs(topSongsResponse),
          albums: normalizeAlbums(albumsResponse),
          mvs: normalizeMvs(mvsResponse),
          // similarArtists: normalizeSimilarArtists(similarResponse),
          description: normalizeDescription(descResponse),
        })
      } catch (fetchError) {
        if (!isActive) {
          return
        }

        console.error('artist detail fetch failed', fetchError)
        setError('歌手详情加载失败，请稍后重试')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void fetchArtistData()

    return () => {
      isActive = false
    }
  }, [artistId])

  const latestRelease = useMemo(
    () => ({
      album: state.albums[0] || null,
      mv: state.mvs[0] || null,
    }),
    [state.albums, state.mvs]
  )

  if (loading && !state.profile) {
    return <ArtistDetailSkeleton />
  }

  if (error && !state.profile) {
    return (
      <section className='pb-8'>
        <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
          {error}
        </div>
      </section>
    )
  }

  if (!state.profile) {
    return (
      <section className='pb-8'>
        <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
          暂无歌手详情数据
        </div>
      </section>
    )
  }

  return (
    <section className='space-y-10 pb-8'>
      <ArtistHero
        profile={state.profile}
        summary={getHeroSummary(state.description)}
      />
      <ArtistLatestRelease latestRelease={latestRelease} />
      <ArtistTopSongs songs={state.topSongs} />
      <ArtistMediaTabs albums={state.albums} mvs={state.mvs} />
      {/* <SimilarArtists artists={state.similarArtists} /> */}
    </section>
  )
}

export default ArtistDetail
