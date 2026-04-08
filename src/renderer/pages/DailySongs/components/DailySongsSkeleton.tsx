import { Skeleton } from '@/components/ui/skeleton'

const DailySongsSkeleton = () => {
  return (
    <section className='space-y-10 pb-10'>
      <div className='flex flex-col items-center px-6 pt-14 pb-10 text-center md:pt-20 md:pb-14'>
        <div className='space-y-5'>
          <Skeleton className='mx-auto h-20 w-[min(720px,84vw)] rounded-full bg-rose-100/90' />
          <Skeleton className='mx-auto h-5 w-72 rounded-full bg-neutral-100' />
          <Skeleton className='mx-auto h-3 w-44 rounded-full bg-neutral-100' />
        </div>
      </div>

      <section className='mx-auto max-w-[1120px] px-4 md:px-6'>
        <div className='border-border/50 overflow-hidden rounded-[28px] border bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.05)]'>
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className='grid grid-cols-[minmax(0,1fr)_72px] items-center gap-4 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_72px] md:px-6'
            >
              <div className='flex min-w-0 items-center gap-4'>
                <Skeleton className='size-12 rounded-[14px]' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <Skeleton className='h-4 w-40 rounded-full' />
                  <Skeleton className='h-3 w-28 rounded-full' />
                  <Skeleton className='h-3 w-24 rounded-full md:hidden' />
                </div>
              </div>
              <Skeleton className='hidden h-4 w-32 rounded-full md:block' />
              <Skeleton className='ml-auto h-4 w-12 rounded-full' />
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default DailySongsSkeleton
