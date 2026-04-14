export const CACHE_IPC_CHANNELS = {
  GET_DEFAULT_DIRECTORY: 'cache:get-default-directory',
  SELECT_DIRECTORY: 'cache:select-directory',
  GET_STATUS: 'cache:get-status',
  CLEAR: 'cache:clear',
  RESOLVE_AUDIO_SOURCE: 'cache:resolve-audio-source',
  READ_LYRICS_PAYLOAD: 'cache:read-lyrics-payload',
  WRITE_LYRICS_PAYLOAD: 'cache:write-lyrics-payload',
} as const
