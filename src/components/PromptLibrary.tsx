import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { 
  Lightning, 
  MagnifyingGlass, 
  Sparkle, 
  Code, 
  PencilLine,
  BookOpen,
  ChartBar,
  X,
} from "@phosphor-icons/react"

interface Prompt {
  id: string
  title: string
  description: string
  template: string
  category: string
  icon: React.ReactNode
}

interface PromptLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelectPrompt: (prompt: string) => void
}

const prompts: Prompt[] = [
  {
    id: "1",
    title: "Criar Kit Solar Residencial",
    description: "Monte um bundle de equipamentos para residência",
    template: "Crie um kit solar residencial completo (bundle) com:\n- Potência desejada: [X kWp]\n- Tipo de estrutura: [telhado cerâmico/metálico/solo]\n- Localização: [cidade/estado]\n\nInclua painéis, inversor, estruturas, proteções e cabeamento conforme NBR 16690.",
    category: "Dimensionamento",
    icon: <Lightning size={20} weight="bold" />
  },
  {
    id: "2",
    title: "Análise de Viabilidade Solar",
    description: "Avalie viabilidade técnica e econômica",
    template: "Analise a viabilidade de instalação solar para:\n- Consumo médio mensal: [X kWh]\n- Tarifa de energia: [R$/kWh]\n- Área disponível: [X m²]\n- Tipo de telhado: [descrição]\n\nForneça payback, ROI e recomendações de potência.",
    category: "Análise",
    icon: <ChartBar size={20} weight="bold" />
  },
  {
    id: "3",
    title: "Seleção de Equipamentos",
    description: "Recomende módulos e inversores certificados",
    template: "Recomende equipamentos certificados pelo INMETRO para um projeto de [X kWp]:\n- Tipo de instalação: [residencial/comercial/industrial]\n- Orçamento: [faixa de preço]\n- Prioridade: [custo/eficiência/garantia]\n\nCompare pelo menos 3 opções de fabricantes diferentes.",
    category: "Equipamentos",
    icon: <Sparkle size={20} weight="bold" />
  },
  {
    id: "4",
    title: "Cálculo de Irradiação Solar",
    description: "Consulte dados de satélite (CAMS/NASA)",
    template: "Consulte a irradiação solar para:\n- Localização: [latitude, longitude] ou [cidade, estado]\n- Inclinação dos módulos: [ângulo em graus]\n- Orientação: [norte/sul/leste/oeste]\n\nForneça HSP médio anual e geração estimada para [X kWp].",
    category: "Análise",
    icon: <BookOpen size={20} weight="bold" />
  },
  {
    id: "5",
    title: "Simulação de Financiamento",
    description: "Compare opções de crédito solar",
    template: "Simule financiamento solar para um projeto de R$ [valor]:\n- Prazo desejado: [X meses]\n- Entrada disponível: [R$ X ou %]\n- Região: [estado]\n\nCompare FNE Sol, Caixa, Banco do Brasil e bancos privados.",
    category: "Financeiro",
    icon: <ChartBar size={20} weight="bold" />
  },
  {
    id: "6",
    title: "Memorial Descritivo NBR 16690",
    description: "Gere memorial técnico para homologação",
    template: "Gere memorial descritivo técnico conforme NBR 16690 para:\n- Potência: [X kWp]\n- Concessionária: [nome]\n- Tipo de sistema: [on-grid/off-grid/híbrido]\n- Equipamentos: [lista de SKUs ou modelos]\n\nInclua diagramas unifilares, cálculos de proteção e seção de cabos.",
    category: "Documentação",
    icon: <PencilLine size={20} weight="bold" />
  },
  {
    id: "7",
    title: "Análise de Sombreamento",
    description: "Avalie perdas por obstruções",
    template: "Analise o impacto de sombreamento para:\n- Localização: [endereço ou coordenadas]\n- Obstruções próximas: [descrição de prédios, árvores, etc.]\n- Período crítico: [inverno/verão/ano todo]\n\nEstime perdas percentuais e recomende layout otimizado.",
    category: "Análise",
    icon: <Lightning size={20} weight="bold" />
  },
  {
    id: "8",
    title: "Conformidade Regulatória ANEEL",
    description: "Valide projeto conforme REN 1000",
    template: "Valide o projeto solar conforme regulamentação da ANEEL (REN 1000/2021) para:\n- Tipo de unidade consumidora: [residencial/comercial/industrial]\n- Classe de tensão: [baixa/média]\n- Concessionária: [nome]\n- Potência instalada: [X kWp]\n\nIdentifique requisitos específicos de homologação.",
    category: "Regulamentação",
    icon: <Code size={20} weight="bold" />
  },
  {
    id: "9",
    title: "Cálculo de String e MPPT",
    description: "Dimensione arranjo de módulos",
    template: "Dimensione strings para:\n- Módulo: [modelo e especificações: Voc, Isc, Vmp, Imp]\n- Inversor: [modelo e especificações: MPPT ranges, Imax]\n- Temperatura mínima local: [°C]\n\nRecomende quantidade de módulos por string e strings por MPPT.",
    category: "Dimensionamento",
    icon: <Sparkle size={20} weight="bold" />
  },
  {
    id: "10",
    title: "Análise de Fatura de Energia",
    description: "Extraia dados para dimensionamento",
    template: "Analise minha fatura de energia:\n- Consumo médio mensal: [X kWh]\n- Tarifa: [R$/kWh]\n- Modalidade tarifária: [convencional/branca]\n- Histórico de 12 meses: [se disponível]\n\nRecomende potência do sistema e estime economia.",
    category: "Dimensionamento",
    icon: <BookOpen size={20} weight="bold" />
  }
]

const categories = ["Todos", "Dimensionamento", "Equipamentos", "Análise", "Financeiro", "Documentação", "Regulamentação"]

export function PromptLibrary({ isOpen, onClose, onSelectPrompt }: PromptLibraryProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(search.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectPrompt = (template: string) => {
    onSelectPrompt(template)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90vw] md:max-w-4xl md:h-[85vh] z-50"
          >
            <Card className="h-full flex flex-col border-2 shadow-2xl bg-background">
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-accent/5 to-accent/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.08, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Lightning size={24} weight="fill" className="text-accent-foreground" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Biblioteca de Prompts</h2>
                    <p className="text-sm text-muted-foreground font-medium">Modelos prontos para começar</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent/10" aria-label="Fechar biblioteca de prompts">
                  <X size={24} weight="bold" />
                </Button>
              </div>

              <div className="p-6 border-b space-y-4">
                <div className="relative">
                  <MagnifyingGlass size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar prompts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 border-2 focus:border-accent bg-background"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <motion.div key={category} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? "bg-accent hover:bg-accent/90 shadow-md" : "border-2"}
                      >
                        {category}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPrompts.map((prompt, idx) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="p-5 cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-accent/40 bg-card h-full"
                        onClick={() => handleSelectPrompt(prompt.template)}
                      >
                        <div className="flex items-start gap-4">
                          <motion.div
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0 shadow-sm"
                            whileHover={{ rotate: 8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <div className="text-accent">{prompt.icon}</div>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-foreground leading-tight">{prompt.title}</h3>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {prompt.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {prompt.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                {filteredPrompts.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                    <MagnifyingGlass size={64} weight="thin" className="text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhum prompt encontrado</p>
                    <p className="text-sm text-muted-foreground/70">Tente outros termos de busca</p>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
