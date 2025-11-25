import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { List, Sparkle, Plus, Wrench, Bug } from "@phosphor-icons/react"

interface ReleaseNotesPageProps {
  onToggleSidebar: () => void
}

interface ReleaseNote {
  version: string
  date: string
  type: "major" | "minor" | "patch"
  features: string[]
  improvements: string[]
  fixes: string[]
}

const releaseNotes: ReleaseNote[] = [
  {
    version: "2.1.0",
    date: "2023-12-01",
    type: "minor",
    features: [
      "Novo agendamento de instalações",
      "Análise de crédito multi-bancos",
      "Biblioteca de prompts predefinidos"
    ],
    improvements: [
      "Performance melhorada no carregamento de mapas",
      "Sistema de temas claro/escuro",
      "Otimização de bundle para carregamento mais rápido"
    ],
    fixes: [
      "Correção de bugs visuais no tema escuro",
      "Ajustes de acessibilidade em formulários"
    ]
  },
  {
    version: "2.0.1",
    date: "2023-11-10",
    type: "patch",
    features: [],
    improvements: [
      "Melhorias de UX na página de equipamentos"
    ],
    fixes: [
      "Correção de erro ao editar mensagens",
      "Correção de memory leak em componentes"
    ]
  }
]

const getTypeColor = (type: ReleaseNote["type"]) => {
  switch (type) {
    case "major":
      return "bg-destructive text-destructive-foreground"
    case "minor":
      return "bg-accent text-accent-foreground"
    case "patch":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getTypeLabel = (type: ReleaseNote["type"]) => {
  switch (type) {
    case "major":
      return "Major"
    case "minor":
      return "Minor"
    case "patch":
      return "Patch"
    default:
      return "Release"
  }
}

export function ReleaseNotesPage({ onToggleSidebar }: ReleaseNotesPageProps) {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <List size={22} weight="bold" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-md">
              <Sparkle size={22} weight="bold" className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Notas de Versão</h1>
              <p className="text-sm text-muted-foreground">Histórico de atualizações</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {releaseNotes.map((note, index) => (
              <motion.div
                key={note.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  collapsible 
                  defaultCollapsed={index > 0}
                  className="overflow-hidden border-2 hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="bg-gradient-to-r from-card to-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl font-bold">v{note.version}</CardTitle>
                        <Badge className={getTypeColor(note.type)}>
                          {getTypeLabel(note.type)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm font-medium">
                        {new Date(note.date).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {note.features.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Plus size={18} weight="bold" className="text-accent" />
                            </div>
                            <h3 className="font-semibold text-foreground">Novos Recursos</h3>
                          </div>
                          <ul className="space-y-2 ml-10">
                            {note.features.map((feature, i) => (
                              <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                <span className="text-accent mt-1">•</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {note.improvements.length > 0 && (
                        <>
                          {note.features.length > 0 && <Separator />}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                                <Wrench size={18} weight="bold" className="text-info" />
                              </div>
                              <h3 className="font-semibold text-foreground">Melhorias</h3>
                            </div>
                            <ul className="space-y-2 ml-10">
                              {note.improvements.map((improvement, i) => (
                                <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                  <span className="text-info mt-1">•</span>
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {note.fixes.length > 0 && (
                        <>
                          {(note.features.length > 0 || note.improvements.length > 0) && <Separator />}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                <Bug size={18} weight="bold" className="text-success" />
                              </div>
                              <h3 className="font-semibold text-foreground">Correções</h3>
                            </div>
                            <ul className="space-y-2 ml-10">
                              {note.fixes.map((fix, i) => (
                                <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                  <span className="text-success mt-1">•</span>
                                  <span>{fix}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
