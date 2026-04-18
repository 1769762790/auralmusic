import MediaDetailHero from '@/components/MediaDetailHero'

import { formatPlaylistUpdateDate } from '../playlist-detail.model'
import type { PlaylistDetailHeroProps } from '../types'

const PlaylistDetailHero = ({
  hero,
  showFavoriteButton,
  favoriteLoading,
  onToggleFavorite,
  onPlay,
  moreActions,
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
      moreActions={moreActions}
      isResize={false}
    />
  )
}

export default PlaylistDetailHero
