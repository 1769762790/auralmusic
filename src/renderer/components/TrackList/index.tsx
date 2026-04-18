import { useMemo } from 'react'

import { usePlaybackStore } from '@/stores/playback-store'
import type { TrackListProps } from './types'
import { toPlaybackTrack } from './model'
import TrackListItem from './TrackListItem'

const TrackList = ({
  data = [],
  coverUrl,
  onLikeChangeSuccess,
}: TrackListProps) => {
  const playQueueFromIndex = usePlaybackStore(state => state.playQueueFromIndex)
  const appendToQueue = usePlaybackStore(state => state.appendToQueue)
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
                onAddToQueue={() => appendToQueue([playbackQueue[index]])}
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
