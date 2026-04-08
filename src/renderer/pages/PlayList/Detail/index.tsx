import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPlaylistDetail, getPlaylistTracks } from '@/api/list'
import PlaylistDetailHero from './components/PlaylistDetailHero'
import PlaylistDetailSkeleton from './components/PlaylistDetailSkeleton'
import PlaylistTrackTable from './components/PlaylistTrackTable'
import {
  EMPTY_PLAYLIST_DETAIL_STATE,
  normalizePlaylistDetailHero,
  normalizePlaylistTracks,
  type PlaylistDetailPageState,
} from './playlist-detail.model'

const PlaylistDetail = () => {
  const { id } = useParams()
  const playlistId = Number(id)
  const [state, setState] = useState<PlaylistDetailPageState>(
    EMPTY_PLAYLIST_DETAIL_STATE
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!playlistId) {
      setLoading(false)
      setError('无效的歌单 ID')
      return
    }

    let isActive = true

    const fetchPlaylistDetail = async () => {
      setLoading(true)
      setError('')
      setState(EMPTY_PLAYLIST_DETAIL_STATE)

      try {
        const [detailResponse, tracksResponse] = await Promise.all([
          getPlaylistDetail(playlistId),
          getPlaylistTracks({ id: playlistId, limit: 1000, offset: 0 }),
        ])

        if (!isActive) {
          return
        }

        setState({
          hero: normalizePlaylistDetailHero(detailResponse.data),
          tracks: normalizePlaylistTracks(tracksResponse.data),
        })
      } catch (fetchError) {
        if (!isActive) {
          return
        }

        console.error('playlist detail fetch failed', fetchError)
        setError('歌单详情加载失败，请稍后重试')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void fetchPlaylistDetail()

    return () => {
      isActive = false
    }
  }, [playlistId])

  if (loading && !state.hero) {
    return <PlaylistDetailSkeleton />
  }

  if (error && !state.hero) {
    return (
      <section className='pb-8'>
        <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
          {error}
        </div>
      </section>
    )
  }

  if (!state.hero) {
    return (
      <section className='pb-8'>
        <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
          暂无歌单详情数据
        </div>
      </section>
    )
  }

  return (
    <section className='space-y-10 pb-8'>
      <PlaylistDetailHero hero={state.hero} />
      <PlaylistTrackTable tracks={state.tracks} />
    </section>
  )
}

export default PlaylistDetail
