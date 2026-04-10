import { formatDailySongDuration } from '@/pages/DailySongs/daily-songs.model'
import AvatarCover from '../AvatarCover'

export interface songProps {
  id: number
  coverUrl: string
  name: string
  artistNames: string
  duration: number
  albumName: string
}
interface TrackListItemProps {
  item: songProps
}
const TrackListItem = ({ item }: TrackListItemProps) => {
  return (
    <div className='hover:bg-primary/5 grid cursor-pointer grid-cols-3 items-center rounded-[15px] px-4 py-4'>
      <div className='flex items-center gap-4'>
        {item.coverUrl && (
          <AvatarCover className='w-12.5 shrink-0' url={item.coverUrl} />
        )}

        <div className='flex-1 truncate'>
          <div className='truncate text-[15px] font-semibold'>{item.name}</div>
          <div className='truncate text-xs text-neutral-500 md:text-sm'>
            {item.artistNames}
          </div>
        </div>
      </div>
      <div className='hidden truncate text-[15px] text-neutral-700 md:block'>
        {item.albumName}
      </div>
      <div className='text-right text-[15px] text-neutral-700'>
        {formatDailySongDuration(item.duration)}
      </div>
    </div>
  )
}

export default TrackListItem
