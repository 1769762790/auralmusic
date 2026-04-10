import type { LibraryRankingItem } from '../library.model'
import { formatLibraryDuration } from '../library.model'

interface LibraryRankingRowProps {
  item: LibraryRankingItem
}

const LibraryRankingRow = ({ item }: LibraryRankingRowProps) => {
  return (
    <div className='group grid grid-cols-[minmax(0,1fr)_48px] items-center gap-4 rounded-[18px] px-4 py-3 transition-colors hover:bg-neutral-100/80'>
      <div className='flex min-w-0 items-center gap-3'>
        <div className='border-border/40 bg-muted size-11 flex-none overflow-hidden rounded-[12px]'>
          {item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt={item.name}
              className='size-full object-cover'
              loading='lazy'
              decoding='async'
              draggable={false}
            />
          ) : null}
        </div>

        <div className='min-w-0'>
          <p className='truncate text-[15px] font-semibold text-neutral-950'>
            {item.name}
          </p>
          <p className='truncate text-xs text-neutral-500'>
            {item.artistNames}
          </p>
          <p className='mt-1 truncate text-xs text-neutral-500 md:hidden'>
            {item.albumName}
          </p>
        </div>
      </div>

      <div className='flex flex-col items-end gap-1 text-right'>
        <span className='text-xl font-black text-neutral-950'>{item.rank}</span>
        <span className='hidden text-xs text-neutral-500 md:block'>
          {formatLibraryDuration(item.duration)}
        </span>
      </div>
    </div>
  )
}

export default LibraryRankingRow
