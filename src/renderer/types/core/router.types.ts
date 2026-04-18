import type { ReactNode } from 'react'

export interface RouteMenuMeta {
  title: string
  icon?: string
  hidden?: boolean
  authOnly?: boolean
}

export interface RouteMenuConfig {
  path: string
  element: ReactNode
  meta: RouteMenuMeta
  children?: RouteMenuConfig[]
}
