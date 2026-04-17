// 只放懒加载组件，纯组件文件
import { lazy } from 'react'

export const Home = lazy(() => import('@/pages/Home'))
export const DailySongs = lazy(() => import('@/pages/DailySongs'))
export const Library = lazy(() => import('@/pages/Library'))
export const LikedSongs = lazy(() => import('@/pages/LikedSongs'))
export const Settings = lazy(() => import('@/pages/Settings'))
export const Downloads = lazy(() => import('@/pages/Downloads'))
export const Charts = lazy(() => import('@/pages/Charts'))
export const PlayList = lazy(() => import('@/pages/PlayList'))
export const PlaylistDetail = lazy(() => import('@/pages/PlayList/Detail'))
export const MvDetail = lazy(() => import('@/pages/Mv/Detail'))
export const Artists = lazy(() => import('@/pages/Artists'))
export const ArtistDetail = lazy(() => import('@/pages/Artists/Detail'))
export const Albums = lazy(() => import('@/pages/Albums'))
export const AlbumDetail = lazy(() => import('@/pages/Albums/Detail'))
