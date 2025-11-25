import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Keyboard, Command, MagnifyingGlass, ArrowsOutCardinal, List } from "@phosphor-icons/react"

interface KeyboardShortcutsPageProps {
  onToggleSidebar: () => void
}

interface KeyboardShortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: KeyboardShortcut[] = [
  {
    keys: ["⌘", "K"],
    description: "Abrir busca rápida",
    category: "Navegação"
  },
  {
    keys: ["⌘", "N"],
    description: "Novo chat",
    category: "Navegação"
  },
  {
    keys: ["⌘", "B"],
    description: "Abrir/Fechar sidebar",
    category: "Navegação"
  },
  {
    keys: ["⌘", "/"],
    description: "Mostrar atalhos de teclado",
    category: "Navegação"
  },
  {
    keys: ["Enter"],
    description: "Enviar mensagem",
    category: "Chat"
  },
  {
    keys: ["Shift", "Enter"],
    description: "Nova linha (no chat)",
    category: "Chat"
  },
  {
    keys: ["⌘", "E"],
    description: "Editar última mensagem",
    category: "Chat"
  },
  {
    keys: ["⌘", "R"],
    description: "Regenerar resposta",
    category: "Chat"
  },
  {
    keys: ["Esc"],
    description: "Fechar diálogo/modal",
    category: "Geral"
  },
  {
    keys: ["⌘", ","],
    description: "Abrir configurações",
    category: "Geral"
  },
  {
    keys: ["⌘", "S"],
    description: "Salvar configurações",
    category: "Geral"
  },
  {
    keys: ["⌘", "P"],
    description: "Abrir biblioteca de prompts",
    category: "Ferramentas"
  },
  {
    keys: ["⌘", "D"],
    description: "Ir para Dashboard",
    category: "Navegação"
  },
  {
    keys: ["⌘", "1"],
    description: "Ir para Equipamentos",
    category: "Navegação"
  },
  {
    keys: ["⌘", "2"],
    description: "Ir para Dimensionamento",
    category: "Navegação"
  },
  {
    keys: ["⌘", "3"],
    description: "Ir para Homologação",
    category: "Navegação"
  },
  {
    keys: ["⌘", "4"],
    description: "Ir para Análise de Crédito",
    category: "Navegação"
  },
  {
    keys: ["↑"],
    description: "Navegar para mensagem anterior",
    category: "Chat"
  },
  {
    keys: ["↓"],
    description: "Navegar para próxima mensagem",
    category: "Chat"
  },
  {
    keys: ["⌘", "F"],
    description: "Buscar na página atual",
    category: "Geral"
  }
]

const categories = ["Navegação", "Chat", "Geral", "Ferramentas"]

const KeyBadge = ({ keyLabel }: { keyLabel: string }) => {
  return (
    <Badge 
      variant="secondary" 
      className="px-2 py-1 text-xs font-mono font-bold bg-muted border border-border shadow-sm"
    >
      {keyLabel}
    </Badge>
  )
}

export function KeyboardShortcutsPage({ onToggleSidebar }: KeyboardShortcutsPageProps) {
  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onToggleSidebar}
              className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <List size={22} weight="bold" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
              <Keyboard size={22} weight="fill" className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Atalhos de Teclado</h1>
              <p className="text-sm text-muted-foreground">Navegue mais rápido com atalhos do teclado</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                    <Command size={24} weight="bold" className="text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Dica Rápida</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      No Windows/Linux, use <KeyBadge keyLabel="Ctrl" /> no lugar de <KeyBadge keyLabel="⌘" /> (Command)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pressione <KeyBadge keyLabel="⌘" /> + <KeyBadge keyLabel="/" /> a qualquer momento para ver esta página
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            {categories.map((category, categoryIndex) => {
              const categoryShortcuts = shortcuts.filter(s => s.category === category)
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                          {category === "Navegação" && <ArrowsOutCardinal size={18} weight="bold" className="text-accent" />}
                          {category === "Chat" && <span className="text-accent">💬</span>}
                          {category === "Geral" && <span className="text-accent">⚙️</span>}
                          {category === "Ferramentas" && <span className="text-accent">🛠️</span>}
                        </div>
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryShortcuts.map((shortcut, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-between py-3">
                              <span className="text-sm text-foreground/90">{shortcut.description}</span>
                              <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, keyIndex) => (
                                  <div key={keyIndex} className="flex items-center gap-1">
                                    <KeyBadge keyLabel={key} />
                                    {keyIndex < shortcut.keys.length - 1 && (
                                      <span className="text-muted-foreground text-xs mx-1">+</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {index < categoryShortcuts.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Personalizando Atalhos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-foreground/80">
                  No momento, os atalhos de teclado não podem ser personalizados. Estamos trabalhando para 
                  adicionar essa funcionalidade em uma versão futura.
                </p>
                <Separator />
                <p className="text-foreground/80">
                  Se você tiver sugestões de novos atalhos ou encontrar conflitos com outros aplicativos, 
                  por favor nos informe através da página "Informar Bug".
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dicas de Produtividade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold text-lg">💡</span>
                  <div>
                    <p className="font-medium mb-1">Use a busca rápida</p>
                    <p className="text-muted-foreground">
                      <KeyBadge keyLabel="⌘" /> + <KeyBadge keyLabel="K" /> abre a busca que permite encontrar 
                      conversas antigas, equipamentos e navegar rapidamente
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold text-lg">⚡</span>
                  <div>
                    <p className="font-medium mb-1">Edite e regenere respostas</p>
                    <p className="text-muted-foreground">
                      Use <KeyBadge keyLabel="⌘" /> + <KeyBadge keyLabel="E" /> para editar sua última mensagem e 
                      <KeyBadge keyLabel="⌘" /> + <KeyBadge keyLabel="R" /> para regenerar a resposta da IA
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold text-lg">🎯</span>
                  <div>
                    <p className="font-medium mb-1">Navegação numérica</p>
                    <p className="text-muted-foreground">
                      Use <KeyBadge keyLabel="⌘" /> + <KeyBadge keyLabel="1-4" /> para pular rapidamente entre as 
                      principais seções do aplicativo
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold text-lg">📝</span>
                  <div>
                    <p className="font-medium mb-1">Multilinhas no chat</p>
                    <p className="text-muted-foreground">
                      Use <KeyBadge keyLabel="Shift" /> + <KeyBadge keyLabel="Enter" /> para criar quebras de linha 
                      em suas mensagens sem enviar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  )
}
