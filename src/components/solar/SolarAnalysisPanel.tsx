import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  MagnifyingGlass, 
  Sun, 
  CloudSun,
  Database,
  Polygon as PolygonIcon,
  Pencil,
  Download,
  Sparkle
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { MapLibreViewer } from "./MapLibreViewer"
import { cn } from "@/lib/utils"

interface SolarAnalysisPanelProps {
  className?: string
}

interface GeocodingResult {
  address: string
  lat: number
  lon: number
  displayName: string
}

interface SolarData {
  source: string
  irradiation: number
  temperature: number
  pvOutput: number
  timestamp: string
}

interface PolygonData {
  id: string
  coordinates: [number, number][]
  area: number
  perimeter: number
  solarPotential?: number
}

export function SolarAnalysisPanel({ className }: SolarAnalysisPanelProps) {
  const [address, setAddress] = useState("")
  const [cep, setCep] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<GeocodingResult | null>(null)
  const [solarData, setSolarData] = useState<SolarData[]>([])
  const [polygons, setPolygons] = useState<PolygonData[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([-47.9292, -15.7801])
  const [mapZoom, setMapZoom] = useState(4)
  const [drawingEnabled, setDrawingEnabled] = useState(false)

  const geocodeAddress = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=br&limit=1`,
        {
          headers: {
            'User-Agent': 'YelloSolarHub/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result: GeocodingResult = {
          address: searchQuery,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name
        }
        
        setLocation(result)
        setMapCenter([result.lon, result.lat])
        setMapZoom(15)
        toast.success("Localização encontrada!")
        
        await fetchSolarData(result.lat, result.lon)
      } else {
        toast.error("Endereço não encontrado")
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      toast.error("Erro ao buscar localização")
    } finally {
      setIsLoading(false)
    }
  }

  const geocodeCEP = async (cepValue: string) => {
    const cleanCEP = cepValue.replace(/\D/g, '')
    
    if (cleanCEP.length !== 8) {
      toast.error("CEP deve ter 8 dígitos")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        toast.error("CEP não encontrado")
        return
      }
      
      const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`
      await geocodeAddress(fullAddress)
    } catch (error) {
      console.error("CEP lookup error:", error)
      toast.error("Erro ao buscar CEP")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSolarData = async (lat: number, lon: number) => {
    const results: SolarData[] = []

    try {
      const pvgisUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=14&pvtechchoice=crystSi&mountingplace=free&outputformat=json`
      
      const pvgisResponse = await fetch(pvgisUrl)
      const pvgisData = await pvgisResponse.json()
      
      if (pvgisData.outputs) {
        const avgIrradiation = pvgisData.outputs.totals?.fixed?.H_y_m / 365 || 0
        const avgPvOutput = pvgisData.outputs.totals?.fixed?.E_y_m / 365 || 0
        
        results.push({
          source: "PVGIS (JRC)",
          irradiation: avgIrradiation,
          temperature: 25,
          pvOutput: avgPvOutput,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error("PVGIS fetch error:", error)
    }

    try {
      const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${lon}&latitude=${lat}&start=20230101&end=20231231&format=JSON`
      
      const nasaResponse = await fetch(nasaUrl)
      const nasaData = await nasaResponse.json()
      
      if (nasaData.properties?.parameter) {
        const irradiationData = nasaData.properties.parameter.ALLSKY_SFC_SW_DWN
        const tempData = nasaData.properties.parameter.T2M
        
        const irradiationValues = Object.values(irradiationData) as number[]
        const tempValues = Object.values(tempData) as number[]
        
        const avgIrradiation = irradiationValues.reduce((a, b) => a + b, 0) / irradiationValues.length
        const avgTemp = tempValues.reduce((a, b) => a + b, 0) / tempValues.length
        
        results.push({
          source: "NASA POWER",
          irradiation: avgIrradiation,
          temperature: avgTemp,
          pvOutput: avgIrradiation * 0.15 * 0.86,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error("NASA POWER fetch error:", error)
    }

    if (results.length > 0) {
      setSolarData(results)
      toast.success(`Dados solares obtidos de ${results.length} fonte(s)`)
    } else {
      toast.error("Não foi possível obter dados solares")
    }
  }

  const handlePolygonDrawn = (polygon: any) => {
    const coords = polygon.geometry.coordinates[0].slice(0, -1) as [number, number][]
    
    const newPolygon: PolygonData = {
      id: `polygon-${Date.now()}`,
      coordinates: coords,
      area: polygon.properties.area || 0,
      perimeter: calculatePerimeter(coords),
      solarPotential: solarData.length > 0 ? solarData[0].irradiation * polygon.properties.area * 0.15 * 0.86 / 1000 : undefined
    }
    
    setPolygons(prev => [...prev, newPolygon])
    toast.success("Polígono adicionado à análise")
  }

  const calculatePerimeter = (coords: [number, number][]) => {
    let perimeter = 0
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i]
      const p2 = coords[(i + 1) % coords.length]
      const distance = Math.sqrt(
        Math.pow((p2[0] - p1[0]) * 111320 * Math.cos(p1[1] * Math.PI / 180), 2) +
        Math.pow((p2[1] - p1[1]) * 111320, 2)
      )
      perimeter += distance
    }
    return perimeter
  }

  const exportData = () => {
    const exportObj = {
      location,
      solarData,
      polygons,
      exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportObj, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `solar-analysis-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success("Dados exportados com sucesso")
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={24} weight="fill" className="text-accent" />
            Análise de Localização
          </CardTitle>
          <CardDescription>
            Insira endereço ou CEP para análise solar automatizada com PVGIS e NASA POWER
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="address" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="cep">CEP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="address" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    placeholder="Ex: Av. Paulista, 1000, São Paulo, SP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && geocodeAddress(address)}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => geocodeAddress(address)}
                    disabled={!address || isLoading}
                    className="flex-shrink-0"
                  >
                    <MagnifyingGlass size={18} weight="bold" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cep" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP (8 dígitos)</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    placeholder="Ex: 01310-100"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && geocodeCEP(cep)}
                    maxLength={9}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => geocodeCEP(cep)}
                    disabled={!cep || isLoading}
                    className="flex-shrink-0"
                  >
                    <MagnifyingGlass size={18} weight="bold" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {location && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={18} weight="fill" className="text-accent mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{location.displayName}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Lat: {location.lat.toFixed(6)}°</span>
                    <span>Lon: {location.lon.toFixed(6)}°</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {solarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun size={24} weight="fill" className="text-yellow-500" />
              Dados de Irradiação Solar
            </CardTitle>
            <CardDescription>
              Múltiplas fontes de dados validados (AWS Ready)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {solarData.map((data, idx) => (
              <div key={idx}>
                {idx > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      <Database className="mr-1" size={12} weight="bold" />
                      {data.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(data.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sun size={16} weight="fill" className="text-yellow-600" />
                        <span className="text-xs font-semibold">Irradiação</span>
                      </div>
                      <p className="text-lg font-bold">{data.irradiation.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">kWh/m²/dia</p>
                    </div>
                    
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <CloudSun size={16} weight="fill" className="text-orange-600" />
                        <span className="text-xs font-semibold">Temperatura</span>
                      </div>
                      <p className="text-lg font-bold">{data.temperature.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">°C (média)</p>
                    </div>
                    
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkle size={16} weight="fill" className="text-blue-600" />
                        <span className="text-xs font-semibold">Geração PV</span>
                      </div>
                      <p className="text-lg font-bold">{data.pvOutput.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">kWh/kWp/dia</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PolygonIcon size={24} weight="fill" className="text-blue-600" />
                Mapa Interativo & Desenho
              </CardTitle>
              <CardDescription>
                Desenhe polígonos e strings para análise de área
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawingEnabled(!drawingEnabled)}
              className={cn(
                "border-blue-500",
                drawingEnabled && "bg-blue-500/10"
              )}
            >
              {drawingEnabled ? (
                <>
                  <Pencil className="mr-2" size={16} weight="bold" />
                  Modo Desenho Ativo
                </>
              ) : (
                <>
                  <PolygonIcon className="mr-2" size={16} weight="bold" />
                  Ativar Desenho
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MapLibreViewer
            center={mapCenter}
            zoom={mapZoom}
            pitch={45}
            enableDrawing={drawingEnabled}
            onPolygonDrawn={handlePolygonDrawn}
            className="rounded-lg overflow-hidden shadow-lg border-2 border-blue-500/20"
          />
          
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>• <strong>Tiles FOSS:</strong> OpenFreeMap (OpenStreetMap) + Sentinel-2 Cloudless (EOX)</p>
            <p>• <strong>Terrain:</strong> MapLibre DEM Tiles (AWS S3)</p>
            <p>• <strong>Data Cubes:</strong> Brazil Data Cube (INPE) via AWS Registry of Open Data</p>
          </div>
        </CardContent>
      </Card>

      {polygons.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PolygonIcon size={24} weight="fill" className="text-green-600" />
                Polígonos Analisados
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="mr-2" size={16} weight="bold" />
                Exportar JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {polygons.map((polygon, idx) => (
              <div key={polygon.id}>
                {idx > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Polígono {idx + 1}</h4>
                    <Badge variant="outline">{polygon.coordinates.length} vértices</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-card rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Área</p>
                      <p className="text-lg font-bold">{polygon.area.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">m²</p>
                    </div>
                    
                    <div className="p-3 bg-card rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Perímetro</p>
                      <p className="text-lg font-bold">{polygon.perimeter.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">m</p>
                    </div>
                    
                    {polygon.solarPotential && (
                      <>
                        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Potencial Solar</p>
                          <p className="text-lg font-bold">{polygon.solarPotential.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">kWh/dia</p>
                        </div>
                        
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Potencial Anual</p>
                          <p className="text-lg font-bold">{(polygon.solarPotential * 365 / 1000).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">MWh/ano</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
