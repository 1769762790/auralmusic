import { startTransition, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  geTopPlayList,
  getPlaylistTrackAll,
  getRecommendPlayList,
  getTopList,
  getTopListDetailById,
} from '@/api/list'
import { useAuthStore } from '@/stores/auth-store'
import { userPlaylist } from '@/api/user'

import LibraryHero from './components/LibraryHero'
import LibraryLockedState from './components/LibraryLockedState'
import LibrarySkeleton from './components/LibrarySkeleton'
import LibraryTabsSection from './components/LibraryTabsSection'
import {
  EMPTY_LIBRARY_PAGE_DATA,
  resolveLibraryLikedPlaylist,
  normalizeLibraryPlaylists,
  normalizeLibraryRankings,
  normalizeLibrarySongs,
  type LibraryPageData,
  type PlaylistFilterValue,
} from './library.model'

const Library = () => {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const loginStatus = useAuthStore(state => state.loginStatus)
  const hasHydrated = useAuthStore(state => state.hasHydrated)

  const [data, setData] = useState<LibraryPageData>(EMPTY_LIBRARY_PAGE_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [playlistLoading, setPlaylistLoading] = useState(false)
  const [rankingLoading, setRankingLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [playlistFilter, setPlaylistFilter] =
    useState<PlaylistFilterValue>('recommend')

  const isAuthenticated =
    hasHydrated && loginStatus === 'authenticated' && Boolean(user?.userId)

  const loadPlaylists = useCallback(async (filter: PlaylistFilterValue) => {
    setPlaylistLoading(true)

    try {
      if (filter === 'recommend') {
        const response = await getRecommendPlayList(12)
        return normalizeLibraryPlaylists(response.data)
      }

      const response = await geTopPlayList({
        cat: '全部',
        order: filter,
        limit: 12,
        offset: 0,
      })

      return normalizeLibraryPlaylists(response.data)
    } catch (fetchError) {
      console.error('library playlists fetch failed', fetchError)
      return []
    } finally {
      setPlaylistLoading(false)
    }
  }, [])

  const loadBaseData = useCallback(
    async (filter: PlaylistFilterValue, uid: number) => {
      setIsLoading(true)
      setErrorMessage('')
      setRankingLoading(true)
      setPlaylistLoading(true)

      try {
        const likedSongsPromise = userPlaylist({ uid })
          .then(async response => {
            const likedPlaylist = resolveLibraryLikedPlaylist(response.data)

            if (!likedPlaylist?.id) {
              return {
                likedSongs: [],
                likedSongCount: 0,
                likedPlaylistCoverUrl: '',
              }
            }

            const detailResponse = await getPlaylistTrackAll(
              likedPlaylist.id,
              9,
              0
            )

            return {
              likedSongs: normalizeLibrarySongs(detailResponse.data),
              likedSongCount: likedPlaylist.trackCount,
              likedPlaylistCoverUrl: likedPlaylist.coverImgUrl,
            }
          })
          .catch(fetchError => {
            console.error('library liked songs fetch failed', fetchError)
            return {
              likedSongs: [],
              likedSongCount: 0,
              likedPlaylistCoverUrl: '',
            }
          })

        const playlistsPromise = loadPlaylists(filter)

        const rankingsPromise = getTopList()
          .then(async response => {
            const topList = response.data?.list || []
            const first = topList[0]

            if (!first?.id) {
              return []
            }

            const detailResponse = await getTopListDetailById(first.id)
            return normalizeLibraryRankings(detailResponse.data)
          })
          .catch(fetchError => {
            console.error('library rankings fetch failed', fetchError)
            return []
          })

        const [likedSongsData, playlists, rankings] = await Promise.all([
          likedSongsPromise,
          playlistsPromise,
          rankingsPromise,
        ])

        setData({
          likedSongs: likedSongsData.likedSongs,
          likedSongCount: likedSongsData.likedSongCount,
          likedPlaylistCoverUrl: likedSongsData.likedPlaylistCoverUrl,
          playlists,
          rankings,
        })
      } catch (fetchError) {
        console.error('library base data fetch failed', fetchError)
        setErrorMessage('乐库内容加载失败，请稍后重试')
      } finally {
        setIsLoading(false)
        setRankingLoading(false)
        setPlaylistLoading(false)
      }
    },
    [loadPlaylists]
  )

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setData(EMPTY_LIBRARY_PAGE_DATA)
      setIsLoading(false)
      setPlaylistLoading(false)
      setRankingLoading(false)
      setErrorMessage('')
      return
    }

    void loadBaseData(playlistFilter, user.userId)
  }, [isAuthenticated, loadBaseData, playlistFilter, user?.userId])

  const handlePlaylistFilterChange = (value: PlaylistFilterValue) => {
    startTransition(() => {
      setPlaylistFilter(value)
    })
  }

  const handleOpenLikedSongs = () => {
    navigate('/library/liked-songs')
  }

  const handleOpenPlaylist = (playlistId: number) => {
    if (!playlistId) return
    navigate(`/playlist/${playlistId}`)
  }

  const handleOpenMv = (mvId: number) => {
    if (!mvId) return
    navigate(`/mv/${mvId}`)
  }

  if (!hasHydrated) {
    return <LibrarySkeleton />
  }

  if (!isAuthenticated) {
    return <LibraryLockedState />
  }

  return (
    <section className='relative isolate w-full pb-8'>
      {errorMessage ? (
        <div className='border-destructive/20 bg-destructive/5 text-destructive mb-6 rounded-[18px] border px-4 py-3 text-sm'>
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? <LibrarySkeleton /> : null}

      {!isLoading ? (
        <div className='space-y-10'>
          <LibraryHero
            songs={data.likedSongs}
            songCount={data.likedSongCount}
            coverImgUrl={data.likedPlaylistCoverUrl}
            onOpenLikedSongs={handleOpenLikedSongs}
          />

          <LibraryTabsSection
            data={data}
            playlistLoading={playlistLoading}
            rankingLoading={rankingLoading}
            onOpenPlaylist={handleOpenPlaylist}
            onOpenMv={handleOpenMv}
            playlistFilter={playlistFilter}
            onPlaylistFilterChange={handlePlaylistFilterChange}
          />
        </div>
      ) : null}
    </section>
  )
}

export default Library
