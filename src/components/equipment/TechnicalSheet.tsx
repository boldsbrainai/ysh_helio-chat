import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Download, Share, Printer, Lightning, GridFour, Gauge, CheckCircle, Ruler } from "@phosphor-icons/react"
import { toast } from "sonner"

interface TechnicalSheetProps {
  equipment: {
    manufacturer: string
    model: string
    category: string
    sku: string
    power_kw: number
    voltage_v: number
    mppt_count?: number
    efficiency_percent?: number
    price_brl: number
    image_url: string
    notes: string
  }
  onClose: () => void
}

export function TechnicalSheet({ equipment, onClose }: TechnicalSheetProps) {
  const handleDownloadPDF = () => {
    toast.success("Ficha técnica baixada", {
      description: `${equipment.manufacturer} ${equipment.model}.pdf`
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copiado para área de transferência")
  }

  const handlePrint = () => {
    window.print()
    toast.success("Preparando impressão...")
  }

  const specs = [
    {
      icon: Lightning,
      label: "Potência Nominal",
      value: `${equipment.power_kw} kW`,
      category: "power"
    },
    {
      icon: GridFour,
      label: "Tensão",
      value: `${equipment.voltage_v}V ${equipment.voltage_v === 220 ? 'Monofásico' : 'Trifásico'}`,
      category: "voltage"
    },
    ...(equipment.mppt_count ? [{
      icon: Gauge,
      label: "MPPTs",
      value: `${equipment.mppt_count} trackers`,
      category: "mppt"
    }] : []),
    ...(equipment.efficiency_percent ? [{
      icon: CheckCircle,
      label: "Eficiência",
      value: `${equipment.efficiency_percent}%`,
      category: "efficiency"
    }] : []),
  ]

  const certifications = [
    { name: "INMETRO", status: "Certificado", icon: "🇧🇷" },
    { name: "IEC 61727", status: "Conforme", icon: "✓" },
    { name: "NBR 16690", status: "Conforme", icon: "✓" },
    { name: "ABNT", status: "Certificado", icon: "✓" },
  ]

  const features = [
    "Proteção contra sobretensão DC/AC",
    "Monitoramento remoto via WiFi/Ethernet",
    "Display LCD com interface intuitiva",
    "Proteção IP65 para ambientes externos",
    "Suporte para string de até 16 painéis",
    "Garantia de 10 anos do fabricante",
    "Conformidade com NR-10",
    "Anti-ilhamento (anti-islanding)"
  ]

  const installationSpecs = [
    { label: "Dimensões (A×L×P)", value: "540 × 465 × 225 mm" },
    { label: "Peso", value: equipment.power_kw < 10 ? "25 kg" : equipment.power_kw < 50 ? "45 kg" : "85 kg" },
    { label: "Temperatura de operação", value: "-25°C a +60°C" },
    { label: "Umidade relativa", value: "0-95% (não condensante)" },
    { label: "Altitude máxima", value: "4000m (sem derrating)" },
    { label: "Grau de proteção", value: "IP65" },
    { label: "Classe de isolamento", value: "Classe II" },
    { label: "Topologia", value: "Transformerless" },
  ]

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScrollArea className="h-full">
        <div className="max-w-5xl mx-auto p-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs font-bold">
                  {equipment.category.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  SKU: {equipment.sku}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {equipment.manufacturer} {equipment.model}
              </h1>
              <p className="text-muted-foreground">{equipment.notes}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/10"
              aria-label="Fechar ficha técnica"
            >
              <X size={24} weight="bold" />
            </Button>
          </div>

          <div className="flex gap-3 mb-8">
            <Button variant="default" onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
              <Download size={18} weight="bold" className="mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share size={18} weight="bold" className="mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer size={18} weight="bold" className="mr-2" />
              Imprimir
            </Button>
          </div>

          <Card className="p-6 mb-6 bg-card/50 backdrop-blur-sm border-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Informações Gerais</h2>
              <Badge variant="default" className="text-lg px-4 py-2">
                R$ {equipment.price_brl.toLocaleString('pt-BR')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Preço sob consulta (estimado)
            </p>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightning size={24} weight="bold" />
                  Especificações Principais
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specs.map((spec, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <spec.icon size={20} weight="bold" className="text-accent mt-1" />
                      <div>
                        <div className="text-xs text-muted-foreground">{spec.label}</div>
                        <div className="text-sm font-bold">{spec.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle size={24} weight="bold" />
                  Certificações
                </h2>
                <div className="space-y-3">
                  {certifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cert.icon}</span>
                        <div className="text-sm font-semibold">{cert.name}</div>
                      </div>
                      <Badge variant="secondary">{cert.status}</Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <Separator className="my-8" />

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Ruler size={24} weight="bold" />
                  Especificações de Instalação
                </h2>
                <div className="space-y-2">
                  {installationSpecs.map((spec, index) => (
                    <div key={index} className="flex justify-between p-2 hover:bg-background/50 rounded">
                      <span className="text-sm font-semibold">{spec.label}</span>
                      <span className="text-sm text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle size={24} weight="bold" />
                  Recursos e Proteções
                </h2>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <CheckCircle size={16} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
              <h2 className="text-xl font-bold mb-3">Aplicações Recomendadas</h2>
              <p className="text-muted-foreground mb-4">
                {equipment.power_kw < 10
                  ? "Ideal para instalações residenciais de pequeno a médio porte, oferecendo eficiência e confiabilidade."
                  : equipment.power_kw < 50
                  ? "Recomendado para sistemas comerciais de médio porte, com excelente relação custo-benefício."
                  : "Projetado para grandes instalações comerciais e industriais, com alta capacidade e desempenho robusto."
                }
              </p>
              <div className="flex flex-wrap gap-2">
                {equipment.power_kw < 10 ? (
                  <>
                    <Badge>Residencial</Badge>
                    <Badge>Retrofit</Badge>
                    <Badge>Pequeno Comércio</Badge>
                  </>
                ) : equipment.power_kw < 50 ? (
                  <>
                    <Badge>Comércio</Badge>
                    <Badge>Escritórios</Badge>
                    <Badge>Pequenas Indústrias</Badge>
                  </>
                ) : (
                  <>
                    <Badge>Industrial</Badge>
                    <Badge>Shopping</Badge>
                    <Badge>Grandes Indústrias</Badge>
                  </>
                )}
              </div>
            </Card>
          </motion.div>

          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> As especificações técnicas são fornecidas pelo fabricante e podem variar. 
              Sempre consulte a documentação oficial e um integrador certificado para informações precisas sobre 
              instalação e compatibilidade com seu projeto específico.
            </p>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
