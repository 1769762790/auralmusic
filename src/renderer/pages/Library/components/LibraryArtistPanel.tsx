import { useCallback, useEffect, useRef, useState } from 'react'

import { getSubscribedArtists } from '@/api/artist'
import { useIntersectionLoadMore } from '@/hooks/useLoadMore'
import ArtistCard from '@/pages/Artists/components/ArtistCard'
import type { ArtistListItem } from '@/pages/Artists/artists.model'

import { normalizeLibraryArtistPage } from '../library-artists.model'
import ArtistCover from '@/components/ArtistCover'
import { useNavigate } from 'react-router-dom'
import { isDef } from '@/lib/utils'

interface LibraryArtistPanelProps {
  active: boolean
}

const PAGE_SIZE = 25

const LibraryArtistPanel = ({ active }: LibraryArtistPanelProps) => {
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const hasActivatedRef = useRef(false)
  const navigate = useNavigate()

  const fetchSubscribedArtists = useCallback(
    async (offset: number, limit: number) => {
      try {
        const response = await getSubscribedArtists({
          limit,
          offset,
        })

        return normalizeLibraryArtistPage(response.data, {
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
    data: artists,
    loading,
    hasMore,
    sentinelRef,
    reset,
  } = useIntersectionLoadMore<ArtistListItem>(fetchSubscribedArtists, {
    limit: PAGE_SIZE,
  })

  console.log('fetchSubscribedArtists', artists)

  useEffect(() => {
    if (!active || hasActivatedRef.current) {
      return
    }

    hasActivatedRef.current = true
    setIsInitialLoading(true)
    reset()
  }, [active, reset])

  if (!active && artists.length === 0) {
    return null
  }

  if (isInitialLoading && artists.length === 0) {
    return (
      <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
        正在加载已收藏艺人...
      </div>
    )
  }

  if (!isInitialLoading && artists.length === 0) {
    return (
      <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
        暂无艺人内容
      </div>
    )
  }

  const onOpenArtist = (artistId: number) => {
    if (isDef(artistId)) {
      navigate(`/artists/${artistId}`)
    }
  }
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-8'>
        {artists.map(artist => (
          <ArtistCover
            artistCoverUrl={artist.picUrl}
            artistName={artist.name}
            rounded='full'
            onClickCover={() => onOpenArtist(artist.id)}
            onPlay={() => console.log('播放', artist)}
          />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className='text-muted-foreground flex h-16 items-center justify-center text-sm'
      >
        {loading && !isInitialLoading ? '正在加载更多艺人...' : null}
        {!loading && !hasMore && artists.length > 0 ? '没有更多艺人了' : null}
      </div>
    </div>
  )
}

export default LibraryArtistPanel
