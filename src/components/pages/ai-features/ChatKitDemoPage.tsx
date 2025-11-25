/**
 * ChatKit Demo Page
 * 
 * Demonstration page showcasing the enhanced ChatKit integration
 * with session management, authentication, and widget actions
 */

import { List } from "@phosphor-icons/react"
import { ChatKitProvider } from "@/components/ChatKitProvider"
import { ChatKitIntegration } from "@/components/ChatKitIntegration"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface ChatKitDemoPageProps {
  onToggleSidebar: () => void
}

export function ChatKitDemoPage({ onToggleSidebar }: ChatKitDemoPageProps) {
  const handleSessionExpired = () => {
    toast.warning("Sessão expirada", {
      description: "Criando nova sessão automaticamente...",
    })
  }

  const handleSessionRefreshed = () => {
    toast.success("Sessão renovada", {
      description: "Sua sessão foi renovada com sucesso",
    })
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors"
          >
            <List size={22} weight="bold" />
          </button>
          <div>
            <h1 className="text-xl font-bold">ChatKit Integration</h1>
            <p className="text-sm text-muted-foreground">
              Enhanced AI Chat with Session Management
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Introduction Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OpenAI ChatKit Integration</CardTitle>
                    <CardDescription className="mt-2">
                      Experiência de chat conversacional com IA alimentada pela plataforma
                      OpenAI ChatKit, incluindo gerenciamento avançado de sessões,
                      autenticação, e recuperação automática de erros.
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="h-fit">
                    Enhanced
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      🔐 Autenticação Segura
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Gerenciamento automático de tokens com renovação inteligente e
                      validação periódica
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      🔄 Recuperação Automática
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Sistema de retry com fallback para criação de nova sessão em caso
                      de falha
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      💾 Persistência
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Sessões salvas localmente com validação de expiração e
                      restauração automática
                    </p>
                  </div>
                </div>
                <Separator />
                <Alert>
                  <AlertTitle className="text-sm">Recursos Implementados</AlertTitle>
                  <AlertDescription className="text-xs space-y-1 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>✓ Session caching com localStorage</div>
                      <div>✓ Automatic token refresh (50 min interval)</div>
                      <div>✓ Session validation (5 min interval)</div>
                      <div>✓ Device fingerprinting</div>
                      <div>✓ Error recovery com retry logic</div>
                      <div>✓ GitHub user integration</div>
                      <div>✓ Widget action handling</div>
                      <div>✓ Custom theme support</div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          {/* ChatKit Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Chat ao Vivo</CardTitle>
                <CardDescription>
                  Converse com o Hélio, seu co-piloto de engenharia solar fotovoltaica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatKitProvider
                  autoRefresh={true}
                  validateOnMount={true}
                  onSessionExpired={handleSessionExpired}
                  onSessionRefreshed={handleSessionRefreshed}
                >
                  <ChatKitIntegration
                    className="w-full"
                    height="600px"
                    showDebugInfo={true}
                  />
                </ChatKitProvider>
              </CardContent>
            </Card>
          </motion.div>

          {/* Technical Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Detalhes Técnicos</CardTitle>
                <CardDescription>Arquitetura e implementação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Componentes Principais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-muted/50 p-3 rounded-lg">
                      <div>ChatKitProvider.tsx</div>
                      <div>ChatKitIntegration.tsx</div>
                      <div>use-chatkit-session.ts</div>
                      <div>chatkit.ts (lib/openai)</div>
                      <div>chatkit-endpoints.ts</div>
                      <div>config.ts (OpenAI)</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Fluxo de Autenticação</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          1
                        </Badge>
                        <p className="text-muted-foreground flex-1">
                          ChatKitProvider inicializa useChatKitSession hook
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          2
                        </Badge>
                        <p className="text-muted-foreground flex-1">
                          Hook verifica localStorage para sessão em cache
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          3
                        </Badge>
                        <p className="text-muted-foreground flex-1">
                          Se inválida ou inexistente, cria nova via OpenAI API
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          4
                        </Badge>
                        <p className="text-muted-foreground flex-1">
                          Integra dados do usuário GitHub (spark.user())
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          5
                        </Badge>
                        <p className="text-muted-foreground flex-1">
                          Agenda refresh automático (50 min) e validação (5 min)
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          6
                        </Badge>
                        <p className="text-muted-foreground flex-1">
                          ChatKit component recebe getClientSecret callback
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-sm mb-2">
                      Variáveis de Ambiente Necessárias
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <code className="text-xs font-mono block space-y-1">
                        <div>VITE_OPENAI_API_KEY=sk-proj-...</div>
                        <div>VITE_OPENAI_CHATKIT_ENABLED=true</div>
                        <div>VITE_OPENAI_WORKFLOW_ID=wf_...</div>
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
