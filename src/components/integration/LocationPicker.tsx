import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MagnifyingGlass, MapPin, Target } from "@phosphor-icons/react"
import { toast } from "sonner"

interface Location {
  address: string
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void
  className?: string
}

export function LocationPicker({ onLocationSelect, className = "" }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [manualLat, setManualLat] = useState("")
  const [manualLon, setManualLon] = useState("")

  const geocodeAddress = async (address: string): Promise<Location | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br`
      )
      
      if (!response.ok) {
        throw new Error("Geocoding failed")
      }

      const data = await response.json()
      
      if (data.length === 0) {
        return null
      }

      const result = data[0]
      
      return {
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        city: result.address?.city || result.address?.town,
        state: result.address?.state,
        country: result.address?.country,
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Digite um endereço ou CEP")
      return
    }

    setIsSearching(true)

    try {
      const location = await geocodeAddress(searchQuery)
      
      if (location) {
        onLocationSelect(location)
        toast.success("Localização encontrada")
      } else {
        toast.error("Endereço não encontrado")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Erro ao buscar endereço")
    } finally {
      setIsSearching(false)
    }
  }

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat)
    const lon = parseFloat(manualLon)

    if (isNaN(lat) || isNaN(lon)) {
      toast.error("Coordenadas inválidas")
      return
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast.error("Coordenadas fora do intervalo válido")
      return
    }

    onLocationSelect({
      address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      latitude: lat,
      longitude: lon,
    })

    toast.success("Coordenadas definidas")
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador")
      return
    }

    toast.info("Obtendo localização atual...")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          
          onLocationSelect({
            address: data.display_name,
            latitude,
            longitude,
            city: data.address?.city || data.address?.town,
            state: data.address?.state,
            country: data.address?.country,
          })
          
          toast.success("Localização atual obtida")
        } catch (error) {
          onLocationSelect({
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
          })
          toast.success("Localização atual obtida")
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        toast.error("Não foi possível obter a localização")
      }
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin size={20} weight="bold" />
          Selecionar Localização
        </CardTitle>
        <CardDescription>
          Busque por endereço, CEP ou insira coordenadas manualmente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address-search">Buscar por Endereço ou CEP</Label>
          <div className="flex gap-2">
            <Input
              id="address-search"
              placeholder="Ex: Av. Paulista, 1000 ou 01310-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              disabled={isSearching}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="gap-2 flex-shrink-0"
            >
              <MagnifyingGlass size={16} weight="bold" />
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OU</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="space-y-4">
          <Label>Coordenadas Manuais</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-xs">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="-23.550520"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-xs">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="-46.633308"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleManualSubmit}
            className="w-full"
          >
            Usar Coordenadas
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OU</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          variant="secondary"
          onClick={handleGetCurrentLocation}
          className="w-full gap-2"
        >
          <Target size={16} weight="bold" />
          Usar Minha Localização Atual
        </Button>
      </CardContent>
    </Card>
  )
}
