import { useState, ReactNode } from "react"

export type RouteId = 'chat' | 'gallery' | 'codex' | 'gpts' | 'projects' | 'prompts'

interface RouterContextValue {
  currentRoute: RouteId
  navigate: (route: RouteId) => void
}

let routerContext: RouterContextValue | null = null

export function useRouter() {
  if (!routerContext) {
    throw new Error('useRouter must be used within a Router')
  }
  return routerContext
}

interface RouterProps {
  children: ReactNode
  initialRoute?: RouteId
}

export function Router({ children, initialRoute = 'chat' }: RouterProps) {
  const [currentRoute, setCurrentRoute] = useState<RouteId>(initialRoute)

  const navigate = (route: RouteId) => {
    setCurrentRoute(route)
    window.history.pushState({}, '', route === 'chat' ? '/' : `/${route}`)
  }

  routerContext = { currentRoute, navigate }

  return <>{children}</>
}
