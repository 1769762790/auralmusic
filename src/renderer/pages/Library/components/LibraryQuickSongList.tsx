import type { LibrarySongItem } from '../library.model'

interface LibraryQuickSongListProps {
  songs: LibrarySongItem[]
}

const LibraryQuickSongList = ({ songs }: LibraryQuickSongListProps) => {
  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
      {songs.slice(0, 9).map(song => (
        <article
          key={song.id}
          className='border-border/30 bg-background/70 flex items-center gap-3 rounded-[18px] border px-3 py-2.5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]'
        >
          <div className='bg-muted size-12 flex-none overflow-hidden rounded-[12px]'>
            {song.coverUrl ? (
              <img
                src={song.coverUrl}
                alt={song.name}
                className='size-full object-cover'
                loading='lazy'
                decoding='async'
                draggable={false}
              />
            ) : null}
          </div>

          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-neutral-950'>
              {song.name}
            </p>
            <p className='truncate text-xs text-neutral-500'>
              {song.artistNames}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

export default LibraryQuickSongList
