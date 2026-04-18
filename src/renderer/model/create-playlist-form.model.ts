import type { CreatePlaylistFormPayload } from '@/types/core'

export const CREATE_PLAYLIST_TITLE_MAX_LENGTH = 40

export function buildCreatePlaylistPayload(
  title: string,
  isPrivate: boolean
): CreatePlaylistFormPayload | null {
  const normalizedTitle = title.trim()

  if (
    !normalizedTitle ||
    normalizedTitle.length > CREATE_PLAYLIST_TITLE_MAX_LENGTH
  ) {
    return null
  }

  return {
    name: normalizedTitle,
    privacy: isPrivate ? '10' : undefined,
  }
}
