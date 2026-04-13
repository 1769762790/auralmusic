export const CREATE_PLAYLIST_TITLE_MAX_LENGTH = 40

export interface CreatePlaylistFormPayload {
  name: string
  privacy?: '10'
}

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
