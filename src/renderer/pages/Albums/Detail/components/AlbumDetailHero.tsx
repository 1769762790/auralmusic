import MediaDetailHero from '@/components/MediaDetailHero'

import {
  formatAlbumPublishDate,
  type AlbumDetailHeroData,
} from '../album-detail.model'

interface AlbumDetailHeroProps {
  hero: AlbumDetailHeroData
  isLiked: boolean
  likeLoading: boolean
  onToggleLiked: () => void
  onPlay: () => void
}

const AlbumDetailHero = ({
  hero,
  isLiked,
  likeLoading,
  onToggleLiked,
  onPlay,
}: AlbumDetailHeroProps) => {
  return (
    <MediaDetailHero
      type='album'
      title={hero.name}
      coverUrl={hero.coverUrl}
      subtitle={hero.artistNames}
      metaItems={[
        `发行于 ${formatAlbumPublishDate(hero.publishTime)}`,
        `${hero.trackCount} 首歌`,
      ]}
      description={hero.description}
      favorited={isLiked}
      favoriteLoading={likeLoading}
      onToggleFavorite={onToggleLiked}
      onPlay={onPlay}
    />
  )
}

export default AlbumDetailHero
