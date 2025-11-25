import { useState, useMemo, useRef, useEffect, KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  MagnifyingGlass, 
  Chat,
  Clock,
  CalendarBlank
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ChatHistoryItem {
  id: string
  title: string
  timestamp: number
  messages: Array<{ role: string; content: string }>
}

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  chats: ChatHistoryItem[]
  onSelectChat: (chatId: string) => void
}

export function SearchDialog({ isOpen, onClose, chats, onSelectChat }: SearchDialogProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<(HTMLDivElement | null)[]>([])

  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    
    const query = search.toLowerCase()
    
    return chats
      .map(chat => {
        const titleMatch = chat.title.toLowerCase().includes(query)
        const messageMatches = chat.messages.filter(msg => 
          msg.content.toLowerCase().includes(query)
        )
        
        if (titleMatch || messageMatches.length > 0) {
          return {
            chat,
            titleMatch,
            messageCount: messageMatches.length,
            preview: messageMatches[0]?.content.substring(0, 150) || chat.title
          }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a!.titleMatch && !b!.titleMatch) return -1
        if (!a!.titleMatch && b!.titleMatch) return 1
        return b!.chat.timestamp - a!.chat.timestamp
      })
  }, [search, chats])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchResults])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1))
      resultsRef.current[Math.min(selectedIndex + 1, searchResults.length - 1)]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
      resultsRef.current[Math.max(selectedIndex - 1, 0)]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      })
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      e.preventDefault()
      handleSelect(searchResults[selectedIndex]!.chat.id)
    }
  }

  const handleSelect = (chatId: string) => {
    onSelectChat(chatId)
    onClose()
    setSearch("")
    setSelectedIndex(0)
  }

  const handleClose = () => {
    onClose()
    setSearch("")
    setSelectedIndex(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 border-2 shadow-2xl overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-accent/5 to-accent/10">
          <div className="relative">
            <MagnifyingGlass 
              size={24} 
              weight="bold" 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              placeholder="Buscar em conversas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-14 h-14 text-base border-2 focus-visible:border-accent bg-background"
              aria-label="Campo de busca"
              aria-describedby="search-hint"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4">
            <AnimatePresence mode="popLayout">
              {search.trim() === "" ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <MagnifyingGlass size={64} weight="thin" className="text-muted-foreground/30 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-foreground mb-2">Buscar Conversas</h3>
                  <p className="text-sm text-muted-foreground max-w-sm leading-relaxed" id="search-hint">
                    Digite para buscar em títulos e conteúdo de todas as suas conversas
                  </p>
                </motion.div>
              ) : searchResults.length === 0 ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <MagnifyingGlass size={64} weight="thin" className="text-muted-foreground/30 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-foreground mb-2">Nenhum resultado</h3>
                  <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                    Não encontramos conversas correspondentes a "{search}"
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                  role="list"
                  aria-label="Resultados da busca"
                >
                  <div className="px-2 py-1 mb-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider" role="status" aria-live="polite">
                      {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                    </p>
                  </div>
                  {searchResults.map((result, idx) => (
                    <motion.div
                      key={result!.chat.id}
                      ref={el => { resultsRef.current[idx] = el }}
                      role="listitem"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelect(result!.chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelect(result!.chat.id)
                        }
                      }}
                      className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                        selectedIndex === idx 
                          ? 'bg-accent/10 border-accent/30' 
                          : 'border-transparent hover:bg-accent/5 hover:border-accent/20'
                      }`}
                      tabIndex={0}
                      aria-label={`Conversa: ${result!.chat.title}`}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-sm"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          aria-hidden="true"
                        >
                          <Chat size={22} weight="bold" className="text-accent" />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-foreground leading-tight line-clamp-1">
                              {result!.chat.title}
                            </h4>
                            {result!.messageCount > 0 && (
                              <Badge variant="secondary" className="flex-shrink-0 text-xs font-bold">
                                {result!.messageCount} {result!.messageCount === 1 ? 'ocorrência' : 'ocorrências'}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                            {result!.preview}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} weight="bold" aria-hidden="true" />
                              <span className="font-medium">
                                {format(result!.chat.timestamp, "HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CalendarBlank size={14} weight="bold" aria-hidden="true" />
                              <span className="font-medium">
                                {format(result!.chat.timestamp, "dd MMM yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex gap-4 items-center">
              <kbd className="px-2 py-1 bg-background border-2 rounded font-mono font-bold" aria-label="Tecla Escape">ESC</kbd>
              <span>para fechar</span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <kbd className="px-2 py-1 bg-background border-2 rounded font-mono font-bold" aria-label="Setas">↑↓</kbd>
                <span>navegar</span>
              </div>
              <div className="flex gap-2">
                <kbd className="px-2 py-1 bg-background border-2 rounded font-mono font-bold" aria-label="Enter">↵</kbd>
                <span>abrir</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
