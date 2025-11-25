import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { List, MapPin, Sun } from "@phosphor-icons/react"
import { ShadingAnalysis3D } from "@/components/solar"
import { toast } from "sonner"

interface ShadingAnalysisPageProps {
  onToggleSidebar: () => void
}

export function ShadingAnalysisPage({ onToggleSidebar }: ShadingAnalysisPageProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string } | null>(
    null
  )
  const [addressInput, setAddressInput] = useState("")
  const [cepInput, setCepInput] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearchAddress = async () => {
    if (!addressInput.trim()) {
      toast.error("Digite um endereço para buscar")
      return
    }

    setIsSearching(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockLocations = [
        { lat: -23.5505, lon: -46.6333, address: "Av. Paulista, 1578 - São Paulo, SP" },
        { lat: -19.9167, lon: -43.9345, address: "Av. Afonso Pena, 1234 - Belo Horizonte, MG" },
        { lat: -30.0346, lon: -51.2177, address: "Av. Borges de Medeiros, 500 - Porto Alegre, RS" },
      ]

      const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)]
      setLocation(randomLocation)
      toast.success("Localização encontrada!")
    } catch (error) {
      toast.error("Erro ao buscar localização")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchCep = async () => {
    if (!cepInput.trim() || cepInput.length < 8) {
      toast.error("Digite um CEP válido (8 dígitos)")
      return
    }

    setIsSearching(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))

      setLocation({
        lat: -23.5505 + (Math.random() - 0.5) * 0.1,
        lon: -46.6333 + (Math.random() - 0.5) * 0.1,
        address: `Endereço encontrado para CEP ${cepInput}`,
      })
      toast.success("CEP localizado com sucesso!")
    } catch (error) {
      toast.error("Erro ao buscar CEP")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-accent/10"
            aria-label="Abrir menu de navegação"
          >
            <List size={22} weight="bold" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sun className="text-solar-orange" size={24} weight="duotone" />
              Análise de Sombreamento 3D
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Análise avançada com dados de elevação do terreno
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {!location ? (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-accent" size={24} weight="duotone" />
                  Localização do Projeto
                </CardTitle>
                <CardDescription>
                  Digite o endereço ou CEP para iniciar a análise de sombreamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      placeholder="Ex: Av. Paulista, 1578 - São Paulo, SP"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearchAddress} disabled={isSearching}>
                      {isSearching ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-sm text-muted-foreground">OU</span>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      placeholder="12345-678"
                      value={cepInput}
                      onChange={(e) => setCepInput(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchCep()}
                      maxLength={8}
                      className="flex-1"
                    />
                    <Button onClick={handleSearchCep} disabled={isSearching}>
                      {isSearching ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Digite apenas os números do CEP</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Análise de Sombreamento</h2>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocation(null)
                    setAddressInput("")
                    setCepInput("")
                  }}
                >
                  <MapPin className="mr-2" size={18} weight="duotone" />
                  Nova Localização
                </Button>
              </div>

              <ShadingAnalysis3D
                location={location}
                onAnalysisComplete={(result) => {
                  console.log("Análise completa:", result)
                  toast.success("Análise de sombreamento concluída!")
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
