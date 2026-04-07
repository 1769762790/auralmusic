import { Skeleton } from '@/components/ui/skeleton'

const ARTIST_SKELETON_ITEMS = Array.from({ length: 8 })
const NEW_SONG_COLUMNS = Array.from({ length: 4 })
const NEW_SONG_ROWS = Array.from({ length: 5 })
const ALBUM_SKELETON_ITEMS = Array.from({ length: 6 })

export const HomeFeatureCardSkeleton = () => {
  return (
    <div className='border-border/70 relative h-[200px] overflow-hidden rounded-[26px] border bg-[#090909] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)]'>
      <div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(8,8,10,0.92)_0%,rgba(8,8,10,0.82)_38%,rgba(8,8,10,0.72)_72%,rgba(8,8,10,0.92)_100%)]' />
      <div className='relative z-10 flex h-full items-center justify-between'>
        <div className='space-y-4'>
          <Skeleton className='h-6 w-20 bg-white/12' />
          <Skeleton className='h-14 w-28 bg-white/10' />
          <Skeleton className='h-14 w-24 bg-white/10' />
        </div>
        <Skeleton className='size-12 rounded-full bg-white/12' />
      </div>
    </div>
  )
}

export const HomeFeatureSkeleton = () => {
  return (
    <div className='grid w-full grid-cols-2 gap-10'>
      <HomeFeatureCardSkeleton />
      <HomeFeatureCardSkeleton />
    </div>
  )
}

export const TopArtistsSkeleton = () => {
  return (
    <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6'>
      {ARTIST_SKELETON_ITEMS.map((_, index) => (
        <div key={index} className='flex flex-col items-center text-center'>
          <Skeleton className='size-[150px] rounded-full' />
          <Skeleton className='mt-3 h-4 w-24 rounded-full' />
        </div>
      ))}
    </div>
  )
}

export const NewSongsSkeleton = () => {
  return (
    <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      {NEW_SONG_COLUMNS.map((_, columnIndex) => (
        <div key={columnIndex} className='flex flex-col'>
          {NEW_SONG_ROWS.map((_, rowIndex) => (
            <div
              key={`${columnIndex}-${rowIndex}`}
              className='mb-5 flex items-center rounded-md px-2 py-2'
            >
              <Skeleton className='h-15 w-15 shrink-0 rounded-md' />
              <div className='ml-5 min-w-0 flex-1 space-y-3'>
                <Skeleton className='h-4 w-4/5' />
                <Skeleton className='h-3 w-2/5' />
              </div>
              <Skeleton className='size-10 rounded-full' />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export const NewAlbumSkeleton = () => {
  return (
    <div className='grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-8 2xl:grid-cols-6 2xl:gap-8'>
      {ALBUM_SKELETON_ITEMS.map((_, index) => (
        <div key={index} className='group w-full'>
          <Skeleton className='aspect-square rounded-2xl' />
          <Skeleton className='mt-2 h-5 w-4/5' />
          <Skeleton className='mt-2 h-4 w-3/5' />
        </div>
      ))}
    </div>
  )
}
