import { chunkArray } from '@/lib/utils'
import { memo } from 'react'
import type { NewSong } from '../home.type'
import { NewSongsSkeleton } from './HomeSkeletons'
import SongItem from './SongItem'

interface NewSongsListProps {
  list?: NewSong[]
  isLoading?: boolean
}

const NewSongsList = ({ list = [], isLoading = false }: NewSongsListProps) => {
  const groupedSongs = chunkArray(list, 5)

  const formatSong = (song: NewSong): NewSong => {
    const primaryArtist = song.song?.artists?.[0]

    return {
      ...song,
      artist: primaryArtist ? { ...primaryArtist } : song.artist,
    }
  }

  return (
    <div className='mt-10'>
      <div className='mb-10 text-2xl font-semibold'>新歌速递</div>
      {isLoading ? (
        <NewSongsSkeleton />
      ) : (
        <div className='grid gap-5 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4'>
          {groupedSongs.map((group, index) => (
            <div key={index} className='flex flex-col'>
              {group.map(song => (
                <SongItem key={song.id} song={formatSong(song)} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(NewSongsList)
