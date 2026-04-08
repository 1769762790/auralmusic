import { Skeleton } from '@/components/ui/skeleton'

const AlbumDetailSkeleton = () => {
  return (
    <section className='space-y-10 pb-8'>
      <div className='grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]'>
        <Skeleton className='aspect-square rounded-[28px]' />
        <div className='space-y-5'>
          <Skeleton className='h-16 w-4/5 rounded-full' />
          <Skeleton className='h-6 w-64 rounded-full' />
          <Skeleton className='h-24 w-full rounded-[24px]' />
          <div className='flex gap-4'>
            <Skeleton className='h-14 w-32 rounded-full' />
            <Skeleton className='h-14 w-14 rounded-full' />
            <Skeleton className='h-14 w-14 rounded-full' />
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <Skeleton className='h-4 w-48 rounded-full' />
        <div className='border-border/60 bg-card/60 space-y-3 rounded-[30px] border p-4'>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className='grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_88px] items-center gap-4'
            >
              <Skeleton className='h-14 w-full rounded-[18px]' />
              <Skeleton className='h-10 w-full rounded-full' />
              <Skeleton className='h-10 w-full rounded-full' />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AlbumDetailSkeleton
