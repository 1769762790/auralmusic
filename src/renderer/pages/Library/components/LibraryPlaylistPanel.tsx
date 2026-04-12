import ArtistCover from '@/components/ArtistCover'
import type { LibraryPlaylistItem } from '../library.model'

interface LibraryPlaylistPanelProps {
  playlists: LibraryPlaylistItem[]
  loading?: boolean
  onOpen: (id: number) => void
}

const LibraryPlaylistPanel = ({
  playlists,
  loading = false,
  onOpen,
}: LibraryPlaylistPanelProps) => {
  if (!loading && playlists.length === 0) {
    return (
      <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
        暂无歌单内容
      </div>
    )
  }

  console.log('playlists', playlists)

  return (
    <div className='grid grid-cols-2 gap-6 md:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6'>
      {playlists.map(item => (
        <ArtistCover
          artistCoverUrl={item.coverUrl}
          subTitle={item.subtitle}
          artistName={item.name}
          key={item.id}
          // onPlay={() => handlePlay(item)}
          onClickCover={() => onOpen(item.id)}
        />
      ))}
    </div>
  )
}

export default LibraryPlaylistPanel
