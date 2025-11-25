import { motion } from "framer-motion"
import { FolderOpen, Plus, Trash, Clock, Star, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import { ProjectDetailPage } from "./ProjectDetailPage"

interface ProjectsPageProps {
  onToggleSidebar: () => void
}

interface Project {
  id: string
  name: string
  description: string
  chatCount: number
  color: string
  isFavorite: boolean
  lastModified: number
  tags: string[]
}

const colorOptions = [
  { name: 'Azul', value: 'oklch(0.60 0.18 270)' },
  { name: 'Verde', value: 'oklch(0.65 0.20 145)' },
  { name: 'Vermelho', value: 'oklch(0.60 0.22 25)' },
  { name: 'Amarelo', value: 'oklch(0.75 0.18 85)' },
  { name: 'Roxo', value: 'oklch(0.60 0.20 300)' },
  { name: 'Rosa', value: 'oklch(0.65 0.20 350)' }
]

export function ProjectsPage({ onToggleSidebar }: ProjectsPageProps) {
  const [projects, setProjects] = useKV<Project[]>("projects", [
    {
      id: '1',
      name: 'Residencial São Paulo - 8.8kWp',
      description: 'Sistema fotovoltaico residencial com 20 módulos de 440W e inversor string',
      chatCount: 8,
      color: colorOptions[0].value,
      isFavorite: true,
      lastModified: Date.now() - 1000 * 60 * 30,
      tags: ['residencial', 'string', 'telhado']
    },
    {
      id: '2',
      name: 'Supermercado ABC - 75kWp',
      description: 'Instalação comercial de grande porte com microinversores e monitoramento',
      chatCount: 15,
      color: colorOptions[1].value,
      isFavorite: true,
      lastModified: Date.now() - 1000 * 60 * 60 * 2,
      tags: ['comercial', 'microinversor', 'monitoramento']
    },
    {
      id: '3',
      name: 'EMUC - Condomínio Solar Verde',
      description: 'Empreendimento de múltiplas unidades consumidoras com 120kWp',
      chatCount: 22,
      color: colorOptions[4].value,
      isFavorite: true,
      lastModified: Date.now() - 1000 * 60 * 60 * 5,
      tags: ['emuc', 'condomínio', 'geração-compartilhada']
    },
    {
      id: '4',
      name: 'Fazenda Boa Vista - 50kWp',
      description: 'Sistema rural para bombeamento solar e eletrificação agrícola',
      chatCount: 12,
      color: colorOptions[2].value,
      isFavorite: false,
      lastModified: Date.now() - 1000 * 60 * 60 * 8,
      tags: ['rural', 'bombeamento', 'agro']
    },
    {
      id: '5',
      name: 'Otimização Indústria XYZ',
      description: 'Retrofit e otimização de sistema existente com adição de 30kWp',
      chatCount: 9,
      color: colorOptions[3].value,
      isFavorite: false,
      lastModified: Date.now() - 1000 * 60 * 60 * 12,
      tags: ['otimização', 'retrofit', 'industrial']
    },
    {
      id: '6',
      name: 'Expansão + Battery - Residência Premium',
      description: 'Expansão de 5kWp + sistema de armazenamento 10kWh e carregador EV 7kW',
      chatCount: 18,
      color: colorOptions[5].value,
      isFavorite: true,
      lastModified: Date.now() - 1000 * 60 * 60 * 16,
      tags: ['expansão', 'bateria', 'carregador-ev']
    },
    {
      id: '7',
      name: 'Híbrido Off-Grid - Sítio Ecológico',
      description: 'Sistema híbrido 15kWp com banco de baterias 30kWh para autonomia total',
      chatCount: 14,
      color: colorOptions[1].value,
      isFavorite: false,
      lastModified: Date.now() - 1000 * 60 * 60 * 24,
      tags: ['híbrido', 'off-grid', 'bateria']
    },
    {
      id: '8',
      name: 'Comercial + EV - Concessionária',
      description: 'Sistema 100kWp com 4 carregadores EV trifásicos 22kW',
      chatCount: 16,
      color: colorOptions[0].value,
      isFavorite: false,
      lastModified: Date.now() - 1000 * 60 * 60 * 36,
      tags: ['comercial', 'carregador-ev', 'trifásico']
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const handleToggleFavorite = (projectId: string) => {
    setProjects((current) =>
      (current || []).map(p =>
        p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    )
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects((current) => (current || []).filter(p => p.id !== projectId))
    toast.success("Projeto excluído")
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Digite um nome para o projeto")
      return
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: "Novo projeto",
      chatCount: 0,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)].value,
      isFavorite: false,
      lastModified: Date.now(),
      tags: []
    }

    setProjects((current) => [newProject, ...(current || [])])
    setNewProjectName("")
    setShowCreateForm(false)
    toast.success("Projeto criado!")
  }

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `há ${minutes} min`
    if (hours < 24) return `há ${hours}h`
    return `há ${days}d`
  }

  const sortedProjects = [...(projects || [])].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return b.lastModified - a.lastModified
  })

  if (selectedProjectId) {
    return (
      <ProjectDetailPage
        projectId={selectedProjectId}
        onToggleSidebar={onToggleSidebar}
        onBack={() => setSelectedProjectId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <List size={22} weight="bold" />
              </button>
              <motion.div 
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.08, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <FolderOpen className="text-accent-foreground" size={24} weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">Catálogo de Projetos Solares</h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {(projects || []).length} projetos • Residenciais, Comerciais, EMUC, Rurais, Expansões
                </p>
              </div>
            </div>
            <Button 
              variant="gradient" 
              size="lg" 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={20} weight="bold" />
              Novo Projeto
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="p-6 border-2 border-accent/40">
                <h3 className="font-bold mb-4">Criar Novo Projeto</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nome do projeto..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-input bg-background focus:border-accent focus:outline-none"
                    autoFocus
                  />
                  <Button onClick={handleCreateProject}>
                    Criar
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {sortedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card 
                  className="p-5 border-2 hover:border-accent/40 hover:shadow-xl transition-all h-full flex flex-col group cursor-pointer relative overflow-hidden"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ backgroundColor: project.color }}
                  />
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(project.id)
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg hover:bg-accent/10 flex items-center justify-center transition-colors"
                      >
                        <Star
                          size={18}
                          weight={project.isFavorite ? "fill" : "regular"}
                          className={project.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
                        />
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
                      >
                        <Trash size={18} weight="bold" className="text-muted-foreground hover:text-destructive" />
                      </motion.button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold mb-2 group-hover:text-accent transition-colors relative z-10 line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1 relative z-10 line-clamp-2">
                    {project.description}
                  </p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-4 relative z-10">
                      {project.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground relative z-10">
                    <div className="flex items-center gap-1">
                      <Clock size={14} weight="bold" />
                      <span>{formatDate(project.lastModified)}</span>
                    </div>
                    <div className="font-semibold">
                      {project.chatCount} {project.chatCount === 1 ? 'chat' : 'chats'}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {(projects || []).length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderOpen size={40} className="text-muted-foreground" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum projeto ainda</h3>
              <p className="text-muted-foreground mb-6">
                Organize suas conversas criando projetos temáticos
              </p>
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus size={20} weight="bold" />
                Criar Primeiro Projeto
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
