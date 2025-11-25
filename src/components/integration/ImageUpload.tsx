import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadSimple, X, Image as ImageIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface ImageUploadProps {
  title?: string
  description?: string
  accept?: string
  maxSizeMB?: number
  onUpload: (file: File, base64: string) => Promise<void>
  onRemove?: () => void
  className?: string
}

export function ImageUpload({
  title = "Upload de Imagem",
  description = "Arraste uma imagem ou clique para selecionar",
  accept = "image/*",
  maxSizeMB = 10,
  onUpload,
  onRemove,
  className = ""
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error("Apenas imagens são permitidas")
      return false
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`)
      return false
    }

    return true
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return

    setIsUploading(true)

    try {
      const base64 = await fileToBase64(file)
      setPreview(base64)
      await onUpload(file, base64)
      toast.success("Imagem carregada com sucesso")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Falha ao carregar imagem")
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
    toast.success("Imagem removida")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Seletor de arquivo de imagem"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border-2 border-border"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 shadow-lg"
                onClick={handleRemove}
                aria-label="Remover imagem"
              >
                <X size={20} weight="bold" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? 'border-accent bg-accent/10 scale-105' 
                  : 'border-border hover:border-accent/50 hover:bg-accent/5'
                }
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDragging ? 'bg-accent/20' : 'bg-muted'
                }`}>
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <UploadSimple size={32} weight="bold" className="text-accent" />
                    </motion.div>
                  ) : (
                    <ImageIcon size={32} weight="bold" className="text-muted-foreground" />
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isUploading ? "Carregando..." : "Arraste uma imagem aqui"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ou clique para selecionar (máx. {maxSizeMB}MB)
                  </p>
                </div>
                
                {!isUploading && (
                  <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
                    <UploadSimple size={16} weight="bold" className="mr-2" />
                    Selecionar Arquivo
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
