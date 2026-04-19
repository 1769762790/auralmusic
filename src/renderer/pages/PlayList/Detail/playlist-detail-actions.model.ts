export const PLAYLIST_NAME_MAX_LENGTH = 40
import type {
  PlaylistDetailMoreAction,
  PlaylistUpdateDraft,
  PlaylistUpdatePayload,
} from './types'

export type { PlaylistUpdatePayload } from './types'

export function resolvePlaylistDetailMoreActions(
  isOwnPlaylist: boolean
): PlaylistDetailMoreAction[] {
  return isOwnPlaylist ? ['edit', 'delete'] : []
}

export function buildPlaylistUpdatePayload(
  draft: PlaylistUpdateDraft
): PlaylistUpdatePayload | null {
  const name = draft.name.trim()

  if (!name || name.length > PLAYLIST_NAME_MAX_LENGTH) {
    return null
  }

  return {
    id: draft.id,
    name,
    desc: draft.description.trim(),
  }
}
