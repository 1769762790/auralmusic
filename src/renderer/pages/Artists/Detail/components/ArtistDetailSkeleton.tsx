import { Skeleton } from '@/components/ui/skeleton'

const SONG_SKELETONS = Array.from({ length: 6 })
const GRID_SKELETONS = Array.from({ length: 4 })

const ArtistDetailSkeleton = () => {
  return (
    <section className='space-y-10 pb-8'>
      <div className='grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]'>
        <Skeleton className='aspect-[4/4.4] rounded-[36px]' />
        <div className='space-y-5'>
          <Skeleton className='h-4 w-28 rounded-full' />
          <Skeleton className='h-16 w-64 rounded-full' />
          <Skeleton className='h-6 w-56 rounded-full' />
          <Skeleton className='h-24 w-full rounded-[28px]' />
          <div className='flex gap-4'>
            <Skeleton className='h-14 w-40 rounded-full' />
            <Skeleton className='h-14 w-36 rounded-full' />
            <Skeleton className='h-14 w-14 rounded-full' />
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
