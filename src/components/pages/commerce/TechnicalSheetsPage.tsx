import { motion } from "framer-motion"
import { List, MagnifyingGlass, FunnelSimple, FileText, Package } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { TechnicalSheetPreview } from "@/components/equipment/TechnicalSheetPreview"
import { TechnicalSheet } from "@/components/equipment/TechnicalSheet"

interface TechnicalSheetsPageProps {
  onToggleSidebar: () => void
}

const equipmentDatabase = [
  {
    sku: 'GOODWEGW250KHTIMAGEPRODUCT600142',
    manufacturer: 'GOODWE',
    model: 'GW250K-HT',
    category: 'inversores',
    power_kw: 250,
    voltage_v: 380,
    mppt_count: 10,
    efficiency_percent: 98.5,
    price_brl: 182250.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/GOODWE-GW250K-HT_IMAGE_PRODUCT_600142.png',
    notes: 'Maior inversor GOODWE - 250kW para grandes projetos comerciais'
  },
  {
    sku: 'GROWATTMAC100KTL3XINV',
    manufacturer: 'GROWATT',
    model: 'MAC-100KTL3-X',
    category: 'inversores',
    power_kw: 100,
    voltage_v: 380,
    mppt_count: 6,
    efficiency_percent: 98.75,
    price_brl: 45000.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/GROWATT-MAC-100KTL3-X-inv.png',
    notes: 'Inversor trifásico de médio porte - ideal para sistemas comerciais'
  },
  {
    sku: 'SUNGROWTSG110CX',
    manufacturer: 'SUNGROW',
    model: 'TSG110CX',
    category: 'inversores',
    power_kw: 110,
    voltage_v: 380,
    mppt_count: 9,
    efficiency_percent: 98.6,
    price_brl: 58000.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/SUNGROW-TSG110CX.jpg',
    notes: 'Inversor string trifásico com alta eficiência'
  },
  {
    sku: 'DEYE8KWINVERSOR',
    manufacturer: 'DEYE',
    model: 'SUN-8K-SG04LP3',
    category: 'inversores',
    power_kw: 8,
    voltage_v: 220,
    mppt_count: 2,
    efficiency_percent: 97.6,
    price_brl: 3200.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/DEYE-8kW-inversor.png',
    notes: 'Inversor híbrido residencial com backup de bateria'
  },
  {
    sku: 'HUAWEISUN2000L3KTL',
    manufacturer: 'HUAWEI',
    model: 'SUN2000-L-3KTL',
    category: 'inversores',
    power_kw: 3,
    voltage_v: 220,
    mppt_count: 2,
    efficiency_percent: 98.4,
    price_brl: 2800.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/HUAWEI-SUN2000-L-3KTL.jpg',
    notes: 'Inversor monofásico residencial com inteligência integrada'
  },
  {
    sku: 'FRONIUS-PRIMO-5KW',
    manufacturer: 'FRONIUS',
    model: 'Primo 5.0-1',
    category: 'inversores',
    power_kw: 5,
    voltage_v: 220,
    mppt_count: 2,
    efficiency_percent: 98.1,
    price_brl: 4200.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/FRONIUS-Primo-5.0-1.jpg',
    notes: 'Inversor monofásico de alta qualidade com monitoramento WiFi'
  },
  {
    sku: 'SMA-TRIPOWER-10KW',
    manufacturer: 'SMA',
    model: 'Sunny Tripower 10.0',
    category: 'inversores',
    power_kw: 10,
    voltage_v: 380,
    mppt_count: 2,
    efficiency_percent: 98.3,
    price_brl: 8500.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/SMA-Sunny-Tripower-10.jpg',
    notes: 'Inversor trifásico premium com tecnologia OptiTrac Global Peak'
  },
  {
    sku: 'ABB-TRIO-50KW',
    manufacturer: 'ABB',
    model: 'TRIO-50.0-TL-OUTD',
    category: 'inversores',
    power_kw: 50,
    voltage_v: 380,
    mppt_count: 3,
    efficiency_percent: 98.4,
    price_brl: 28500.0,
    image_url: 'https://cdn.yellosolarhub.com/products/inversores/ABB-TRIO-50.jpg',
    notes: 'Inversor string para instalações comerciais com proteção IP65'
  }
]

const categories = ['Todos', 'Inversores', 'Painéis Solares', 'Estruturas', 'Baterias']
const manufacturers = ['Todos', 'GOODWE', 'GROWATT', 'SUNGROW', 'DEYE', 'HUAWEI', 'FRONIUS', 'SMA', 'ABB']
const powerRanges = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: '0-10kW (Residencial)', min: 0, max: 10 },
  { label: '10-50kW (Comercial Pequeno)', min: 10, max: 50 },
  { label: '50-100kW (Comercial Médio)', min: 50, max: 100 },
  { label: '100kW+ (Comercial Grande)', min: 100, max: Infinity }
]

export function TechnicalSheetsPage({ onToggleSidebar }: TechnicalSheetsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedManufacturer, setSelectedManufacturer] = useState("Todos")
  const [selectedPowerRange, setSelectedPowerRange] = useState(0)
  const [selectedEquipment, setSelectedEquipment] = useState<typeof equipmentDatabase[0] | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredEquipment = equipmentDatabase.filter(item => {
    const matchesSearch = 
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === 'Todos' || 
      item.category.toLowerCase() === selectedCategory.toLowerCase()
    
    const matchesManufacturer = 
      selectedManufacturer === 'Todos' || 
      item.manufacturer === selectedManufacturer
    
    const powerRange = powerRanges[selectedPowerRange]
    const matchesPowerRange = 
      item.power_kw >= powerRange.min && item.power_kw <= powerRange.max

    return matchesSearch && matchesCategory && matchesManufacturer && matchesPowerRange
  })

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors"
          >
            <List size={22} weight="bold" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText size={24} weight="duotone" className="text-accent" />
              Fichas Técnicas
            </h1>
            <p className="text-xs text-muted-foreground">
              Biblioteca completa de especificações técnicas
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm font-bold">
          {filteredEquipment.length} equipamentos
        </Badge>
      </header>

      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlass 
                size={20} 
                weight="bold" 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar por fabricante, modelo ou SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/60"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelSimple size={20} weight="bold" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid md:grid-cols-3 gap-4"
            >
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block">
                  Fabricante
                </label>
                <div className="flex flex-wrap gap-2">
                  {manufacturers.map((manufacturer) => (
                    <Badge
                      key={manufacturer}
                      variant={selectedManufacturer === manufacturer ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedManufacturer(manufacturer)}
                    >
                      {manufacturer}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block">
                  Faixa de Potência
                </label>
                <div className="flex flex-wrap gap-2">
                  {powerRanges.map((range, index) => (
                    <Badge
                      key={index}
                      variant={selectedPowerRange === index ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setSelectedPowerRange(index)}
                    >
                      {range.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div
          className="w-full px-6 py-6 lg:px-10"
          style={{
            paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
            paddingRight: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          {filteredEquipment.length > 0 ? (
            <div className="mx-auto grid max-w-[1600px] gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {filteredEquipment.map((item) => (
                <TechnicalSheetPreview
                  key={item.sku}
                  equipment={item}
                  onViewDetails={() => setSelectedEquipment(item)}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Package size={40} className="text-muted-foreground" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhuma ficha técnica encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar seus filtros ou busca
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("Todos")
                  setSelectedManufacturer("Todos")
                  setSelectedPowerRange(0)
                }}
              >
                Limpar Filtros
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {selectedEquipment && (
        <TechnicalSheet
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
        />
      )}
    </div>
  )
}
