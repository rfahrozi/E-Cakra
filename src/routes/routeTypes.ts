export type RouteKey = 'home' | 'login' | 'dashboard' | 'notFound'

export interface AppRoute {
  path: string
  key: RouteKey
  isProtected: boolean
}
