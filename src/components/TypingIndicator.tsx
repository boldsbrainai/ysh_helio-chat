import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

export function TypingIndicator() {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className="flex items-center gap-1.5 p-3">
        <div className="w-2.5 h-2.5 bg-muted-foreground rounded-full opacity-70" />
        <div className="w-2.5 h-2.5 bg-muted-foreground rounded-full opacity-70" />
        <div className="w-2.5 h-2.5 bg-muted-foreground rounded-full opacity-70" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 p-3">
      <motion.div 
        className="w-2.5 h-2.5 bg-muted-foreground rounded-full"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div 
        className="w-2.5 h-2.5 bg-muted-foreground rounded-full"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1,
          delay: 0.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div 
        className="w-2.5 h-2.5 bg-muted-foreground rounded-full"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 1,
          delay: 0.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ willChange: 'transform, opacity' }}
      />
    </div>
  )
}
