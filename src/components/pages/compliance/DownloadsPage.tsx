import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DownloadSimple, DeviceMobile, Desktop, AppWindow, List } from "@phosphor-icons/react"

interface DownloadsPageProps {
  onToggleSidebar: () => void
}

interface AppDownload {
  platform: string
  icon: React.ReactNode
  version: string
  size: string
  requirements: string
  downloadUrl: string
  status: "available" | "coming-soon"
}

const downloads: AppDownload[] = [
  {
    platform: "Web App",
    icon: <AppWindow size={32} weight="duotone" />,
    version: "2.1.0",
    size: "Uso online",
    requirements: "Navegadores modernos (Chrome, Firefox, Safari, Edge)",
    downloadUrl: "https://solar.yello.com.br",
    status: "available"
  },
  {
    platform: "Desktop (Windows)",
    icon: <Desktop size={32} weight="duotone" />,
    version: "2.1.0",
    size: "85 MB",
    requirements: "Windows 10 ou superior (64-bit)",
    downloadUrl: "#",
    status: "coming-soon"
  },
  {
    platform: "Desktop (macOS)",
    icon: <Desktop size={32} weight="duotone" />,
    version: "2.1.0",
    size: "92 MB",
    requirements: "macOS 11 Big Sur ou superior",
    downloadUrl: "#",
    status: "coming-soon"
  },
  {
    platform: "Desktop (Linux)",
    icon: <Desktop size={32} weight="duotone" />,
    version: "2.1.0",
    size: "88 MB",
    requirements: "Ubuntu 20.04+, Fedora 34+, ou equivalente",
    downloadUrl: "#",
    status: "coming-soon"
  },
  {
    platform: "Mobile (iOS)",
    icon: <DeviceMobile size={32} weight="duotone" />,
    version: "2.1.0",
    size: "45 MB",
    requirements: "iOS 15.0 ou superior",
    downloadUrl: "#",
    status: "coming-soon"
  },
  {
    platform: "Mobile (Android)",
    icon: <DeviceMobile size={32} weight="duotone" />,
    version: "2.1.0",
    size: "42 MB",
    requirements: "Android 8.0 ou superior",
    downloadUrl: "#",
    status: "coming-soon"
  }
]

export function DownloadsPage({ onToggleSidebar }: DownloadsPageProps) {
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
              <DownloadSimple size={22} weight="fill" className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Baixar Aplicativos</h1>
              <p className="text-sm text-muted-foreground">Acesse o Yello Solar Hub em todas as plataformas</p>
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
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                    <AppWindow size={24} weight="fill" className="text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Web App Disponível Agora</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Acesse o Yello Solar Hub diretamente no seu navegador, sem necessidade de instalação. 
                      Funciona em qualquer dispositivo com conexão à internet.
                    </p>
                    <Button
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => window.open("https://solar.yello.com.br", "_blank")}
                    >
                      <AppWindow size={18} weight="bold" className="mr-2" />
                      Acessar Web App
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Aplicativos Nativos</h2>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá baixar versões nativas para desktop e mobile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {downloads.slice(1).map((download, index) => (
              <motion.div
                key={download.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={download.status === "available" ? "border-2 border-accent/30" : "opacity-60"}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        {download.icon}
                      </div>
                      {download.status === "coming-soon" && (
                        <Badge variant="secondary" className="text-xs">
                          Em breve
                        </Badge>
                      )}
                      {download.status === "available" && (
                        <Badge className="bg-success text-white text-xs">
                          Disponível
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{download.platform}</CardTitle>
                    <CardDescription className="text-xs">
                      Versão {download.version} • {download.size}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Requisitos:</p>
                      <p className="text-sm text-foreground/80">{download.requirements}</p>
                    </div>

                    <Separator />

                    {download.status === "available" ? (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={() => window.open(download.downloadUrl, "_blank")}
                        >
                          <DownloadSimple size={18} weight="bold" className="mr-2" />
                          Download
                        </Button>
                      </motion.div>
                    ) : (
                      <Button className="w-full" variant="secondary" disabled>
                        <DownloadSimple size={18} weight="bold" className="mr-2" />
                        Em breve
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Perguntas Frequentes sobre Downloads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Qual versão devo usar?</h4>
                  <p className="text-muted-foreground">
                    Recomendamos o Web App para acesso rápido e sem instalação. As versões desktop oferecem 
                    melhor performance e integração com o sistema operacional quando disponíveis.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-1">Quando os apps nativos estarão disponíveis?</h4>
                  <p className="text-muted-foreground">
                    Estamos trabalhando nas versões desktop e mobile. Inscreva-se na nossa newsletter para 
                    ser notificado quando forem lançadas.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-1">O Web App funciona offline?</h4>
                  <p className="text-muted-foreground">
                    Atualmente, o Web App requer conexão à internet. As versões nativas terão suporte offline 
                    para funcionalidades essenciais.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-1">Como faço para atualizar o aplicativo?</h4>
                  <p className="text-muted-foreground">
                    O Web App é atualizado automaticamente. As versões desktop notificarão quando houver 
                    atualizações disponíveis e permitirão instalação com um clique.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-1">Meus dados sincronizam entre dispositivos?</h4>
                  <p className="text-muted-foreground">
                    Sim! Quando você faz login, seus dados são sincronizados automaticamente entre todos 
                    os dispositivos onde você usa o Yello Solar Hub.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  )
}
