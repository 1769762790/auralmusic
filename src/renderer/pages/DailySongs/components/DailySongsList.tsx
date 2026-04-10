import DailySongRow from './DailySongRow'
import type { DailySongRowItem } from '../daily-songs.model'

interface DailySongsListProps {
  songs: DailySongRowItem[]
}

const DailySongsList = ({ songs }: DailySongsListProps) => {
  if (songs.length === 0) {
    return (
      <div className='border-border/60 bg-card/75 text-muted-foreground mx-auto max-w-[1120px] rounded-[28px] border px-6 py-12 text-center text-sm shadow-[0_18px_50px_rgba(15,23,42,0.04)]'>
        暂无每日推荐歌曲
      </div>
    )
  }

  return (
    <section className='mx-auto px-4 md:px-6'>
      <div className='backdrop-blur'>
        {songs.map(song => (
          <DailySongRow key={song.id} song={song} />
        ))}
      </div>
    </section>
  )
}

export default DailySongsList
