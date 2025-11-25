import { useState } from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bug, PaperPlaneRight, CheckCircle, List } from "@phosphor-icons/react"
import { toast } from "sonner"

interface BugReportPageProps {
  onToggleSidebar: () => void
}

interface BugReport {
  title: string
  description: string
  severity: string
  category: string
  steps: string
  email: string
}

export function BugReportPage({ onToggleSidebar }: BugReportPageProps) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<BugReport>({
    title: "",
    description: "",
    severity: "",
    category: "",
    steps: "",
    email: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.severity || !formData.category) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    toast.success("Relatório de bug enviado com sucesso!")
    setSubmitted(true)
    
    setTimeout(() => {
      setFormData({
        title: "",
        description: "",
        severity: "",
        category: "",
        steps: "",
        email: ""
      })
      setSubmitted(false)
    }, 3000)
  }

  const handleChange = (field: keyof BugReport, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto rounded-full bg-success/10 flex items-center justify-center"
          >
            <CheckCircle size={48} weight="fill" className="text-success" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground">Relatório Enviado!</h2>
          <p className="text-muted-foreground max-w-md">
            Obrigado por reportar este problema. Nossa equipe irá analisar e entrar em contato se necessário.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onToggleSidebar}
              className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <List size={22} weight="bold" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-md">
              <Bug size={22} weight="fill" className="text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Informar Bug</h1>
              <p className="text-sm text-muted-foreground">Ajude-nos a melhorar reportando problemas</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Relatar um Problema</CardTitle>
                <CardDescription>
                  Descreva o problema encontrado com o máximo de detalhes possível. 
                  Isso nos ajudará a reproduzir e corrigir o bug mais rapidamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">
                      Título do Bug <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ex: Erro ao salvar configurações"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="severity" className="text-sm font-semibold">
                        Severidade <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.severity} onValueChange={(value) => handleChange("severity", value)}>
                        <SelectTrigger id="severity" className="h-11">
                          <SelectValue placeholder="Selecione a severidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">🔴 Crítico - Sistema inoperante</SelectItem>
                          <SelectItem value="high">🟠 Alto - Funcionalidade importante quebrada</SelectItem>
                          <SelectItem value="medium">🟡 Médio - Problema que afeta usabilidade</SelectItem>
                          <SelectItem value="low">🟢 Baixo - Problema menor ou cosmético</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold">
                        Categoria <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                        <SelectTrigger id="category" className="h-11">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chat">💬 Chat e IA</SelectItem>
                          <SelectItem value="ui">🎨 Interface do Usuário</SelectItem>
                          <SelectItem value="equipment">📦 Equipamentos</SelectItem>
                          <SelectItem value="sizing">📏 Dimensionamento</SelectItem>
                          <SelectItem value="dashboard">📊 Dashboard</SelectItem>
                          <SelectItem value="auth">🔐 Autenticação</SelectItem>
                          <SelectItem value="performance">⚡ Performance</SelectItem>
                          <SelectItem value="other">🔧 Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">
                      Descrição do Problema <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o que aconteceu, o que você esperava que acontecesse, e qualquer informação adicional relevante..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      className="min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="steps" className="text-sm font-semibold">
                      Passos para Reproduzir
                    </Label>
                    <Textarea
                      id="steps"
                      placeholder="1. Vá para...&#10;2. Clique em...&#10;3. Role até...&#10;4. Veja o erro"
                      value={formData.steps}
                      onChange={(e) => handleChange("steps", e.target.value)}
                      className="min-h-[100px] resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Liste os passos que outra pessoa poderia seguir para ver o mesmo problema
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email para Contato
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Opcional - Caso precisemos de mais informações
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-destructive to-destructive/80 hover:opacity-90 text-destructive-foreground font-semibold"
                      >
                        <PaperPlaneRight size={20} weight="fill" className="mr-2" />
                        Enviar Relatório
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Dicas para um Bom Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <p className="text-foreground/80">
                    <span className="font-medium">Seja específico:</span> Quanto mais detalhes, melhor poderemos entender o problema
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <p className="text-foreground/80">
                    <span className="font-medium">Inclua capturas de tela:</span> Se possível, anexe imagens que mostrem o problema
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <p className="text-foreground/80">
                    <span className="font-medium">Contexto:</span> Mencione qual navegador está usando e em qual dispositivo
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent font-bold">✓</span>
                  <p className="text-foreground/80">
                    <span className="font-medium">Um bug por relatório:</span> Se encontrou múltiplos problemas, envie relatórios separados
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
