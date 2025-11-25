import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { User, Sparkle, PencilSimple, ArrowClockwise, Check, X, Copy } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { WidgetRenderer, Widget, WidgetAction } from "@/components/widgets/WidgetRenderer"
import { toast } from "sonner"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

interface MessageProps {
  role: "user" | "assistant"
  content: string
  widget?: Widget
  onEdit?: (newContent: string) => void
  onRegenerate?: () => void
  onWidgetAction?: (action: WidgetAction) => void
  isLastAssistantMessage?: boolean
  isDisabled?: boolean
}

export function Message({ 
  role, 
  content, 
  widget,
  onEdit, 
  onRegenerate, 
  onWidgetAction,
  isLastAssistantMessage, 
  isDisabled 
}: MessageProps) {
  const isUser = role === "user"
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success("Mensagem copiada!")
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  const handleSaveEdit = () => {
    const trimmed = editedContent.trim()
    if (trimmed && trimmed !== content && onEdit) {
      onEdit(trimmed)
    }
    setIsEditing(false)
    setEditedContent(content)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(content)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.2 }}
      style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
      className={`flex gap-3.5 px-4 sm:px-6 py-5 group relative ${
        isUser ? "bg-transparent" : "bg-card/70 backdrop-blur-md border-b border-border/30"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0 pt-0.5">
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotate: 5 }}
          transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
          style={prefersReducedMotion ? {} : { willChange: 'transform' }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
            isUser 
              ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground" 
              : "bg-gradient-to-br from-accent via-accent/90 to-accent/80 text-accent-foreground"
          }`}
        >
          {isUser ? <User size={18} weight="bold" /> : <Sparkle size={18} weight="fill" />}
        </motion.div>
      </div>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2.5">
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none border-2 focus:border-accent text-base"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={!editedContent.trim()} className="bg-accent hover:bg-accent/90 h-8">
                <Check size={15} className="mr-1.5" weight="bold" />
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8">
                <X size={15} className="mr-1.5" weight="bold" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap m-0 break-words">{content}</p>
              {widget && (
                <div className="mt-4">
                  <WidgetRenderer widget={widget} onAction={onWidgetAction} />
                </div>
              )}
            </div>
            {isHovered && !isDisabled && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? {} : { duration: 0.15 }}
                style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
                className="flex gap-1.5 mt-3"
              >
                <motion.div whileHover={prefersReducedMotion ? {} : { scale: 1.05 }} whileTap={prefersReducedMotion ? {} : { scale: 0.95 }} style={prefersReducedMotion ? {} : { willChange: 'transform' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 px-2.5 text-xs hover:bg-accent/10 font-medium"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="mr-1.5" weight="bold" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="mr-1.5" weight="bold" />
                        Copiar
                      </>
                    )}
                  </Button>
                </motion.div>
                {isUser && onEdit && (
                  <motion.div whileHover={prefersReducedMotion ? {} : { scale: 1.05 }} whileTap={prefersReducedMotion ? {} : { scale: 0.95 }} style={prefersReducedMotion ? {} : { willChange: 'transform' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-7 px-2.5 text-xs hover:bg-accent/10 font-medium"
                    >
                      <PencilSimple size={13} className="mr-1.5" weight="bold" />
                      Editar
                    </Button>
                  </motion.div>
                )}
                {!isUser && isLastAssistantMessage && onRegenerate && (
                  <motion.div whileHover={prefersReducedMotion ? {} : { scale: 1.05 }} whileTap={prefersReducedMotion ? {} : { scale: 0.95 }} style={prefersReducedMotion ? {} : { willChange: 'transform' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onRegenerate}
                      className="h-7 px-2.5 text-xs hover:bg-accent/10 font-medium"
                    >
                      <ArrowClockwise size={13} className="mr-1.5" weight="bold" />
                      Regenerar
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
