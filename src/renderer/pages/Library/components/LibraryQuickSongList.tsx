import { useMemo, useState } from 'react'

import TrackListItem from '@/components/TrackList/TrackListItem'
import { usePlaybackStore } from '@/stores/playback-store'
import {
  buildLibraryQuickSongPlaybackQueue,
  filterLibraryQuickSongs,
} from './library-quick-song-list.model'
import type { LibraryQuickSongListProps } from '../types'

const LibraryQuickSongList = ({ songs }: LibraryQuickSongListProps) => {
  const [hiddenSongIds, setHiddenSongIds] = useState<Set<number>>(new Set())
  const playQueueFromIndex = usePlaybackStore(state => state.playQueueFromIndex)
  const appendToQueue = usePlaybackStore(state => state.appendToQueue)
  const currentTrackId = usePlaybackStore(state => state.currentTrack?.id)
  const playbackStatus = usePlaybackStore(state => state.status)
  const visibleSongs = useMemo(
    () => filterLibraryQuickSongs(songs, hiddenSongIds),
    [hiddenSongIds, songs]
  )
  const playbackQueue = useMemo(
    () => buildLibraryQuickSongPlaybackQueue(visibleSongs),
    [visibleSongs]
  )

  const handleLikeChangeSuccess = (songId: number, nextLiked: boolean) => {
    if (nextLiked) {
      return
    }

    setHiddenSongIds(previous => {
      const nextIds = new Set(previous)
      nextIds.add(songId)
      return nextIds
    })
  }

  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
      {visibleSongs.map((song, index) => (
        <TrackListItem
          key={song.id}
          item={song}
          type='quick'
          coverUrl={song.coverUrl}
          isActive={song.id === currentTrackId}
          isPlaying={song.id === currentTrackId && playbackStatus === 'playing'}
          onPlay={() => playQueueFromIndex(playbackQueue, index)}
          onAddToQueue={() => appendToQueue([playbackQueue[index]])}
          onLikeChangeSuccess={handleLikeChangeSuccess}
        />
      ))}
    </div>
  )
}

export default LibraryQuickSongList
