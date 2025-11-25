import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Gear,
  Bell,
  Palette,
  Globe,
  Lightning,
  Sun,
  Moon,
  Monitor
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { useKV } from "@github/spark/hooks"
import { useTheme, type Theme } from "@/hooks/use-theme"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface UserPreferences {
  displayName: string
  language: string
  messageStyle: "compact" | "comfortable"
  soundEnabled: boolean
  notificationsEnabled: boolean
  autoScroll: boolean
  codeTheme: "light" | "dark"
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  
  const defaultPreferences: UserPreferences = {
    displayName: "Fernando Teixeira",
    language: "pt-BR",
    messageStyle: "comfortable",
    soundEnabled: true,
    notificationsEnabled: true,
    autoScroll: true,
    codeTheme: "light"
  }

  const [preferences, setPreferences] = useKV<UserPreferences>("user-preferences", defaultPreferences)
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences || defaultPreferences)
  const [localTheme, setLocalTheme] = useState<Theme>(theme || "system")
  const [userInfo, setUserInfo] = useState<{ login: string; avatarUrl: string; email: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      setLocalPrefs(preferences || defaultPreferences)
      setLocalTheme(theme || "system")
      
      window.spark.user().then(user => {
        setUserInfo(user)
      })
    }
  }, [isOpen, preferences, theme])

  const handleSave = () => {
    setPreferences(localPrefs)
    setTheme(localTheme)
    toast.success("Configurações salvas com sucesso!")
    onClose()
  }

  const handleCancel = () => {
    setLocalPrefs(preferences || defaultPreferences)
    setLocalTheme(theme || "system")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden border-2 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Gear size={24} weight="fill" className="text-accent-foreground" />
            </motion.div>
            <div>
              <DialogTitle className="text-2xl">Configurações</DialogTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Personalize sua experiência
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="profile" className="font-semibold">
              <User size={16} weight="bold" className="mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="preferences" className="font-semibold">
              <Palette size={16} weight="bold" className="mr-2" />
              Preferências
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-semibold">
              <Bell size={16} weight="bold" className="mr-2" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[50vh] overflow-y-auto pr-2">
            <TabsContent value="profile" className="space-y-6 mt-0">
              {userInfo && (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl border-2 border-accent/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-accent-foreground text-2xl font-bold shadow-lg">
                    {userInfo.avatarUrl ? (
                      <img src={userInfo.avatarUrl} alt={userInfo.login} className="w-full h-full rounded-full" />
                    ) : (
                      userInfo.login.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{userInfo.login}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{userInfo.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="font-semibold">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    value={localPrefs.displayName}
                    onChange={(e) => setLocalPrefs({ ...localPrefs, displayName: e.target.value })}
                    className="border-2 focus:border-accent"
                  />
                  <p className="text-xs text-muted-foreground">
                    Como você quer ser chamado no chat
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="language" className="font-semibold">Idioma</Label>
                  <Select 
                    value={localPrefs.language} 
                    onValueChange={(value) => setLocalPrefs({ ...localPrefs, language: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">
                        <div className="flex items-center gap-2">
                          <Globe size={16} weight="bold" />
                          Português (Brasil)
                        </div>
                      </SelectItem>
                      <SelectItem value="en-US">
                        <div className="flex items-center gap-2">
                          <Globe size={16} weight="bold" />
                          English (US)
                        </div>
                      </SelectItem>
                      <SelectItem value="es-ES">
                        <div className="flex items-center gap-2">
                          <Globe size={16} weight="bold" />
                          Español
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-0">
              <div className="space-y-2">
                <Label htmlFor="theme" className="font-semibold">Tema da Interface</Label>
                <Select 
                  value={localTheme} 
                  onValueChange={(value: Theme) => setLocalTheme(value)}
                >
                  <SelectTrigger className="border-2 focus:border-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun size={16} weight="bold" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon size={16} weight="bold" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor size={16} weight="bold" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha entre claro, escuro ou automático baseado no sistema
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="messageStyle" className="font-semibold">Estilo de Mensagem</Label>
                <Select 
                  value={localPrefs.messageStyle} 
                  onValueChange={(value: "compact" | "comfortable") => setLocalPrefs({ ...localPrefs, messageStyle: value })}
                >
                  <SelectTrigger className="border-2 focus:border-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compacto - Mais mensagens na tela</SelectItem>
                    <SelectItem value="comfortable">Confortável - Espaçamento amplo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="codeTheme" className="font-semibold">Tema de Código</Label>
                <Select 
                  value={localPrefs.codeTheme} 
                  onValueChange={(value: "light" | "dark") => setLocalPrefs({ ...localPrefs, codeTheme: value })}
                >
                  <SelectTrigger className="border-2 focus:border-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tema usado para destacar blocos de código
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="autoScroll" className="font-semibold">Rolagem Automática</Label>
                  <p className="text-xs text-muted-foreground">
                    Rolar automaticamente para novas mensagens
                  </p>
                </div>
                <Switch
                  id="autoScroll"
                  checked={localPrefs.autoScroll}
                  onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, autoScroll: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-0">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="font-semibold">Notificações</Label>
                  <p className="text-xs text-muted-foreground">
                    Receber notificações de novas mensagens
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={localPrefs.notificationsEnabled}
                  onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, notificationsEnabled: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="sound" className="font-semibold">Sons</Label>
                  <p className="text-xs text-muted-foreground">
                    Reproduzir sons para notificações
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={localPrefs.soundEnabled}
                  onCheckedChange={(checked) => setLocalPrefs({ ...localPrefs, soundEnabled: checked })}
                />
              </div>

              <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4 mt-4">
                <div className="flex gap-3">
                  <Lightning size={24} weight="fill" className="text-accent flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">Notificações Inteligentes</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Receba resumos de conversas importantes e alertas quando mencionado
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex gap-3 justify-end">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" onClick={handleCancel} className="border-2">
              Cancelar
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 shadow-md">
              Salvar Alterações
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
