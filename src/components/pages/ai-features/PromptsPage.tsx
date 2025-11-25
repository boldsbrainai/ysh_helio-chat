import { motion } from "framer-motion"
import { Lightning, Code, Pen, ChartBar, Translate, ChatCircle, GraduationCap, Sparkle, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState, ReactNode } from "react"
import { toast } from "sonner"

interface PromptsPageProps {
  onToggleSidebar: () => void
}

interface Prompt {
  id: string
  title: string
  description: string
  template: string
  category: string
  icon: ReactNode
  tags: string[]
}

const prompts: Prompt[] = [
  {
    id: '1',
    title: 'Revisar Código',
    description: 'Análise detalhada de código com sugestões de melhoria',
    template: 'Analise o seguinte código e forneça sugestões de melhoria considerando performance, legibilidade e boas práticas:\n\n[Cole seu código aqui]',
    category: 'Desenvolvimento',
    icon: <Code size={24} weight="duotone" />,
    tags: ['código', 'revisão', 'qualidade']
  },
  {
    id: '2',
    title: 'Debugging Assistido',
    description: 'Identifique bugs e sugira soluções',
    template: 'Estou tendo o seguinte erro:\n\n[Descreva o erro]\n\nCódigo relacionado:\n[Cole o código]\n\nPor favor, ajude-me a identificar a causa e sugerir uma solução.',
    category: 'Desenvolvimento',
    icon: <Code size={24} weight="duotone" />,
    tags: ['debug', 'erro', 'solução']
  },
  {
    id: '3',
    title: 'Escrever Artigo',
    description: 'Crie conteúdo envolvente para blog ou artigos',
    template: 'Escreva um artigo de blog sobre [TÓPICO] que:\n- Tenha aproximadamente [X] palavras\n- Inclua exemplos práticos\n- Tenha um tom [profissional/casual/técnico]\n- Seja otimizado para SEO',
    category: 'Criatividade',
    icon: <Pen size={24} weight="duotone" />,
    tags: ['escrita', 'blog', 'conteúdo']
  },
  {
    id: '4',
    title: 'Copywriting',
    description: 'Textos persuasivos para marketing',
    template: 'Crie um copy persuasivo para [PRODUTO/SERVIÇO] que:\n- Destaque os principais benefícios\n- Inclua um CTA forte\n- Use gatilhos mentais\n- Tom: [especifique o tom]',
    category: 'Criatividade',
    icon: <Pen size={24} weight="duotone" />,
    tags: ['copy', 'marketing', 'persuasão']
  },
  {
    id: '5',
    title: 'Análise de Dados',
    description: 'Interprete dados e gere insights',
    template: 'Analise os seguintes dados e forneça insights acionáveis:\n\n[Cole seus dados ou descreva o contexto]\n\nFoco em:\n- Tendências principais\n- Anomalias\n- Recomendações práticas',
    category: 'Dados',
    icon: <ChartBar size={24} weight="duotone" />,
    tags: ['dados', 'análise', 'insights']
  },
  {
    id: '6',
    title: 'Criar Visualizações',
    description: 'Sugestões de gráficos e dashboards',
    template: 'Tenho os seguintes dados: [DESCREVA OS DADOS]\n\nSugira as melhores visualizações para:\n- Comunicar tendências\n- Comparar categorias\n- Destacar insights-chave',
    category: 'Dados',
    icon: <ChartBar size={24} weight="duotone" />,
    tags: ['visualização', 'gráficos', 'dashboard']
  },
  {
    id: '7',
    title: 'Traduzir com Contexto',
    description: 'Traduções mantendo nuances culturais',
    template: 'Traduza o seguinte texto de [IDIOMA ORIGEM] para [IDIOMA DESTINO], mantendo:\n- Nuances culturais\n- Tom e estilo\n- Idiomatismos apropriados\n\nTexto:\n[COLE O TEXTO]',
    category: 'Linguagem',
    icon: <Translate size={24} weight="duotone" />,
    tags: ['tradução', 'idiomas', 'localização']
  },
  {
    id: '8',
    title: 'Email Profissional',
    description: 'Redigir emails corporativos eficazes',
    template: 'Escreva um email profissional para [DESTINATÁRIO] sobre [ASSUNTO].\n\nContexto: [FORNEÇA CONTEXTO]\n\nTom desejado: [formal/cordial/direto]\nObjetivo: [qual ação você espera]',
    category: 'Comunicação',
    icon: <ChatCircle size={24} weight="duotone" />,
    tags: ['email', 'comunicação', 'profissional']
  },
  {
    id: '9',
    title: 'Explicar Conceito',
    description: 'Explicações claras de tópicos complexos',
    template: 'Explique [CONCEITO/TÓPICO] de forma clara e acessível:\n\n- Use analogias quando apropriado\n- Inclua exemplos práticos\n- Comece do básico\n- Nível: [iniciante/intermediário/avançado]',
    category: 'Educação',
    icon: <GraduationCap size={24} weight="duotone" />,
    tags: ['educação', 'explicação', 'aprendizado']
  },
  {
    id: '10',
    title: 'Plano de Estudos',
    description: 'Crie roteiro personalizado de aprendizado',
    template: 'Crie um plano de estudos para aprender [TÓPICO/HABILIDADE]:\n\nMeu nível atual: [iniciante/intermediário/avançado]\nTempo disponível: [X horas por semana]\nObjetivo: [qual resultado deseja alcançar]\nPrazo: [quanto tempo tem]',
    category: 'Educação',
    icon: <GraduationCap size={24} weight="duotone" />,
    tags: ['estudos', 'aprendizado', 'planejamento']
  }
]

const categories = Array.from(new Set(prompts.map(p => p.category)))

export function PromptsPage({ onToggleSidebar }: PromptsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUsePrompt = (template: string) => {
    navigator.clipboard.writeText(template)
    toast.success("Prompt copiado para a área de transferência!")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
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
              <Lightning className="text-accent-foreground" size={24} weight="fill" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">Biblioteca de Prompts</h1>
              <p className="text-xs text-muted-foreground font-medium">
                {filteredPrompts.length} templates para você começar rápido
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar prompts por título, descrição ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/60 backdrop-blur-sm border-2"
              />
            </div>
            <Button variant="gradient" size="lg" className="gap-2">
              <Sparkle size={20} weight="fill" />
              Criar Meu Prompt
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 border-2 hover:border-accent/40 hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                      {prompt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold">{prompt.title}</h3>
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {prompt.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {prompt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 bg-muted/50 rounded-lg p-4 mb-4 border border-border/50">
                    <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                      {prompt.template}
                    </pre>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-4">
                    {prompt.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleUsePrompt(prompt.template)}
                      variant="gradient"
                      className="w-full"
                      size="lg"
                    >
                      Usar este Prompt
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Lightning size={40} className="text-muted-foreground" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum prompt encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou limpar os filtros
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
