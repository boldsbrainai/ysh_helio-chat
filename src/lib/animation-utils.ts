export const animationConfig = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

export const springConfig = {
  gentle: { stiffness: 200, damping: 20 },
  default: { stiffness: 300, damping: 30 },
  snappy: { stiffness: 400, damping: 17 },
} as const

export const easingFunctions = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.6, 1],
  spring: { type: "spring", ...springConfig.default },
} as const

export const getReducedMotionVariants = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: {},
    }
  }
  
  return null
}

export const createScaleVariants = (prefersReducedMotion: boolean) => ({
  hover: prefersReducedMotion ? {} : { scale: 1.05 },
  tap: prefersReducedMotion ? {} : { scale: 0.95 },
})

export const createFadeInVariants = (prefersReducedMotion: boolean) => ({
  initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: prefersReducedMotion ? {} : { duration: 0.2 },
})

export const willChangeTransform = { willChange: 'transform' as const }
export const willChangeOpacity = { willChange: 'opacity' as const }
export const willChangeBoth = { willChange: 'transform, opacity' as const }
