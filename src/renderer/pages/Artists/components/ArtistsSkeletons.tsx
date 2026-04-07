import { Skeleton } from '@/components/ui/skeleton'

const ARTIST_SKELETON_ITEMS = Array.from({ length: 8 })

export const ArtistsGridSkeleton = () => {
  return (
    <div className='grid grid-cols-4 gap-6 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6'>
      {ARTIST_SKELETON_ITEMS.map((_, index) => (
        <div key={index} className='flex flex-col'>
          <Skeleton className='aspect-square rounded-[15px]' />
          <Skeleton className='mt-4 h-7 w-2/3 rounded-full' />
        </div>
      ))}
    </div>
  )
}
