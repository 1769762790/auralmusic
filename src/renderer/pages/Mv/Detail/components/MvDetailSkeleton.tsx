import { Skeleton } from '@/components/ui/skeleton'

const MvDetailSkeleton = () => {
  return (
    <section className='space-y-10 pb-8'>
      <div className='border-border/60 bg-card/85 overflow-hidden rounded-[30px] border shadow-[0_28px_80px_rgba(15,23,42,0.12)]'>
        <Skeleton className='aspect-video rounded-none' />
      </div>

      <div className='space-y-5'>
        <Skeleton className='h-4 w-24 rounded-full' />
        <Skeleton className='h-14 w-4/5 rounded-full' />
        <Skeleton className='h-5 w-3/5 rounded-full' />
        <Skeleton className='h-24 w-full rounded-[24px]' />
      </div>

      <div className='space-y-4'>
        <Skeleton className='h-8 w-40 rounded-full' />
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className='border-border/50 bg-card/70 overflow-hidden rounded-[24px] border p-3'
            >
              <Skeleton className='aspect-[16/9] rounded-[18px]' />
              <div className='space-y-3 px-1 pt-3'>
                <Skeleton className='h-5 w-5/6 rounded-full' />
                <Skeleton className='h-4 w-2/5 rounded-full' />
                <Skeleton className='h-4 w-1/3 rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MvDetailSkeleton
