import MediaDetailHero from '@/components/MediaDetailHero'

import {
  formatPlaylistUpdateDate,
  type PlaylistDetailHeroData,
} from '../playlist-detail.model'

interface PlaylistDetailHeroProps {
  hero: PlaylistDetailHeroData
  showFavoriteButton: boolean
  favoriteLoading: boolean
  onToggleFavorite: () => void
  onPlay: () => void
}

const PlaylistDetailHero = ({
  hero,
  showFavoriteButton,
  favoriteLoading,
  onToggleFavorite,
  onPlay,
}: PlaylistDetailHeroProps) => {
  return (
    <MediaDetailHero
      type='playlist'
      title={hero.name}
      coverUrl={hero.coverUrl}
      subtitle={`Playlist by ${hero.creatorName}`}
      metaItems={[
        `最近更新于 ${formatPlaylistUpdateDate(hero.updateTime)}`,
        `${hero.trackCount} 首歌`,
      ]}
      description={hero.description}
      favoriteVisible={showFavoriteButton}
      favorited={hero.isSubscribed}
      favoriteLoading={favoriteLoading}
      onToggleFavorite={onToggleFavorite}
      onPlay={onPlay}
    />
  )
}

export default PlaylistDetailHero
