type SearchSongCandidate = {
  id: number
}

type LocalLibraryLyricPayload = {
  lyricText: string
  translatedLyricText: string
}

function sanitizeLyricText(value: string) {
  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => {
      if (!line) {
        return false
      }

      // 网易云歌词接口偶尔会把头部 JSON 信息混进文本，写回本地前先剔除脏行。
      if (line.startsWith('{') && line.endsWith('}')) {
        return false
      }

      return true
    })
    .join('\n')
}

function readSearchSongs(payload: unknown) {
  const root = payload as
    | {
        result?: {
          songs?: Array<{
            id?: unknown
          }>
        }
      }
    | undefined

  return root?.result?.songs ?? []
}

export function buildLocalLyricSearchKeyword(
  title: string,
  artistName: string
) {
  return [title, artistName.replaceAll('|', ' ')]
    .map(value => value.trim())
    .filter(Boolean)
    .join(' ')
}

export function readFirstSearchSongCandidate(
  payload: unknown
): SearchSongCandidate | null {
  const candidate = readSearchSongs(payload).find(song => {
    return typeof song.id === 'number' && Number.isFinite(song.id)
  })

  if (!candidate || typeof candidate.id !== 'number') {
    return null
  }

  return {
    id: candidate.id,
  }
}

export function readOnlineLyricPayload(
  payload: unknown
): LocalLibraryLyricPayload {
  const root = payload as
    | {
        lrc?: { lyric?: string }
        tlyric?: { lyric?: string }
        data?: {
          lrc?: { lyric?: string }
          tlyric?: { lyric?: string }
        }
      }
    | undefined
  const data = root?.data ?? root

  return {
    lyricText: sanitizeLyricText(data?.lrc?.lyric ?? ''),
    translatedLyricText: sanitizeLyricText(data?.tlyric?.lyric ?? ''),
  }
}

export function readOnlineCoverUrl(payload: unknown) {
  const root = payload as
    | {
        songs?: Array<{
          al?: { picUrl?: string }
          album?: { picUrl?: string }
        }>
        data?: {
          songs?: Array<{
            al?: { picUrl?: string }
            album?: { picUrl?: string }
          }>
        }
      }
    | undefined
  const song = root?.songs?.[0] ?? root?.data?.songs?.[0]
  const album = song?.al ?? song?.album
  return typeof album?.picUrl === 'string' ? album.picUrl : ''
}
