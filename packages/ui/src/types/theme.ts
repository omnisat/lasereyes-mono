export type ColorFormat = 'hex' | 'hsl' | 'rgb';

export interface HSLColor {
  h: number; // hue: 0-360
  s: number; // saturation: 0-100
  l: number; // lightness: 0-100
}

export interface ThemeColors {
  primary?: string | HSLColor;
  primaryForeground?: string | HSLColor;
  secondary?: string | HSLColor;
  secondaryForeground?: string | HSLColor;
  accent?: string | HSLColor;
  accentForeground?: string | HSLColor;
  destructive?: string | HSLColor;
  destructiveForeground?: string | HSLColor;
  muted?: string | HSLColor;
  mutedForeground?: string | HSLColor;
  card?: string | HSLColor;
  cardForeground?: string | HSLColor;
  popover?: string | HSLColor;
  popoverForeground?: string | HSLColor;
  background?: string | HSLColor;
  foreground?: string | HSLColor;
  border?: string | HSLColor;
  input?: string | HSLColor;
  ring?: string | HSLColor;
}

export type DarkModeStrategy = 'auto' | 'manual' | 'disabled';

export interface ThemeConfig {
  /**
   * Primary color for the theme - can be hex, hsl string, or HSL object
   * @example "#ff6b35" | "hsl(23, 85%, 56%)" | { h: 23, s: 85, l: 56 }
   */
  primaryColor?: string | HSLColor;
  
  /**
   * Custom colors for light theme
   */
  lightColors?: ThemeColors;
  
  /**
   * Custom colors for dark theme
   */
  darkColors?: ThemeColors;
  
  /**
   * Dark mode configuration
   * - 'auto': Follow system preference
   * - 'manual': Controlled programmatically 
   * - 'disabled': Only light mode
   * @default 'auto'
   */
  darkMode?: DarkModeStrategy;
  
  /**
   * Initial dark mode state when darkMode is 'manual'
   * @default false
   */
  initialDarkMode?: boolean;
  
  /**
   * CSS class name for dark mode
   * @default 'lem-dark'
   */
  darkModeClass?: string;
  
  /**
   * Border radius value (in rem)
   * @default 1
   */
  borderRadius?: number;
}

export interface ThemeState {
  isDark: boolean;
  darkMode: DarkModeStrategy;
  primaryColor: string | HSLColor | null;
  lightColors: ThemeColors;
  darkColors: ThemeColors;
  borderRadius: number;
  darkModeClass: string;
}

export interface ThemeContextValue extends ThemeState {
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  setPrimaryColor: (color: string | HSLColor) => void;
  setLightColors: (colors: Partial<ThemeColors>) => void;
  setDarkColors: (colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
} 