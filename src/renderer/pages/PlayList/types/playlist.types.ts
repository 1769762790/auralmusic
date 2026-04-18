export interface PlaylistCategory {
  name: string
  [key: string]: unknown
}

export interface PlaylistCategoryItem {
  name: string
  category?: number
  [key: string]: unknown
}

export interface PlaylistCategories {
  sub: PlaylistCategoryItem[]
  categories?: Record<string, string>
  [key: string]: unknown
}

export interface OnlinePlaylistFeatureCardData {
  coverImgUrl: string
  id: number
  name: string
  picUrl: string | null
  disabled?: boolean
}

export interface OnlinePlaylistFeatureCardProps {
  title: string
  card: OnlinePlaylistFeatureCardData
  onOpen: (playlistId: number) => void
  onPlay: (playlistId: number) => void
}

export interface PlaylistPageData {
  recommend: OnlinePlaylistFeatureCardData
  hot: OnlinePlaylistFeatureCardData
  categories: PlaylistCategories
}

export interface CategoriesPanelProps {
  categoryData?: PlaylistCategories
  className?: string
  currentCat?: string | null
  onSelect?: (categoryName: string) => void
}

export interface PlaylistItem {
  id: number
  name: string
  coverImgUrl: string
  count?: number
}

export interface AllPlaylistProps {
  categories?: PlaylistCategories
}
