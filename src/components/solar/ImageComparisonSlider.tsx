import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Calendar, ArrowsLeftRight, Download, Info } from "@phosphor-icons/react"
import { motion } from "framer-motion"

interface ImageData {
  url: string
  date: string
  source: string
  metadata?: {
    cloudCoverage?: number
    resolution?: string
    satellite?: string
  }
}

interface ImageComparisonSliderProps {
  beforeImage: ImageData
  afterImage: ImageData
  title?: string
  description?: string
  onAnalysisRequest?: () => void
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  title = "Comparação Temporal de Imagens",
  description = "Arraste o controle para comparar imagens",
  onAnalysisRequest
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percentage = (x / rect.width) * 100
    setSliderPosition(percentage)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
    const percentage = (x / rect.width) * 100
    setSliderPosition(percentage)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowsLeftRight size={24} weight="bold" className="text-accent" />
              {title}
            </CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
          {onAnalysisRequest && (
            <Button onClick={onAnalysisRequest} size="sm" variant="outline">
              <Info size={16} className="mr-2" />
              Analisar Mudanças
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden cursor-col-resize select-none"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="absolute inset-0">
            <img
              src={afterImage.url}
              alt={`Imagem de ${afterImage.date}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-2">
                <Calendar size={14} className="mr-1" />
                {formatDate(afterImage.date)}
              </Badge>
            </div>
          </div>

          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeImage.url}
              alt={`Imagem de ${beforeImage.date}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-2">
                <Calendar size={14} className="mr-1" />
                {formatDate(beforeImage.date)}
              </Badge>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-20"
            style={{ left: `${sliderPosition}%` }}
            animate={{ left: `${sliderPosition}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing">
              <ArrowsLeftRight size={24} weight="bold" className="text-foreground" />
            </div>

            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
              <div className="bg-white text-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {sliderPosition.toFixed(0)}%
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Slider
            value={[sliderPosition]}
            onValueChange={(value) => setSliderPosition(value[0])}
            max={100}
            step={1}
            className="w-full max-w-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Imagem Anterior
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Data:</strong> {formatDate(beforeImage.date)}</p>
              <p><strong>Fonte:</strong> {beforeImage.source}</p>
              {beforeImage.metadata?.satellite && (
                <p><strong>Satélite:</strong> {beforeImage.metadata.satellite}</p>
              )}
              {beforeImage.metadata?.resolution && (
                <p><strong>Resolução:</strong> {beforeImage.metadata.resolution}</p>
              )}
              {beforeImage.metadata?.cloudCoverage !== undefined && (
                <p><strong>Nuvens:</strong> {beforeImage.metadata.cloudCoverage}%</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Imagem Atual
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Data:</strong> {formatDate(afterImage.date)}</p>
              <p><strong>Fonte:</strong> {afterImage.source}</p>
              {afterImage.metadata?.satellite && (
                <p><strong>Satélite:</strong> {afterImage.metadata.satellite}</p>
              )}
              {afterImage.metadata?.resolution && (
                <p><strong>Resolução:</strong> {afterImage.metadata.resolution}</p>
              )}
              {afterImage.metadata?.cloudCoverage !== undefined && (
                <p><strong>Nuvens:</strong> {afterImage.metadata.cloudCoverage}%</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Download size={16} className="mr-2" />
            Exportar Comparação
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSliderPosition(50)}
          >
            Centralizar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
