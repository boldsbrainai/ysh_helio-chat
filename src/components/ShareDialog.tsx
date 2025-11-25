import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Share, 
  Copy, 
  Check, 
  Download,
  Link as LinkIcon,
  FileText
} from "@phosphor-icons/react"
import { toast } from "sonner"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  chatTitle: string
  messages: Array<{ role: string; content: string }>
}

export function ShareDialog({ isOpen, onClose, chatTitle, messages }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const shareLink = `https://chatkit.app/shared/${Math.random().toString(36).substring(7)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast.success("Link copiado para área de transferência!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadMarkdown = () => {
    const markdown = `# ${chatTitle}\n\n${messages.map(msg => 
      `**${msg.role === 'user' ? 'Você' : 'ChatKit'}:**\n${msg.content}\n`
    ).join('\n')}`
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chatTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Conversa exportada com sucesso!")
  }

  const handleDownloadJSON = () => {
    const data = {
      title: chatTitle,
      messages: messages,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chatTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Conversa exportada como JSON!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Share size={24} weight="fill" className="text-accent-foreground" />
            </motion.div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">Compartilhar Conversa</DialogTitle>
              <DialogDescription className="font-medium">
                Compartilhe ou exporte esta conversa
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LinkIcon size={20} weight="bold" className="text-accent" />
              <h3 className="font-bold text-foreground">Link de Compartilhamento</h3>
              <Badge variant="secondary" className="text-xs">Demo</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Crie um link público para esta conversa que qualquer pessoa pode visualizar.
            </p>
            <div className="flex gap-2">
              <Input 
                value={shareLink} 
                readOnly 
                className="font-mono text-xs border-2"
              />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleCopyLink} 
                  variant="outline" 
                  size="icon"
                  className="border-2 flex-shrink-0"
                  aria-label="Copiar link"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                      >
                        <Check size={18} weight="bold" className="text-green-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy size={18} weight="bold" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Download size={20} weight="bold" className="text-accent" />
              <h3 className="font-bold text-foreground">Exportar Conversa</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Baixe a conversa em diferentes formatos para backup ou análise.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  onClick={handleDownloadMarkdown}
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-accent/60 hover:bg-accent/5"
                >
                  <FileText size={28} weight="bold" className="text-accent" />
                  <div className="text-center">
                    <div className="font-bold text-sm">Markdown</div>
                    <div className="text-xs text-muted-foreground">.md</div>
                  </div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  onClick={handleDownloadJSON}
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-accent/60 hover:bg-accent/5"
                >
                  <FileText size={28} weight="bold" className="text-accent" />
                  <div className="text-center">
                    <div className="font-bold text-sm">JSON</div>
                    <div className="text-xs text-muted-foreground">.json</div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                <span className="text-accent text-sm font-bold">i</span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                <strong>Nota:</strong> Links compartilhados são públicos e podem ser acessados por qualquer pessoa. Não compartilhe conversas com informações sensíveis.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
