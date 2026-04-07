import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CircleUserRound,
  Disc3,
  Home,
  ListMusic,
} from 'lucide-react'

interface SidebarNavItem {
  to: string
  label: string
  note: string
  icon: LucideIcon
}

export const onlineNavItems: SidebarNavItem[] = [
  { to: '/', label: 'Home', note: '', icon: Home },
  { to: '/charts', label: 'Charts', note: '', icon: BarChart3 },
  { to: '/playlist', label: 'Playlists', note: '', icon: ListMusic },
  { to: '/artists', label: 'Artists', note: '', icon: CircleUserRound },
  { to: '/albums', label: 'Albums', note: '', icon: Disc3 },
]
