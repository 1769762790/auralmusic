import { useMemo } from 'react'

import { usePlaybackStore } from '@/stores/playback-store'
import type { PlaybackTrack } from '../../../shared/playback.ts'
import TrackListItem, { songProps } from './TrackListItem'

interface TrackListProps {
  data: songProps[]
  coverUrl?: string
  onLikeChangeSuccess?: (songId: number, nextLiked: boolean) => void
}

function toPlaybackTrack(
  item: songProps,
  fallbackCoverUrl = ''
): PlaybackTrack {
  return {
    id: item.id,
    name: item.name,
    artistNames:
      item.artistNames ||
      (item.artists || []).map(artist => artist.name).join(' / '),
    albumName: item.albumName || '',
    coverUrl: item.coverUrl || fallbackCoverUrl,
    duration: item.duration,
  }
}

const TrackList = ({
  data = [],
  coverUrl,
  onLikeChangeSuccess,
}: TrackListProps) => {
  const playQueueFromIndex = usePlaybackStore(state => state.playQueueFromIndex)
  const currentTrackId = usePlaybackStore(state => state.currentTrack?.id)
  const playbackStatus = usePlaybackStore(state => state.status)
  const playbackQueue = useMemo(
    () => data.map(item => toPlaybackTrack(item, coverUrl)),
    [coverUrl, data]
  )

  return (
    <div>
      {data?.length > 0 ? (
        <div>
          {data?.map((item, index) => {
            return (
              <TrackListItem
                key={item.id}
                item={item}
                coverUrl={coverUrl}
                isActive={item.id === currentTrackId}
                isPlaying={
                  item.id === currentTrackId && playbackStatus === 'playing'
                }
                onPlay={() => playQueueFromIndex(playbackQueue, index)}
                onLikeChangeSuccess={onLikeChangeSuccess}
              />
            )
          })}
        </div>
      ) : (
        <div>暂无数据</div>
      )}
    </div>
  )
}

export default TrackList
