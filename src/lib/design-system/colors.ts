export const brandColors = {
  solarYellow: {
    DEFAULT: "#FFD60A",
    50: "#FFFDF0",
    100: "#FFF9D1",
    200: "#FFEE9E",
    300: "#FFE46B",
    400: "#FFDA38",
    500: "#FFD60A",
    600: "#D6B100",
    700: "#A38700",
    800: "#705D00",
    900: "#3D3300",
    950: "#241E00",
  },
  energyRed: {
    DEFAULT: "#FF3D3D",
    50: "#FFF0F0",
    100: "#FFE0E0",
    200: "#FFC2C2",
    300: "#FFA3A3",
    400: "#FF7070",
    500: "#FF3D3D",
    600: "#FF0A0A",
    700: "#D60000",
    800: "#A30000",
    900: "#700000",
    950: "#240000",
  },
  powerPink: {
    DEFAULT: "#FF0066",
    50: "#FFF0F6",
    100: "#FFE0ED",
    200: "#FFC2DB",
    300: "#FFA3C9",
    400: "#FF70A8",
    500: "#FF0066",
    600: "#D60055",
    700: "#A30041",
    800: "#70002C",
    900: "#3D0018",
    950: "#24000E",
  },
  solarOrange: {
    DEFAULT: "#FF9F1C",
    50: "#FFF8F0",
    100: "#FFEFD1",
    200: "#FFDFA3",
    300: "#FFCF75",
    400: "#FFBF47",
    500: "#FF9F1C",
    600: "#E88600",
    700: "#B56700",
    800: "#824800",
    900: "#4F2A00",
    950: "#2E1900",
  },
};

export const semanticColors = {
  success: {
    DEFAULT: "#10B981",
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
    950: "#022C22",
  },
  warning: {
    DEFAULT: "#F59E0B",
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
    950: "#451A03",
  },
  error: {
    DEFAULT: "#EF4444",
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
    950: "#450A0A",
  },
  info: {
    DEFAULT: "#3B82F6",
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    950: "#172554",
  },
};

export const energyStatusColors = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};

export const lightNeutrals = {
  background: "#FFFFFF",
  foreground: "#18181B",
  card: "#FFFFFF",
  cardForeground: "#18181B",
  popover: "#FFFFFF",
  popoverForeground: "#18181B",
  primary: "#FFD60A",
  primaryForeground: "#18181B",
  secondary: "#F4F4F5",
  secondaryForeground: "#18181B",
  muted: "#F4F4F5",
  mutedForeground: "#71717A",
  accent: "#F4F4F5",
  accentForeground: "#18181B",
  destructive: "#FF3D3D",
  destructiveForeground: "#FFFFFF",
  border: "#E4E4E7",
  input: "#E4E4E7",
  ring: "#FFD60A",
};

export const darkNeutrals = {
  background: "#09090B",
  foreground: "#FAFAFA",
  card: "#09090B",
  cardForeground: "#FAFAFA",
  popover: "#09090B",
  popoverForeground: "#FAFAFA",
  primary: "#FFD60A",
  primaryForeground: "#18181B",
  secondary: "#27272A",
  secondaryForeground: "#FAFAFA",
  muted: "#27272A",
  mutedForeground: "#A1A1AA",
  accent: "#27272A",
  accentForeground: "#FAFAFA",
  destructive: "#FF3D3D",
  destructiveForeground: "#FAFAFA",
  border: "#27272A",
  input: "#27272A",
  ring: "#FFD60A",
};

export const gradients = {
  solarGradient: "linear-gradient(to right, #FFD60A, #FF3D3D, #FF0066)",
  solarGradientVertical: "linear-gradient(to bottom, #FFD60A, #FF3D3D, #FF0066)",
  solarGradientSubtle: "linear-gradient(to right, rgba(255, 214, 10, 0.2), rgba(255, 61, 61, 0.2), rgba(255, 0, 102, 0.2))",
  solarProduction: "linear-gradient(to top, #FFD60A, #FF9F1C)",
  solarConsumption: "linear-gradient(to top, #FF3D3D, #FF0066)",
  solarEnergy: "linear-gradient(to right, #FFD60A, #10B981)",
};

export const colors = {
  brand: brandColors,
  semantic: semanticColors,
  energyStatus: energyStatusColors,
  light: lightNeutrals,
  dark: darkNeutrals,
  gradients,
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const hexToHsl = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "0 0% 0%";
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
};

export default colors;
