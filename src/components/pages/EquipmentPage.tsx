import { motion } from "framer-motion"
import { Package, Plus, ShoppingCart, Lightning, Info, Sliders, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"
import { TechnicalSheet } from "@/components/equipment/TechnicalSheet"

interface Equipment {
  id: string
  name: string
  category: string
  power: string
  price: number
  stock: number
  brand: string
  description: string
  image?: string
  powerKw?: number
  voltageV?: number
  mpptCount?: number
  efficiencyPercent?: number
}

const categories = [
  "Todos",
  "Painéis Solares",
  "Inversores",
  "Estruturas",
  "Baterias",
  "Cabos e Conectores"
]

interface EquipmentPageProps {
  onToggleSidebar: () => void
}

export function EquipmentPage({ onToggleSidebar }: EquipmentPageProps) {
  const [equipment, setEquipment] = useKV<Equipment[]>("equipment", [
    {
      id: 'GOODWEGW250KHTIMAGEPRODUCT600142',
      name: 'GOODWE GW250K-HT',
      category: 'Inversores',
      power: '250kW',
      price: 182250.00,
      stock: 2,
      brand: 'GOODWE',
      description: 'Maior inversor GOODWE - 250kW para grandes projetos comerciais. 10 MPPT, 380V trifásico, eficiência 98.5%',
      image: 'https://cdn.yellosolarhub.com/products/inversores/GOODWE-GW250K-HT_IMAGE_PRODUCT_600142.png',
      powerKw: 250,
      voltageV: 380,
      mpptCount: 10,
      efficiencyPercent: 98.5
    },
    {
      id: 'GROWATTMAC100KTL3XINV',
      name: 'GROWATT MAC-100KTL3-X',
      category: 'Inversores',
      power: '100kW',
      price: 45000.00,
      stock: 8,
      brand: 'GROWATT',
      description: 'Inversor trifásico de médio porte - ideal para sistemas comerciais. 6 MPPT, 380V, eficiência 98.75%',
      image: 'https://cdn.yellosolarhub.com/products/inversores/GROWATT-MAC-100KTL3-X-inv.png',
      powerKw: 100,
      voltageV: 380,
      mpptCount: 6,
      efficiencyPercent: 98.75
    },
    {
      id: 'SUNGROWTSG110CX',
      name: 'SUNGROW TSG110CX',
      category: 'Inversores',
      power: '110kW',
      price: 58000.00,
      stock: 5,
      brand: 'SUNGROW',
      description: 'Inversor string trifásico com alta eficiência. 9 MPPT, 380V, eficiência 98.6%',
      image: 'https://cdn.yellosolarhub.com/products/inversores/SUNGROW-TSG110CX.jpg',
      powerKw: 110,
      voltageV: 380,
      mpptCount: 9,
      efficiencyPercent: 98.6
    },
    {
      id: 'DEYE8KWINVERSOR',
      name: 'DEYE SUN-8K-SG04LP3',
      category: 'Inversores',
      power: '8kW',
      price: 3200.00,
      stock: 24,
      brand: 'DEYE',
      description: 'Inversor híbrido residencial com backup de bateria. 2 MPPT, 220V, eficiência 97.6%',
      image: 'https://cdn.yellosolarhub.com/products/inversores/DEYE-8kW-inversor.png',
      powerKw: 8,
      voltageV: 220,
      mpptCount: 2,
      efficiencyPercent: 97.6
    },
    {
      id: 'HUAWEISUN2000L3KTL',
      name: 'HUAWEI SUN2000-L-3KTL',
      category: 'Inversores',
      power: '3kW',
      price: 2800.00,
      stock: 35,
      brand: 'HUAWEI',
      description: 'Inversor monofásico residencial com inteligência integrada. 2 MPPT, 220V, eficiência 98.4%',
      image: 'https://cdn.yellosolarhub.com/products/inversores/HUAWEI-SUN2000-L-3KTL.jpg',
      powerKw: 3,
      voltageV: 220,
      mpptCount: 2,
      efficiencyPercent: 98.4
    },
    {
      id: 'INV-FRONIUS-5KW',
      name: 'Fronius Primo 5.0-1',
      category: 'Inversores',
      power: '5kW',
      price: 4200.00,
      stock: 18,
      brand: 'FRONIUS',
      description: 'Inversor monofásico de alta qualidade. 2 MPPT, 220V, eficiência 98.1%, monitoramento WiFi integrado',
      powerKw: 5,
      voltageV: 220,
      mpptCount: 2,
      efficiencyPercent: 98.1
    },
    {
      id: 'INV-SMA-10KW',
      name: 'SMA Sunny Tripower 10.0',
      category: 'Inversores',
      power: '10kW',
      price: 8500.00,
      stock: 12,
      brand: 'SMA',
      description: 'Inversor trifásico premium. 2 MPPT, 380V, eficiência 98.3%, tecnologia OptiTrac Global Peak',
      powerKw: 10,
      voltageV: 380,
      mpptCount: 2,
      efficiencyPercent: 98.3
    },
    {
      id: 'INV-ABB-50KW',
      name: 'ABB TRIO-50.0-TL-OUTD',
      category: 'Inversores',
      power: '50kW',
      price: 28500.00,
      stock: 6,
      brand: 'ABB',
      description: 'Inversor string para instalações comerciais. 3 MPPT, 380V, eficiência 98.4%, proteção IP65',
      powerKw: 50,
      voltageV: 380,
      mpptCount: 3,
      efficiencyPercent: 98.4
    }
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [cart, setCart] = useKV<{[key: string]: number}>("equipment-cart", {})
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const filteredEquipment = (equipment || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (equipmentId: string) => {
    setCart((current) => ({
      ...(current || {}),
      [equipmentId]: ((current || {})[equipmentId] || 0) + 1
    }))
    toast.success("Item adicionado ao carrinho")
  }

  const cartTotal = Object.entries(cart || {}).reduce((total, [id, qty]) => {
    const item = equipment?.find(e => e.id === id)
    return total + (item?.price || 0) * qty
  }, 0)

  const cartItemCount = Object.values(cart || {}).reduce((sum, qty) => sum + qty, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
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
                <Package className="text-accent-foreground" size={24} weight="fill" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">Catálogo de Equipamentos</h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {filteredEquipment.length} equipamentos disponíveis
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" size="lg" className="gap-2 flex-1 sm:flex-none">
                <Sliders size={20} weight="bold" />
                Filtros
              </Button>
              {cartItemCount > 0 && (
                <Button variant="gradient" size="lg" className="gap-2 relative flex-1 sm:flex-none">
                  <ShoppingCart size={20} weight="fill" />
                  <span className="hidden sm:inline">Carrinho ({cartItemCount})</span>
                  <span className="sm:hidden">({cartItemCount})</span>
                  <Badge className="ml-1 bg-accent-foreground text-accent hidden md:inline-flex">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                  </Badge>
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Buscar equipamentos por nome ou marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/60 backdrop-blur-sm border-2"
            />
            
            <div className="flex gap-2 flex-wrap">
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
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredEquipment.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 border-2 hover:border-accent/40 hover:shadow-xl transition-all h-full flex flex-col group">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {item.category}
                    </Badge>
                    {item.stock > 0 && item.stock < 10 && (
                      <Badge variant="destructive" className="text-xs">
                        Estoque baixo
                      </Badge>
                    )}
                    {item.stock === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Esgotado
                      </Badge>
                    )}
                  </div>

                  <div className="w-full aspect-square bg-muted rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <Package size={64} weight="duotone" className="text-muted-foreground" style={item.image ? {display: 'none'} : {}} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-bold mb-2 group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {item.brand}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Lightning size={12} weight="fill" className="mr-1" />
                        {item.power}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(item.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.stock} em estoque
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedEquipment(item)}
                    >
                      <Info size={16} weight="bold" />
                      Ficha Técnica
                    </Button>
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-accent to-accent/90"
                      onClick={() => handleAddToCart(item.id)}
                      disabled={item.stock === 0}
                    >
                      <ShoppingCart size={16} weight="bold" />
                      Adicionar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Package size={40} className="text-muted-foreground" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum equipamento encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou selecionar outra categoria
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {selectedEquipment && (
        <TechnicalSheet
          equipment={{
            sku: selectedEquipment.id,
            manufacturer: selectedEquipment.brand,
            model: selectedEquipment.name.replace(selectedEquipment.brand, '').trim(),
            category: selectedEquipment.category.toLowerCase(),
            power_kw: selectedEquipment.powerKw || parseFloat(selectedEquipment.power),
            voltage_v: selectedEquipment.voltageV || 220,
            mppt_count: selectedEquipment.mpptCount,
            efficiency_percent: selectedEquipment.efficiencyPercent,
            price_brl: selectedEquipment.price,
            image_url: selectedEquipment.image || '',
            notes: selectedEquipment.description
          }}
          onClose={() => setSelectedEquipment(null)}
        />
      )}
    </div>
  )
}
