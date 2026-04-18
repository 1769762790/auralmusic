import type { ReactElement } from 'react'
import type { CollectPlaylistSongContext } from '@/types/core'

export interface MusicContextMenuProps {
  songId: number | undefined
  name: string | undefined
  artistName: string | undefined
  coverUrl: string | undefined
  likeStatus: boolean
  children: ReactElement
  onPlayClick: () => void
  onAddToQueueClick?: () => void
  onToggleClick: () => void
  onCollectToPlaylist?: (song: CollectPlaylistSongContext) => void
  onDownload?: () => void
}
