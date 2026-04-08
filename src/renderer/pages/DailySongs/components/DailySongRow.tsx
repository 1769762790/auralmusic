import {
  formatDailySongDuration,
  type DailySongRowItem,
} from '../daily-songs.model'

interface DailySongRowProps {
  song: DailySongRowItem
}

const DailySongRow = ({ song }: DailySongRowProps) => {
  return (
    <div className='group hover:bg-primary/5 grid grid-cols-3 items-center gap-4 rounded-[15px] px-4 py-3 transition-colors md:px-6'>
      <div className='flex min-w-0 items-center gap-4 rounded-[15px]'>
        <div className='relative size-12 flex-none overflow-hidden'>
          {song.coverUrl ? (
            <img
              src={song.coverUrl}
              alt={song.name}
              className='size-full rounded-md object-cover'
              loading='lazy'
              decoding='async'
              draggable={false}
            />
          ) : (
            <div className='from-muted to-muted/70 text-muted-foreground flex size-full items-center justify-center bg-gradient-to-br text-[10px] font-semibold'>
              NO
            </div>
          )}
        </div>

        <div className='min-w-0'>
          <p className='truncate text-[15px] font-semibold text-neutral-950'>
            {song.name}
          </p>
          <p className='truncate text-xs text-neutral-500 md:text-sm'>
            {song.artistNames}
          </p>
          <p className='mt-1 truncate text-xs text-neutral-500 md:hidden'>
            {song.albumName}
          </p>
        </div>
      </div>

      <p className='hidden truncate text-[15px] text-neutral-700 md:block'>
        {song.albumName}
      </p>
      <p className='text-right text-[15px] text-neutral-700'>
        {formatDailySongDuration(song.duration)}
      </p>
    </div>
  )
}

export default DailySongRow
