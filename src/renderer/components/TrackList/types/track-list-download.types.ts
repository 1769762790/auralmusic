import type { SongDownloadPayload } from '../../../../main/download/download-types'
import type {
  DownloadResolutionPolicy,
  ResolvedDownloadSource,
} from '../../../services/download/download-source-resolver.ts'

export interface TrackListDownloadSong {
  artists?: Array<{ name: string }> | null
  id: number
  coverUrl?: string
  name: string
  artistNames?: string
  duration: number
  albumName?: string
}

export interface TrackDownloadSource {
  id: number
  name: string
  artistNames: string
  albumName: string
  coverUrl: string
  duration: number
}

export interface ResolveDownloadSourceInput {
  track: TrackDownloadSource
  requestedQuality: SongDownloadPayload['requestedQuality']
  policy: DownloadResolutionPolicy
}

export type ResolveDownloadSource = (
  input: ResolveDownloadSourceInput
) => Promise<ResolvedDownloadSource | null>
