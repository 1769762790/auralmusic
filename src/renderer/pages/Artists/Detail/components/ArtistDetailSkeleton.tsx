import { Skeleton } from '@/components/ui/skeleton'
import {
  ARTIST_DETAIL_HERO_LAYOUT,
  ARTIST_DETAIL_HERO_SKELETON_LAYOUT,
} from '../artist-detail-layout.model'

const SONG_SKELETONS = Array.from({ length: 6 })
const GRID_SKELETONS = Array.from({ length: 4 })

const ArtistDetailSkeleton = () => {
  return (
    <section className='space-y-10 pb-8'>
      <div className={ARTIST_DETAIL_HERO_LAYOUT.grid}>
        <Skeleton className={ARTIST_DETAIL_HERO_SKELETON_LAYOUT.avatar} />
        <div className={ARTIST_DETAIL_HERO_LAYOUT.content}>
          <div className='space-y-2'>
            <Skeleton className={ARTIST_DETAIL_HERO_SKELETON_LAYOUT.title} />
            <Skeleton className={ARTIST_DETAIL_HERO_SKELETON_LAYOUT.meta} />
          </div>
          <Skeleton className={ARTIST_DETAIL_HERO_SKELETON_LAYOUT.summary} />
          <div className='flex gap-4'>
            <Skeleton className='h-14 w-40 rounded-full' />
            <Skeleton className='h-14 w-36 rounded-full' />
            <Skeleton
              className={ARTIST_DETAIL_HERO_SKELETON_LAYOUT.moreButton}
            />
          </div>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-2'>
        {GRID_SKELETONS.slice(0, 2).map((_, index) => (
          <Skeleton key={index} className='h-44 rounded-[30px]' />
        ))}
      </div>

      <div className='space-y-4'>
        <Skeleton className='h-10 w-40 rounded-full' />
        <div className='border-border/60 bg-card/60 space-y-3 rounded-[30px] border p-4'>
          {SONG_SKELETONS.map((_, index) => (
            <div
              key={index}
              className='grid grid-cols-[56px_minmax(0,1.6fr)_minmax(0,1.2fr)_72px] items-center gap-4'
            >
              <Skeleton className='size-14 rounded-2xl' />
              <Skeleton className='h-10 w-full rounded-full' />
              <Skeleton className='h-10 w-full rounded-full' />
              <Skeleton className='h-10 w-full rounded-full' />
            </div>
          ))}
        </div>
      </div>

      <div className='space-y-5'>
        <Skeleton className='h-10 w-36 rounded-full' />
        <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4'>
          {GRID_SKELETONS.map((_, index) => (
            <div key={index} className='space-y-3'>
              <Skeleton className='aspect-square rounded-[24px]' />
              <Skeleton className='h-7 w-3/4 rounded-full' />
              <Skeleton className='h-5 w-2/5 rounded-full' />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ArtistDetailSkeleton
