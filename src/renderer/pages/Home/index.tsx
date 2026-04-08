import { useEffect, useEffectEvent, useState } from 'react'
import DailyFeatureCard from './components/DailyFeatureCard'
import FmFeatureCard from './components/FmFeatureCard'
import {
  getPersonalFm,
  getPersonalizedNewSong,
  getRecommendSongs,
  getTopArtists,
} from '@/api/list'
import { useDailySongs } from '@/stores/useDailySongs'
import TopArtists from './components/TopArtists'
import NewAlbumList from './components/NewAlbumList'
import { getAlbumNewSet } from '@/api/album'
import NewSongsList from './components/NewSongsList'
import { HomeFeatureSkeleton } from './components/HomeSkeletons'
import type {
  AlbumSummary,
  ArtistSummary,
  HomeFmData,
  NewSong,
} from './home.type'

const Home = () => {
  const [featureLoading, setFeatureLoading] = useState(true)
  const [artistsLoading, setArtistsLoading] = useState(true)
  const [albumsLoading, setAlbumsLoading] = useState(true)
  const [newSongsLoading, setNewSongsLoading] = useState(true)
  const [fmData, setFmData] = useState<HomeFmData>({})
  const setDailyList = useDailySongs(state => state.setList)
  const dailyList = useDailySongs(state => state.list)
  const [topArtists, setTopArtists] = useState<ArtistSummary[]>([])
  const [albumNewSet, setAlbumNewSet] = useState<AlbumSummary[]>([])
  const [newSongs, setNewSongs] = useState<NewSong[]>([])

  const fecthTopArtists = useEffectEvent(async () => {
    try {
      setArtistsLoading(true)
      const data = await getTopArtists({ offset: 1 })
      setTopArtists(data.data?.artists || [])
    } catch (error) {
      console.log(error)
    } finally {
      setArtistsLoading(false)
    }
  })

  const fetchTopData = useEffectEvent(async () => {
    try {
      setFeatureLoading(true)
      const [fmResponse, dailyResponse] = await Promise.all([
        getPersonalFm(),
        getRecommendSongs(),
      ])
      setDailyList(dailyResponse.data.data?.dailySongs || [])
      setFmData(fmResponse.data?.data?.[0] || {})
    } catch (error) {
      console.log('fetchPersonalFm:', error)
    } finally {
      setFeatureLoading(false)
    }
  })

  const fetchAlbumData = useEffectEvent(async () => {
    try {
      setAlbumsLoading(true)
      const data = await getAlbumNewSet()
      setAlbumNewSet(data.data?.albums || [])
    } catch (error) {
      console.log('fetchAlbumData:', error)
    } finally {
      setAlbumsLoading(false)
    }
  })

  const fetchNewSongsData = useEffectEvent(async () => {
    try {
      setNewSongsLoading(true)
      const data = await getPersonalizedNewSong(20)
      setNewSongs(data.data?.result || [])
    } catch (error) {
      console.log('fetchNewSongsData:', error)
    } finally {
      setNewSongsLoading(false)
    }
  })

  const topOneSong = dailyList[0] || {}

  useEffect(() => {
    void fetchTopData()
    void fecthTopArtists()
    void fetchAlbumData()
    void fetchNewSongsData()
  }, [])
  return (
    <div>
      {featureLoading ? (
        <HomeFeatureSkeleton />
      ) : (
        <div className='grid w-full grid-cols-2 gap-10'>
          <DailyFeatureCard
            isLoading={featureLoading}
            coverUrl={topOneSong?.al?.picUrl}
          />
          <FmFeatureCard
            isLoading={featureLoading}
            coverUrl={fmData?.album?.picUrl}
            title={fmData?.album?.name}
            artist={fmData?.album?.artist?.name}
          />
        </div>
      )}
      <TopArtists isLoading={artistsLoading} list={topArtists} />
      <NewSongsList isLoading={newSongsLoading} list={newSongs} />
      <NewAlbumList isLoading={albumsLoading} list={albumNewSet} />
    </div>
  )
}

export default Home
