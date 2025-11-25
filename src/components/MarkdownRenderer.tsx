import { useMemo } from "react"
import { marked } from "marked"
import { motion } from "framer-motion"
import { Copy, Check } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    })
    return marked(content)
  }, [content])

  return (
    <div 
      className="markdown-content prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html as string }}
    />
  )
}

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = "text" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Código copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-4 rounded-xl overflow-hidden border-2 border-border shadow-md hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-muted/80 to-muted/50 border-b border-border">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent/10 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check size={16} weight="bold" className="text-green-600" />
              <span className="text-green-600">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={16} weight="bold" />
              <span>Copiar</span>
            </>
          )}
        </motion.button>
      </div>
      <div className="bg-muted/30 p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-foreground leading-relaxed m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-2 py-0.5 bg-muted/70 border border-border rounded-md text-sm font-mono text-accent font-semibold">
      {children}
    </code>
  )
}
