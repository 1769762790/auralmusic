export type RouteMenuConfig = {
  path: string
  element: React.ReactNode
  meta: {
    title: string
    icon?: string
    hidden?: boolean
    authOnly?: boolean
  }
  children?: RouteMenuConfig[]
}
