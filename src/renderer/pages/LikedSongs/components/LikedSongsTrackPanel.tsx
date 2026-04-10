import { useCallback, useEffect, useState } from 'react'

import { getPlaylistTrackAll } from '@/api/list'
import { useIntersectionLoadMore } from '@/hooks/useLoadMore'

import {
  normalizeLikedSongsTrackPage,
  type LikedSongsPlaylistMeta,
} from '../liked-songs.model'
import TrackList from '@/components/TrackList'

interface LikedSongsTrackPanelProps {
  playlist: LikedSongsPlaylistMeta
}

const PAGE_SIZE = 50

const LikedSongsTrackPanel = ({ playlist }: LikedSongsTrackPanelProps) => {
  const [error, setError] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const fetchTrackPage = useCallback(
    async (offset: number, limit: number) => {
      try {
        setError('')

        const response = await getPlaylistTrackAll(playlist.id, limit, offset)
        return normalizeLikedSongsTrackPage(response.data, {
          offset,
          totalSongs: playlist.totalSongs,
        })
      } catch (fetchError) {
        console.error('liked songs track page fetch failed', fetchError)

        if (offset === 0) {
          setError('我喜欢的音乐加载失败，请稍后重试')
        }

        return {
          list: [],
          hasMore: false,
        }
      } finally {
        if (offset === 0) {
          setIsInitialLoading(false)
        }
      }
    },
    [playlist.id, playlist.totalSongs]
  )

  const {
    data: songs,
    loading,
    hasMore,
    sentinelRef,
    reset,
  } = useIntersectionLoadMore(fetchTrackPage, {
    limit: PAGE_SIZE,
  })

  useEffect(() => {
    setError('')
    setIsInitialLoading(true)
    reset()
  }, [playlist.id, reset])

  if (playlist.totalSongs === 0) {
    return (
      <div className='mx-auto px-4 pb-10 md:px-6'>
        <div className='border-border/60 bg-card/75 text-muted-foreground rounded-[28px] border px-6 py-12 text-center text-sm shadow-[0_18px_50px_rgba(15,23,42,0.04)]'>
          暂无喜欢的音乐
        </div>
      </div>
    )
  }

  if (error && songs.length === 0) {
    return (
      <div className='mx-auto px-4 pb-10 md:px-6'>
        <div className='border-destructive/20 bg-destructive/5 text-destructive rounded-[28px] border px-6 py-12 text-center text-sm'>
          {error}
        </div>
      </div>
    )
  }

  if (isInitialLoading && songs.length === 0) {
    return (
      <div className='mx-auto px-4 pb-10 md:px-6'>
        <div className='border-border/60 bg-card/75 text-muted-foreground rounded-[28px] border px-6 py-12 text-center text-sm shadow-[0_18px_50px_rgba(15,23,42,0.04)]'>
          正在加载我喜欢的音乐...
        </div>
      </div>
    )
  }

  if (!isInitialLoading && songs.length === 0) {
    return (
      <div className='mx-auto px-4 pb-10 md:px-6'>
        <div className='border-border/60 bg-card/75 text-muted-foreground rounded-[28px] border px-6 py-12 text-center text-sm shadow-[0_18px_50px_rgba(15,23,42,0.04)]'>
          暂无喜欢的音乐
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <TrackList data={songs} />

      <div
        ref={sentinelRef}
        className='text-muted-foreground flex h-16 items-center justify-center text-sm'
      >
        {loading && !isInitialLoading ? '正在加载更多喜欢的音乐...' : null}
        {!loading && !hasMore && songs.length > 0 ? '没有更多歌曲了' : null}
      </div>
    </div>
  )
}

export default LikedSongsTrackPanel
