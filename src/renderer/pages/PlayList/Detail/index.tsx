import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getPlaylistDetail,
  getPlaylistTracks,
  togglePlaylistSubscription,
} from '@/api/list'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { usePlaybackStore } from '@/stores/playback-store'
import { useUserStore } from '@/stores/user'
import PlaylistDetailHero from './components/PlaylistDetailHero'
import PlaylistDetailSkeleton from './components/PlaylistDetailSkeleton'
import {
  EMPTY_PLAYLIST_DETAIL_STATE,
  normalizePlaylistDetailHero,
  normalizePlaylistTracks,
  type PlaylistDetailPageState,
} from './playlist-detail.model'
import TrackList from '@/components/TrackList'

const PlaylistDetail = () => {
  const { id } = useParams()
  const playlistId = Number(id)
  const currentUserId = useAuthStore(state => state.user?.userId)
  const hasHydrated = useAuthStore(state => state.hasHydrated)
  const openLoginDialog = useAuthStore(state => state.openLoginDialog)
  const fetchLikedPlaylist = useUserStore(state => state.fetchLikedPlaylist)
  const playQueueFromIndex = usePlaybackStore(state => state.playQueueFromIndex)
  const [state, setState] = useState<PlaylistDetailPageState>(
    EMPTY_PLAYLIST_DETAIL_STATE
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favoriteLoading, setFavoriteLoading] = useState(false)

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

  const isOwnPlaylist =
    Boolean(currentUserId) && state.hero.creatorUserId === currentUserId

  const handlePlayPlaylist = () => {
    if (!state.tracks.length) {
      toast.error('暂无可播放的歌单歌曲')
      return
    }

    playQueueFromIndex(state.tracks, 0)
  }

  const handleTogglePlaylistFavorite = async () => {
    if (!hasHydrated || !currentUserId) {
      openLoginDialog('email')
      return
    }

    if (!state.hero || isOwnPlaylist || favoriteLoading) {
      return
    }

    const nextSubscribed = !state.hero.isSubscribed
    setFavoriteLoading(true)

    try {
      await togglePlaylistSubscription({
        id: state.hero.id,
        t: nextSubscribed ? 1 : 2,
      })

      setState(prevState => {
        if (!prevState.hero) {
          return prevState
        }

        return {
          ...prevState,
          hero: {
            ...prevState.hero,
            isSubscribed: nextSubscribed,
          },
        }
      })

      void fetchLikedPlaylist()
    } catch (favoriteError) {
      console.error('playlist subscription toggle failed', favoriteError)
      toast.error(
        nextSubscribed ? '收藏歌单失败，请稍后重试' : '取消收藏失败，请稍后重试'
      )
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <section className='space-y-10 pb-8'>
      <PlaylistDetailHero
        hero={state.hero}
        showFavoriteButton={!isOwnPlaylist}
        favoriteLoading={favoriteLoading}
        onToggleFavorite={handleTogglePlaylistFavorite}
        onPlay={handlePlayPlaylist}
      />
      <TrackList data={state.tracks} />
    </section>
  )
}

export default PlaylistDetail
