import { HSLColor, ThemeColors } from '../types/theme';

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): HSLColor {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');
  // Check length and enforce 6 character notation
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  } else if (hex.length !== 6) {
    throw new Error('Invalid hex color');
  }
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return rgbToHsl(r, g, b);
}

/**
 * Convert RGB color to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Parse color string to HSL
 */
export function parseColorToHsl(color: string | HSLColor): HSLColor {
  if (typeof color === 'object') {
    return color;
  }
  
  // Check if it's already HSL format
  const hslMatch = color.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
  if (hslMatch) {
    return {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3])
    };
  }
  
  // Check if it's RGB format
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return rgbToHsl(
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3])
    );
  }
  
  // Assume it's hex
  return hexToHsl(color);
}

/**
 * Convert HSL to CSS custom property format (space-separated values)
 */
export function hslToCssValue(hsl: HSLColor): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

/**
 * Generate complementary colors based on primary color
 */
export function generateComplementaryColors(primary: HSLColor): {
  primary: HSLColor;
  primaryForeground: HSLColor;
} {
  // For primary foreground, use high contrast color
  const primaryForeground: HSLColor = {
    h: primary.h,
    s: Math.min(primary.s, 20),
    l: primary.l > 50 ? 10 : 95
  };
  
  return {
    primary,
    primaryForeground
  };
}

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(
  colors: ThemeColors,
  _isDark: boolean,
  customPropertyPrefix: string = '--lem-'
): void {
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([key, value]) => {
    if (value) {
      const cssKey = customPropertyPrefix + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const hslColor = parseColorToHsl(value);
      root.style.setProperty(cssKey, hslToCssValue(hslColor));
    }
  });
}

/**
 * Set primary color and generate related colors
 */
export function setPrimaryColor(
  color: string | HSLColor,
  customPropertyPrefix: string = '--lem-'
): void {
  const primaryHsl = parseColorToHsl(color);
  const { primary, primaryForeground } = generateComplementaryColors(primaryHsl);
  
  const root = document.documentElement;
  root.style.setProperty(customPropertyPrefix + 'primary', hslToCssValue(primary));
  root.style.setProperty(customPropertyPrefix + 'primary-foreground', hslToCssValue(primaryForeground));
}

/**
 * Apply dark mode class to document
 */
export function applyDarkModeClass(isDark: boolean, className: string = 'lem-dark'): void {
  if (isDark) {
    document.documentElement.classList.add(className);
  } else {
    document.documentElement.classList.remove(className);
  }
}

/**
 * Detect system dark mode preference
 */
export function getSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Listen for system dark mode changes
 */
export function onSystemDarkModeChange(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Get default theme colors (fallback values)
 */
export function getDefaultThemeColors(): { light: ThemeColors; dark: ThemeColors } {
  return {
    light: {
      background: { h: 0, s: 0, l: 100 },
      foreground: { h: 0, s: 0, l: 4 },
      card: { h: 0, s: 0, l: 100 },
      cardForeground: { h: 0, s: 0, l: 4 },
      popover: { h: 0, s: 0, l: 100 },
      popoverForeground: { h: 0, s: 0, l: 4 },
      primary: { h: 23, s: 85, l: 56 },
      primaryForeground: { h: 0, s: 0, l: 98 },
      secondary: { h: 0, s: 0, l: 96 },
      secondaryForeground: { h: 0, s: 0, l: 9 },
      muted: { h: 0, s: 0, l: 96 },
      mutedForeground: { h: 0, s: 0, l: 45 },
      accent: { h: 0, s: 0, l: 96 },
      accentForeground: { h: 0, s: 0, l: 9 },
      destructive: { h: 0, s: 84, l: 60 },
      destructiveForeground: { h: 0, s: 0, l: 98 },
      border: { h: 0, s: 0, l: 90 },
      input: { h: 0, s: 0, l: 90 },
      ring: { h: 0, s: 0, l: 4 },
    },
    dark: {
      background: { h: 0, s: 0, l: 4 },
      foreground: { h: 0, s: 0, l: 98 },
      card: { h: 0, s: 0, l: 4 },
      cardForeground: { h: 0, s: 0, l: 98 },
      popover: { h: 0, s: 0, l: 4 },
      popoverForeground: { h: 0, s: 0, l: 98 },
      primary: { h: 36, s: 81, l: 67 },
      primaryForeground: { h: 0, s: 0, l: 9 },
      secondary: { h: 0, s: 0, l: 15 },
      secondaryForeground: { h: 0, s: 0, l: 98 },
      muted: { h: 0, s: 0, l: 15 },
      mutedForeground: { h: 0, s: 0, l: 64 },
      accent: { h: 0, s: 0, l: 15 },
      accentForeground: { h: 0, s: 0, l: 98 },
      destructive: { h: 0, s: 63, l: 31 },
      destructiveForeground: { h: 0, s: 0, l: 98 },
      border: { h: 0, s: 0, l: 15 },
      input: { h: 0, s: 0, l: 15 },
      ring: { h: 0, s: 0, l: 83 },
    }
  };
} 