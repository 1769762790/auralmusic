import {
  gePlayListCatList,
  geTopPlayList,
  getRecommendPlayList,
} from '@/api/list'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  OnlinePlaylistFeatureCard,
  type OnlinePlaylistFeatureCardData,
} from './components/OnlinePlaylistFeatureCard'
import AllPlayList from './components/AllPlayList'
import {
  OnlinePlaylistFeatureSkeleton,
  AllPlayListSkeleton,
} from './components/PlayListSkeletons'

interface PlaylistCategory {
  name: string
  [key: string]: unknown
}

interface PlaylistCategories {
  sub: PlaylistCategory[]
  categories?: Record<string, string>
  [key: string]: unknown
}

interface PlaylistData {
  recommend: OnlinePlaylistFeatureCardData
  hot: OnlinePlaylistFeatureCardData
  categories: PlaylistCategories
}

const PlayList = () => {
  const navigate = useNavigate()
  const [playlistData, setPlaylistData] = useState<PlaylistData>({
    recommend: { coverImgUrl: '', id: 0, name: '', picUrl: null },
    hot: { coverImgUrl: '', id: 0, name: '', picUrl: null },
    categories: { sub: [] },
  })
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const fetchHotPlayList = async () => {
      setLoading(true)
      try {
        const recommend = await getRecommendPlayList(1)
        const hot = await geTopPlayList({ limit: 1, order: 'hot' })
        const catList = await gePlayListCatList()
        setPlaylistData({
          recommend: {
            ...recommend.data?.result?.[0],
            coverImgUrl: recommend.data?.result?.[0]?.picUrl,
          },
          hot: hot.data.playlists?.[0],
          categories: catList.data,
        })
      } catch (error) {
        console.log('feachHotPlayList', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchHotPlayList()
  }, [])

  const handleOpenPlaylist = (playlistId: number) => {
    navigate(`/playlist/${playlistId}`)
  }

  return (
    <div className='w-full'>
      {isLoading ? (
        <>
          <OnlinePlaylistFeatureSkeleton />
          <div className='mt-10'>
            <AllPlayListSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className='grid grid-cols-2 gap-5'>
            <OnlinePlaylistFeatureCard
              title='每日推荐'
              card={playlistData.recommend}
              onPlay={() => {}}
              onOpen={handleOpenPlaylist}
            />
            <OnlinePlaylistFeatureCard
              title='热门歌单'
              card={playlistData.hot}
              onPlay={() => {}}
              onOpen={handleOpenPlaylist}
            />
          </div>
          <div>
            <AllPlayList categories={playlistData.categories} />
          </div>
        </>
      )}
    </div>
  )
}

export default PlayList
