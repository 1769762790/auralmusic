import type { RouteMenuConfig } from './router.type'

import AppLayout from '../layout/AppLayout'
import AlbumDetail from '@/pages/Albums/Detail'
import Albums from '@/pages/Albums'
import ArtistDetail from '@/pages/Artists/Detail'
import Artists from '@/pages/Artists'
import Charts from '@/pages/Charts'
import DailySongs from '@/pages/DailySongs'
import Home from '@/pages/Home'
import Library from '@/pages/Library'
import LikedSongs from '@/pages/LikedSongs'
import MvDetail from '@/pages/Mv/Detail'
import PlayList from '@/pages/PlayList'
import PlaylistDetail from '@/pages/PlayList/Detail'
import Settings from '@/pages/Settings'

export const routeMenuConfig: RouteMenuConfig[] = [
  {
    path: '/',
    element: <AppLayout />,
    meta: { hidden: true, title: 'App Layout' },
    children: [
      {
        path: '/',
        element: <Home />,
        meta: { title: '首页', icon: '' },
      },
      {
        path: '/daily-songs',
        element: <DailySongs />,
        meta: { title: '每日推荐', icon: '', hidden: true },
      },
      {
        path: '/library',
        element: <Library />,
        meta: { title: '乐库', icon: '', authOnly: true },
      },
      {
        path: '/library/liked-songs',
        element: <LikedSongs />,
        meta: { title: '我喜欢的音乐', icon: '', hidden: true, authOnly: true },
      },
      {
        path: '/settings',
        element: <Settings />,
        meta: { title: '设置', icon: '', hidden: true },
      },
      {
        path: '/charts',
        element: <Charts />,
        meta: { title: '排行榜', icon: '' },
      },
      {
        path: '/playlist',
        element: <PlayList />,
        meta: { title: '歌单', icon: '' },
      },
      {
        path: '/playlist/:id',
        element: <PlaylistDetail />,
        meta: { title: '歌单详情', icon: '', hidden: true },
      },
      {
        path: '/mv/:id',
        element: <MvDetail />,
        meta: { title: 'MV详情', icon: '', hidden: true },
      },
      {
        path: '/artists',
        element: <Artists />,
        meta: { title: '歌手', icon: '' },
      },
      {
        path: '/artists/:id',
        element: <ArtistDetail />,
        meta: { title: '歌手详情', icon: '', hidden: true },
      },
      {
        path: '/albums',
        element: <Albums />,
        meta: { title: '专辑', icon: '' },
      },
      {
        path: '/albums/:id',
        element: <AlbumDetail />,
        meta: { title: '专辑详情', icon: '', hidden: true },
      },
    ],
  },
]
