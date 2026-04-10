import { useEffect, useState } from 'react'

import DailySongsSkeleton from '@/pages/DailySongs/components/DailySongsSkeleton'
import LibraryLockedState from '@/pages/Library/components/LibraryLockedState'
import { useAuthStore } from '@/stores/auth-store'
import { userPlaylist } from '@/api/user'

import LikedSongsHero from './components/LikedSongsHero'
import LikedSongsTrackPanel from './components/LikedSongsTrackPanel'
import {
  resolveLikedSongsPlaylist,
  type LikedSongsPlaylistMeta,
} from './liked-songs.model'
import { toast } from 'sonner'

const LikedSongs = () => {
  const user = useAuthStore(state => state.user)
  const loginStatus = useAuthStore(state => state.loginStatus)
  const hasHydrated = useAuthStore(state => state.hasHydrated)

  const [playlist, setPlaylist] = useState<LikedSongsPlaylistMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAuthenticated =
    hasHydrated && loginStatus === 'authenticated' && Boolean(user?.userId)

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setPlaylist(null)
      setLoading(false)
      setError('')
      return
    }

    let isActive = true

    const fetchLikedPlaylist = async () => {
      setLoading(true)
      setError('')
      setPlaylist(null)

      try {
        const playlistResponse = await userPlaylist({ uid: user.userId })
        const likedPlaylist = resolveLikedSongsPlaylist(playlistResponse.data)

        if (!isActive) {
          return
        }

        setPlaylist(likedPlaylist)
      } catch (fetchError) {
        if (!isActive) {
          return
        }

        console.error('liked songs playlist fetch failed', fetchError)
        toast.error('音乐歌单加载失败，请稍后重试')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void fetchLikedPlaylist()

    return () => {
      isActive = false
    }
  }, [isAuthenticated, user?.userId])

  if (!hasHydrated || loading) {
    return <DailySongsSkeleton />
  }

  if (!isAuthenticated) {
    return <LibraryLockedState />
  }

  return (
    <section className='relative isolate min-h-full overflow-hidden pb-8'>
      <LikedSongsHero totalSongs={playlist?.totalSongs || 0} />

      {error ? (
        <div className='mx-auto px-4 pb-10 md:px-6'>
          <div className='border-destructive/20 bg-destructive/5 text-destructive rounded-[28px] border px-6 py-12 text-center text-sm'>
            {error}
          </div>
        </div>
      ) : !playlist ? (
        <div className='mx-auto px-4 pb-10 md:px-6'>
          <div className='border-border/60 bg-card/75 text-muted-foreground rounded-[28px] border px-6 py-12 text-center text-sm shadow-[0_18px_50px_rgba(15,23,42,0.04)]'>
            暂无喜欢的音乐歌单
          </div>
        </div>
      ) : (
        <LikedSongsTrackPanel playlist={playlist} />
      )}
    </section>
  )
}

export default LikedSongs
