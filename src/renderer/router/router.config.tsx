import type { RouteMenuConfig } from './router.type'
import AppLayout from '../layout/AppLayout'
import Home from '@/pages/Home'
import DailySongs from '@/pages/DailySongs'
import Charts from '@/pages/Charts'
import PlayList from '@/pages/PlayList'
import PlaylistDetail from '@/pages/PlayList/Detail'
import MvDetail from '@/pages/Mv/Detail'
import Artists from '@/pages/Artists'
import ArtistDetail from '@/pages/Artists/Detail'
import Albums from '@/pages/Albums'
import AlbumDetail from '@/pages/Albums/Detail'

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
