export const OnlinePlaylistFeatureSkeleton = () => {
  return (
    <div className='grid grid-cols-2 gap-5'>
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className='relative min-h-[240px] animate-pulse overflow-hidden rounded-[15px] bg-slate-800'
        >
          <div className='absolute inset-0 bg-slate-700/80' />
          <div className='relative z-10 flex h-full min-h-[240px] flex-col justify-between p-7'>
            <div className='space-y-4'>
              <div className='h-10 w-36 rounded-full bg-slate-600' />
              <div className='h-4 w-5/6 rounded-full bg-slate-600' />
            </div>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-full bg-slate-600' />
              <div className='h-10 w-28 rounded-full bg-slate-600' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const AllPlayListSkeleton = () => {
  return (
    <div className='3xl:grid-cols-6 4xl:grid-cols-7 grid grid-cols-4 gap-6 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5'>
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className='flex flex-col gap-4'>
          <div className='aspect-square animate-pulse rounded-[15px] bg-slate-700' />
          <div className='space-y-2'>
            <div className='h-4 w-4/5 animate-pulse rounded-full bg-slate-700' />
            <div className='h-3 w-3/5 animate-pulse rounded-full bg-slate-700' />
          </div>
        </div>
      ))}
    </div>
  )
}
