import type {
  ArtistAlbumItem,
  ArtistDetailProfile,
  ArtistMvItem,
  ArtistSimilarItem,
} from '../../types'

export interface ImageResolveResult {
  url: string
  fromCache: boolean
}

export interface ImageResolver {
  resolveImageSource: (
    cacheKey: string,
    sourceUrl: string
  ) => Promise<ImageResolveResult>
}

export interface ResolveArtistProfileImageInput {
  cacheApi: ImageResolver
  profile: ArtistDetailProfile | null
}

export interface ResolveSimilarArtistImagesInput {
  cacheApi: ImageResolver
  artistId: number
  artists: ArtistSimilarItem[]
}

export interface ResolveArtistAlbumImagesInput {
  cacheApi: ImageResolver
  albums: ArtistAlbumItem[]
}

export interface ResolveArtistMvImagesInput {
  cacheApi: ImageResolver
  mvs: ArtistMvItem[]
}
