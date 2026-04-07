import { Skeleton } from '@/components/ui/skeleton'

const ALBUM_SKELETON_ITEMS = Array.from({ length: 10 })

export const AlbumsGridSkeleton = () => {
  return (
    <div className='grid grid-cols-2 gap-6 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
      {ALBUM_SKELETON_ITEMS.map((_, index) => (
        <div key={index} className='flex flex-col'>
          <Skeleton className='aspect-square rounded-[22px]' />
          <Skeleton className='mt-4 h-7 w-4/5 rounded-full' />
          <Skeleton className='mt-2 h-5 w-2/5 rounded-full' />
        </div>
      ))}
    </div>
  )
}
