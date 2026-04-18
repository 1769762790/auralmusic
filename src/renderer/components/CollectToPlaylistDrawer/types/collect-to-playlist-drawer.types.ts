import type {
  CollectPlaylistSongContext,
  CollectPlaylistTarget,
} from '@/types/core'

export interface CollectToPlaylistCreateFormProps {
  title: string
  isPrivate: boolean
  submitting: boolean
  disabled: boolean
  maxLength: number
  onTitleChange: (value: string) => void
  onPrivateChange: (checked: boolean) => void
  onSubmit: () => void
}

export interface CollectToPlaylistTargetListProps {
  playlists: CollectPlaylistTarget[]
  loading: boolean
  pendingPlaylistId: number | null
  onAdd: (playlist: CollectPlaylistTarget) => void
}

export interface CollectToPlaylistSongSummaryProps {
  song: CollectPlaylistSongContext
  createExpanded: boolean
  onToggleCreate: () => void
}
