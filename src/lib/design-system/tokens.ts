export const tokens = {
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  borderWidth: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
  
  opacity: {
    0: '0',
    25: '0.25',
    40: '0.4',
    50: '0.5',
    75: '0.75',
    100: '1',
  },
  
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
    dropdown: '1000',
    sticky: '1100',
    fixed: '1200',
    modalBackdrop: '1300',
    modal: '1400',
    popover: '1500',
    tooltip: '1600',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    'solar-sm': '0 1px 2px rgba(255, 214, 10, 0.05), 0 1px 3px rgba(255, 61, 61, 0.1)',
    'solar': '0 4px 6px rgba(255, 214, 10, 0.05), 0 5px 15px rgba(255, 61, 61, 0.1)',
    'solar-lg': '0 10px 15px rgba(255, 214, 10, 0.05), 0 20px 25px rgba(255, 61, 61, 0.1)',
    'solar-glow': '0 0 10px rgba(255, 214, 10, 0.5), 0 0 20px rgba(255, 61, 61, 0.3)',
  },
  
  transitions: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    timing: {
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      linear: 'linear',
      easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
      easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
      solarBounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      solarEnergetic: 'cubic-bezier(0.19, 1, 0.22, 1)',
    },
  },
  
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

export const { borderRadius, borderWidth, opacity, zIndex, shadows, transitions, breakpoints } = tokens;

export type BorderRadius = keyof typeof borderRadius;
export type BorderWidth = keyof typeof borderWidth;
export type Opacity = keyof typeof opacity;
export type ZIndex = keyof typeof zIndex;
export type Shadow = keyof typeof shadows;
export type TransitionDuration = keyof typeof transitions.duration;
export type TransitionTiming = keyof typeof transitions.timing;
export type Breakpoint = keyof typeof breakpoints;
