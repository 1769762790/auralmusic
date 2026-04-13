import TrackListItem from '@/components/TrackList/TrackListItem'
import type { LibrarySongItem } from '../library.model'

interface LibraryQuickSongListProps {
  songs: LibrarySongItem[]
}

const LibraryQuickSongList = ({ songs }: LibraryQuickSongListProps) => {
  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
      {songs.slice(0, 9).map(song => (
        <TrackListItem
          key={song.id}
          item={song}
          type='quick'
          coverUrl={song.coverUrl}
        />
      ))}
    </div>
  )
}

export default LibraryQuickSongList
