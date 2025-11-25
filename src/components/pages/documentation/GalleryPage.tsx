import { motion } from "framer-motion"
import { ImageSquare, Sparkle, Image, Download, List } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface ImageItem {
  id: string
  url: string
  title: string
  prompt: string
  timestamp: number
  tags: string[]
}

const mockImages: ImageItem[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1686904423955-b1469892a0c6?w=500&h=500&fit=crop',
    title: 'Paisagem Cyberpunk',
    prompt: 'A futuristic cyberpunk cityscape at night with neon lights',
    timestamp: Date.now() - 1000 * 60 * 30,
    tags: ['cyberpunk', 'cidade', 'neon']
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=500&fit=crop',
    title: 'Abstrato Colorido',
    prompt: 'Abstract colorful geometric shapes with vibrant colors',
    timestamp: Date.now() - 1000 * 60 * 60,
    tags: ['abstrato', 'cores', 'geométrico']
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=500&h=500&fit=crop',
    title: 'Natureza Serena',
    prompt: 'A peaceful natural landscape with mountains and lake',
    timestamp: Date.now() - 1000 * 60 * 120,
    tags: ['natureza', 'montanhas', 'lago']
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&h=500&fit=crop',
    title: 'Espaço Profundo',
    prompt: 'Deep space nebula with stars and cosmic dust',
    timestamp: Date.now() - 1000 * 60 * 180,
    tags: ['espaço', 'nebulosa', 'estrelas']
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=500&h=500&fit=crop',
    title: 'Arte Digital',
    prompt: 'Modern digital art with flowing shapes and gradients',
    timestamp: Date.now() - 1000 * 60 * 240,
    tags: ['digital', 'moderno', 'gradiente']
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=500&h=500&fit=crop',
    title: 'Fantasia Mística',
    prompt: 'Mystical fantasy forest with magical lighting',
    timestamp: Date.now() - 1000 * 60 * 300,
    tags: ['fantasia', 'floresta', 'mágico']
  }
]

interface GalleryPageProps {
  onToggleSidebar: () => void
}

export function GalleryPage({ onToggleSidebar }: GalleryPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(mockImages.flatMap(img => img.tags)))
  
  const filteredImages = mockImages.filter(img => {
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || img.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
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
              <ImageSquare className="text-accent-foreground" size={24} weight="fill" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">Galeria de Imagens</h1>
              <p className="text-xs text-muted-foreground font-medium">
                {filteredImages.length} imagens geradas
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título ou prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/60 backdrop-blur-sm border-2"
              />
            </div>
            <Button variant="gradient" size="lg" className="gap-2">
              <Sparkle size={20} weight="fill" />
              Gerar Nova Imagem
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              Todas
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all border-2 hover:border-accent/40">
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <motion.img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
                        <Button size="sm" variant="secondary" className="flex-1">
                          <Image size={16} weight="bold" />
                          Ver
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Download size={16} weight="bold" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base mb-2">{image.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {image.prompt}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {image.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <ImageSquare size={40} className="text-muted-foreground" weight="duotone" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhuma imagem encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou limpar os filtros
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
