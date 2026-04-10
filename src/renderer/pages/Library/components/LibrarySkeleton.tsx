import { Skeleton } from '@/components/ui/skeleton'

const LibrarySkeleton = () => {
  return (
    <section className='space-y-8 pb-10'>
      <div className='rounded-[34px] border border-neutral-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-12 rounded-full' />
          <div className='space-y-3'>
            <Skeleton className='h-12 w-[min(720px,72vw)] rounded-full' />
            <Skeleton className='h-4 w-64 rounded-full' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]'>
        <Skeleton className='h-[230px] rounded-[34px]' />
        <div className='grid grid-cols-3 gap-4'>
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className='h-[70px] rounded-[18px]' />
          ))}
        </div>
      </div>

      <Skeleton className='h-10 w-full rounded-full' />

      <div className='grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5'>
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className='aspect-square rounded-[22px]' />
        ))}
      </div>
    </section>
  )
}

export default LibrarySkeleton
