import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DownloadSimple, 
  Share, 
  Check, 
  Warning,
  Info,
  Sun,
  MapPin,
  Lightning,
  CurrencyCircleDollar
} from "@phosphor-icons/react"
import { toast } from "sonner"

interface ReportSection {
  title: string
  icon: any
  data: { label: string; value: string | number; unit?: string; highlight?: boolean }[]
}

interface AnalysisReportProps {
  projectName: string
  address: string
  date: string
  sections: ReportSection[]
  recommendations?: string[]
  warnings?: string[]
  notes?: string[]
  onDownload?: () => void
  onShare?: () => void
  className?: string
}

export function AnalysisReport({
  projectName,
  address,
  date,
  sections,
  recommendations = [],
  warnings = [],
  notes = [],
  onDownload,
  onShare,
  className = ""
}: AnalysisReportProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      toast.success("Relatório baixado com sucesso")
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      toast.success("Link copiado para área de transferência")
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{projectName}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin size={16} weight="fill" />
              {address}
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-1">
              Gerado em: {new Date(date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share size={16} weight="bold" />
              Compartilhar
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <DownloadSimple size={16} weight="bold" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {sections.map((section, idx) => {
          const Icon = section.icon
          
          return (
            <div key={idx}>
              {idx > 0 && <Separator className="my-6" />}
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon size={20} weight="bold" className="text-accent" />
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.data.map((item, dataIdx) => (
                    <div
                      key={dataIdx}
                      className={`
                        p-4 rounded-lg border
                        ${item.highlight ? 'bg-accent/5 border-accent' : 'bg-muted/30 border-border'}
                      `}
                    >
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className={`text-xl font-bold ${item.highlight ? 'text-accent' : ''}`}>
                        {item.value}
                        {item.unit && <span className="text-sm font-normal ml-1">{item.unit}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {recommendations.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check size={20} weight="bold" className="text-green-600" />
                <h3 className="text-lg font-semibold">Recomendações</h3>
              </div>
              <ul className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <Check size={16} weight="bold" className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {warnings.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Warning size={20} weight="bold" className="text-orange-600" />
                <h3 className="text-lg font-semibold">Avisos</h3>
              </div>
              <ul className="space-y-2">
                {warnings.map((warn, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <Warning size={16} weight="bold" className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {notes.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info size={20} weight="bold" className="text-blue-600" />
                <h3 className="text-lg font-semibold">Notas Técnicas</h3>
              </div>
              <ul className="space-y-2">
                {notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <Info size={16} weight="bold" className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Nota Legal:</strong> Este relatório é gerado automaticamente com base em dados de 
            satélite e algoritmos de dimensionamento. Os valores apresentados são estimativas e podem 
            variar de acordo com condições específicas do local. Recomenda-se uma vistoria técnica 
            presencial para validação final.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export const generateDemoReport = (): AnalysisReportProps => {
  return {
    projectName: "Projeto Solar Residencial - João Silva",
    address: "Rua das Flores, 123 - Belo Horizonte, MG",
    date: new Date().toISOString(),
    sections: [
      {
        title: "Dados do Sistema",
        icon: Sun,
        data: [
          { label: "Potência do Sistema", value: 8.25, unit: "kWp", highlight: true },
          { label: "Número de Painéis", value: 15, unit: "unidades" },
          { label: "Geração Mensal Estimada", value: 1050, unit: "kWh" },
          { label: "Área Necessária", value: 30, unit: "m²" },
        ],
      },
      {
        title: "Análise Financeira",
        icon: CurrencyCircleDollar,
        data: [
          { label: "Investimento Total", value: "R$ 37.125,00", highlight: true },
          { label: "Economia Mensal", value: "R$ 892,50" },
          { label: "Payback", value: 4.2, unit: "anos" },
          { label: "ROI (25 anos)", value: 486, unit: "%" },
        ],
      },
      {
        title: "Dados de Irradiação",
        icon: Lightning,
        data: [
          { label: "Irradiação Média Anual", value: 5.5, unit: "kWh/m²/dia" },
          { label: "Performance Ratio", value: 80, unit: "%" },
          { label: "Fator de Sombreamento", value: 5, unit: "%" },
          { label: "Inclinação Ideal", value: 19, unit: "°" },
        ],
      },
    ],
    recommendations: [
      "Sistema está bem dimensionado para o consumo informado",
      "Orientação do telhado favorável (Norte)",
      "Recomenda-se limpeza trimestral dos painéis",
      "Considere adicionar monitoramento em tempo real",
    ],
    warnings: [
      "Presença de árvore a 8m que pode causar sombreamento no período da tarde (15-17h)",
      "Telhado de fibrocimento requer reforço estrutural em 2 pontos",
    ],
    notes: [
      "Análise baseada em dados do CAMS (Copernicus Atmosphere Monitoring Service)",
      "Estimativas considerando Lei 14.300/2022 e tarifa de R$ 0,85/kWh",
      "Sistema enquadrado como microgeração distribuída (até 75kW)",
      "Necessário homologação pela CEMIG antes da instalação",
    ],
  }
}
