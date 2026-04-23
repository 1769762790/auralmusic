import { Skeleton } from '@/components/ui/skeleton'

const LibrarySkeleton = () => {
  return (
    <section className='w-full space-y-10 pb-8'>
      <section className='space-y-6'>
        <div className='grid grid-cols-[1fr_2fr] gap-5'>
          <div className='border-border/70 bg-card/75 relative min-h-[240px] overflow-hidden rounded-[32px] border p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)]'>
            <div className='absolute inset-0 bg-[linear-gradient(138deg,#eff5ff_0%,#deebff_48%,#ccdcff_100%)] dark:bg-[linear-gradient(138deg,rgba(30,41,59,0.92)_0%,rgba(51,65,85,0.85)_100%)]' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.48),transparent_36%),radial-gradient(circle_at_18%_80%,rgba(255,255,255,0.34),transparent_32%)] dark:bg-[radial-gradient(circle_at_78%_22%,rgba(148,163,184,0.22),transparent_36%),radial-gradient(circle_at_18%_80%,rgba(100,116,139,0.18),transparent_32%)]' />
            <div className='absolute inset-0 bg-white/34 backdrop-blur-[3px] dark:bg-black/18' />

            <div className='relative z-10 flex h-full flex-col justify-between'>
              <div className='space-y-3'>
                <Skeleton className='h-4 w-32 bg-white/66 dark:bg-white/14' />
              </div>

              <div className='flex items-end justify-between gap-4'>
                <div className='space-y-3'>
                  <Skeleton className='h-10 w-56 bg-white/74 dark:bg-white/16' />
                  <Skeleton className='h-4 w-20 bg-white/66 dark:bg-white/14' />
                </div>
                <Skeleton className='size-12 rounded-full bg-white/78 dark:bg-white/18' />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className='border-border/55 bg-card/72 flex items-center gap-3 rounded-[18px] border px-3 py-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]'
              >
                <Skeleton className='bg-foreground/12 size-12 rounded-[12px] dark:bg-white/12' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <Skeleton className='bg-foreground/12 h-4 w-4/5 rounded-full dark:bg-white/12' />
                  <Skeleton className='bg-foreground/10 h-3 w-2/5 rounded-full dark:bg-white/10' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='w-full space-y-6'>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className='h-11 w-20 rounded-[14px]' />
            ))}
          </div>

          <Skeleton className='h-12 w-32 rounded-[16px]' />
        </div>

        <div className='grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-5'>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className='space-y-3'>
              <Skeleton className='aspect-square rounded-[22px]' />
              <Skeleton className='h-5 w-4/5 rounded-full' />
              <Skeleton className='h-4 w-2/5 rounded-full' />
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default LibrarySkeleton
