import { startTransition, useCallback, useEffect, useState } from 'react'
import { getNewAlbums } from '@/api/album'
import { useIntersectionLoadMore } from '@/hooks/useLoadMore'
import AlbumCard from './components/AlbumCard'
import AlbumFilters from './components/AlbumFilters'
import { AlbumsGridSkeleton } from './components/AlbumsSkeletons'
import {
  ALBUM_AREA_OPTIONS,
  type AlbumArea,
  type AlbumListItem,
  type NewAlbumsResponse,
} from './albums.model'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 30

const Albums = () => {
  const [area, setArea] = useState<AlbumArea>('ALL')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const navigate = useNavigate()

  const fetchAlbums = useCallback(
    async (offset: number, limit: number) => {
      try {
        const response = await getNewAlbums({
          area,
          offset,
          limit,
        })

        const payload = (response.data || {}) as NewAlbumsResponse
        const albums = (payload.albums || []) as AlbumListItem[]

        return {
          list: albums,
          hasMore: albums.length >= limit,
        }
      } finally {
        if (offset === 0) {
          setIsInitialLoading(false)
        }
      }
    },
    [area]
  )

  const {
    data: albums,
    loading,
    hasMore,
    sentinelRef,
    reset,
  } = useIntersectionLoadMore<AlbumListItem>(fetchAlbums, {
    limit: PAGE_SIZE,
  })

  useEffect(() => {
    setIsInitialLoading(true)
    reset()
  }, [area, reset])

  const handleAreaChange = (nextArea: AlbumArea) => {
    startTransition(() => {
      setArea(nextArea)
    })
  }

  const navigateToAlbumDetail = (albumId: number) => {
    if (!albumId) return
    navigate(`/albums/${albumId}`)
  }

  const isEmpty = !isInitialLoading && albums.length === 0

  return (
    <section className='w-full pb-8'>
      <div className='bg-background/88 overflow-hidden] relative border p-6 backdrop-blur-xl'>
        <AlbumFilters
          options={ALBUM_AREA_OPTIONS}
          value={area}
          onChange={handleAreaChange}
        />
      </div>

      <div className='mt-10'>
        {isInitialLoading ? (
          <AlbumsGridSkeleton />
        ) : isEmpty ? (
          <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
            当前分类下暂无新专辑数据
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
            {albums.map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                onToAlbumDetail={navigateToAlbumDetail}
              />
            ))}
          </div>
        )}
      </div>

      <div
        ref={sentinelRef}
        className='text-muted-foreground flex h-20 items-center justify-center text-sm'
      >
        {loading && !isInitialLoading ? '正在加载更多专辑...' : null}
        {!loading && !hasMore && albums.length > 0 ? '没有更多专辑了' : null}
      </div>
    </section>
  )
}

export default Albums
