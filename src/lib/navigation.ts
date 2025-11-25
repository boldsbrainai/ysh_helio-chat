export type RouteId = 'chat' | 'gallery' | 'codex' | 'gpts' | 'projects' | 'prompts' | 'settings'

export interface Route {
  id: RouteId
  path: string
  title: string
  icon: string
  description: string
}

export const routes: Route[] = [
  {
    id: 'chat',
    path: '/',
    title: 'Chat',
    icon: 'Chat',
    description: 'Conversas com IA'
  },
  {
    id: 'gallery',
    path: '/gallery',
    title: 'Galeria',
    icon: 'ImageSquare',
    description: 'Biblioteca de imagens e mídia'
  },
  {
    id: 'codex',
    path: '/codex',
    title: 'Codex',
    icon: 'Code',
    description: 'Documentação e exemplos de código'
  },
  {
    id: 'gpts',
    path: '/gpts',
    title: 'GPTs',
    icon: 'Compass',
    description: 'Explore modelos personalizados'
  },
  {
    id: 'projects',
    path: '/projects',
    title: 'Projetos',
    icon: 'FolderOpen',
    description: 'Organize seu trabalho'
  },
  {
    id: 'prompts',
    path: '/prompts',
    title: 'Biblioteca de Prompts',
    icon: 'Lightning',
    description: 'Templates de prompts organizados'
  }
]

export function getRouteById(id: RouteId): Route | undefined {
  return routes.find(route => route.id === id)
}

export function getCurrentRoute(path: string): Route | undefined {
  return routes.find(route => route.path === path)
}
