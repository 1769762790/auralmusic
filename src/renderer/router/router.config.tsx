import AppLayout from '../layout/AppLayout'
import Home from '@/pages/Home'
import Charts from '@/pages/Charts'
import { RouteMenuConfig } from './router.type'
import PlayList from '@/pages/PlayList'

// 路由/菜单配置数组（可根据需要调整结构，如添加权限字段等）
export const routeMenuConfig: RouteMenuConfig[] = [
  {
    path: '/',
    element: <AppLayout />,
    meta: { hidden: true, title: 'App Layout' },
    children: [
      {
        path: '/',
        element: <Home />,
        meta: { title: '主页', icon: '' },
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
    ],
  },
]
