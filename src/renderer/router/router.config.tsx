import type { RouteMenuConfig } from './router.type'
import AppLayout from '../layout/AppLayout'
import Home from '@/pages/Home'
import Charts from '@/pages/Charts'
import PlayList from '@/pages/PlayList'
import Artists from '@/pages/Artists'
import ArtistDetail from '@/pages/Artists/Detail'
import Albums from '@/pages/Albums'

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
    ],
  },
]
