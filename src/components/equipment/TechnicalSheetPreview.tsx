import { motion } from "framer-motion"
import { Lightning, Gauge, GridFour, CheckCircle, Eye, Download } from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface TechnicalSheetPreviewProps {
  equipment: {
    sku: string
    manufacturer: string
    model: string
    category: string
    power_kw: number
    voltage_v: number
    mppt_count?: number
    efficiency_percent?: number
    price_brl: number
    image_url: string
    notes: string
  }
  onViewDetails: () => void
}

export function TechnicalSheetPreview({ equipment, onViewDetails }: TechnicalSheetPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="p-5 bg-card/50 backdrop-blur-sm border-2 hover:border-accent/50 transition-all hover:shadow-xl group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-xs font-bold mb-2">
                {equipment.category.toUpperCase()}
              </Badge>
              <h3 className="text-lg font-bold mb-1 truncate">
                {equipment.manufacturer}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {equipment.model}
              </p>
            </div>
            <div className="flex-shrink-0 ml-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center overflow-hidden border border-border/50">
                <img
                  src={equipment.image_url}
                  alt={`${equipment.manufacturer} ${equipment.model}`}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Lightning size={16} weight="duotone" className="text-accent flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground truncate">Potência</div>
                <div className="text-sm font-bold truncate">{equipment.power_kw} kW</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <GridFour size={16} weight="duotone" className="text-accent flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground truncate">Tensão</div>
                <div className="text-sm font-bold truncate">{equipment.voltage_v}V</div>
              </div>
            </div>

            {equipment.mppt_count && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <Gauge size={16} weight="duotone" className="text-accent flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">MPPTs</div>
                  <div className="text-sm font-bold truncate">{equipment.mppt_count}</div>
                </div>
              </div>
            )}

            {equipment.efficiency_percent && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle size={16} weight="duotone" className="text-accent flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">Eficiência</div>
                  <div className="text-sm font-bold truncate">{equipment.efficiency_percent}%</div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <div className="text-2xl font-bold text-accent mb-0.5">
              R$ {equipment.price_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">
              Preço sob consulta
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-gradient-to-r from-accent to-accent/90"
              onClick={onViewDetails}
            >
              <Eye size={16} weight="bold" />
              Ver Ficha Completa
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Download size={16} weight="bold" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
