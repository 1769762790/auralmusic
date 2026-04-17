import { lazy } from 'react'
import Home from '@/pages/Home'
import PlayList from '@/pages/PlayList'
import Artists from '@/pages/Artists'
import Albums from '@/pages/Albums'

export { Home, PlayList, Artists, Albums }

export const DailySongs = lazy(() => import('@/pages/DailySongs'))
export const Library = lazy(() => import('@/pages/Library'))
export const LikedSongs = lazy(() => import('@/pages/LikedSongs'))
export const Settings = lazy(() => import('@/pages/Settings'))
export const Downloads = lazy(() => import('@/pages/Downloads'))
export const Charts = lazy(() => import('@/pages/Charts'))
export const PlaylistDetail = lazy(() => import('@/pages/PlayList/Detail'))
export const MvDetail = lazy(() => import('@/pages/Mv/Detail'))
export const ArtistDetail = lazy(() => import('@/pages/Artists/Detail'))
export const AlbumDetail = lazy(() => import('@/pages/Albums/Detail'))
