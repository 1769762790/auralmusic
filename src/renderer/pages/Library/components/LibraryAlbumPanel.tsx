import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getSubscribedAlbums } from '@/api/album'
import { useIntersectionLoadMore } from '@/hooks/useLoadMore'
import AlbumCard from '@/pages/Albums/components/AlbumCard'
import type { AlbumListItem } from '@/pages/Albums/albums.model'

import { normalizeLibraryAlbumPage } from '../library-albums.model'

interface LibraryAlbumPanelProps {
  active: boolean
}

const PAGE_SIZE = 25

const LibraryAlbumPanel = ({ active }: LibraryAlbumPanelProps) => {
  const navigate = useNavigate()
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const hasActivatedRef = useRef(false)

  const fetchSubscribedAlbums = useCallback(
    async (offset: number, limit: number) => {
      try {
        const response = await getSubscribedAlbums({
          limit,
          offset,
        })

        return normalizeLibraryAlbumPage(response.data, {
          limit,
          offset,
        })
      } finally {
        if (offset === 0) {
          setIsInitialLoading(false)
        }
      }
    },
    []
  )

  const {
    data: albums,
    loading,
    hasMore,
    sentinelRef,
    reset,
  } = useIntersectionLoadMore<AlbumListItem>(fetchSubscribedAlbums, {
    limit: PAGE_SIZE,
  })

  useEffect(() => {
    if (!active || hasActivatedRef.current) {
      return
    }

    hasActivatedRef.current = true
    setIsInitialLoading(true)
    reset()
  }, [active, reset])

  if (!active && albums.length === 0) {
    return null
  }

  if (isInitialLoading && albums.length === 0) {
    return (
      <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
        正在加载已收藏专辑...
      </div>
    )
  }

  if (!isInitialLoading && albums.length === 0) {
    return (
      <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
        暂无专辑内容
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
        {albums.map(album => (
          <AlbumCard
            key={album.id}
            album={album}
            onToAlbumDetail={albumId => navigate(`/albums/${albumId}`)}
          />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className='text-muted-foreground flex h-16 items-center justify-center text-sm'
      >
        {loading && !isInitialLoading ? '正在加载更多专辑...' : null}
        {!loading && !hasMore && albums.length > 0 ? '没有更多专辑了' : null}
      </div>
    </div>
  )
}

export default LibraryAlbumPanel
