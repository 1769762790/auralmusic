import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAlbumDetail } from '@/api/album'
import AlbumDetailHero from './components/AlbumDetailHero'
import AlbumDetailSkeleton from './components/AlbumDetailSkeleton'
import AlbumTrackTable from './components/AlbumTrackTable'
import {
  EMPTY_ALBUM_DETAIL_STATE,
  normalizeAlbumDetailHero,
  normalizeAlbumTracks,
  type AlbumDetailPageState,
} from './album-detail.model'

const AlbumDetail = () => {
  const { id } = useParams()
  const albumId = Number(id)
  const [state, setState] = useState<AlbumDetailPageState>(
    EMPTY_ALBUM_DETAIL_STATE
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!albumId) {
      setLoading(false)
      setError('无效的专辑 ID')
      return
    }

    let isActive = true

    const fetchAlbumDetail = async () => {
      setLoading(true)
      setError('')
      setState(EMPTY_ALBUM_DETAIL_STATE)

      try {
        const response = await getAlbumDetail(albumId)

        if (!isActive) {
          return
        }

        setState({
          hero: normalizeAlbumDetailHero(response.data),
          tracks: normalizeAlbumTracks(response.data),
        })
      } catch (fetchError) {
        if (!isActive) {
          return
        }

        console.error('album detail fetch failed', fetchError)
        setError('专辑详情加载失败，请稍后重试')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void fetchAlbumDetail()

    return () => {
      isActive = false
    }
  }, [albumId])

  if (loading && !state.hero) {
    return <AlbumDetailSkeleton />
  }

  if (error && !state.hero) {
    return (
      <section className='pb-8'>
        <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
          {error}
        </div>
      </section>
    )
  }

  if (!state.hero) {
    return (
      <section className='pb-8'>
        <div className='border-border/60 bg-card/70 text-muted-foreground rounded-[28px] border px-6 py-10 text-center text-sm'>
          暂无专辑详情数据
        </div>
      </section>
    )
  }

  return (
    <section className='space-y-10 pb-8'>
      <AlbumDetailHero hero={state.hero} />
      <AlbumTrackTable tracks={state.tracks} coverUrl={state.hero.coverUrl} />
    </section>
  )
}

export default AlbumDetail
