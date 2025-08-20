import ConnectWalletButton from "./components/connection-modal/ConnectButton"
import ConnectWalletModal from "./components/connection-modal/ConnectModal"
import ThemeControls from "./components/ThemeControls"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import AccountInfo from "./components/user-profile/AccountInfo"
import { useTheme } from "./hooks"
import { useLaserEyesModal } from "./providers/LaserEyesModalContext"
import { LaserEyesModalProvider } from "./providers/LaserEyesModalProvider"
import { ThemeProvider } from "./providers/ThemeProvider"

export {
  ConnectWalletModal,
  useLaserEyesModal,
  LaserEyesModalProvider,
  ConnectWalletButton,
  AccountInfo,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  ThemeProvider,
  useTheme,
  ThemeControls,
}

// Export theme utilities
export {
  applyDarkModeClass,
  applyThemeColors,
  generateComplementaryColors,
  getDefaultThemeColors,
  getSystemDarkMode,
  hexToHsl,
  hslToCssValue,
  onSystemDarkModeChange,
  parseColorToHsl,
  rgbToHsl,
  setPrimaryColor,
} from "./lib/theme-utils"
// Export types for theme configuration
export type {
  DarkModeStrategy,
  HSLColor,
  ThemeColors,
  ThemeConfig,
  ThemeContextValue,
  ThemeState,
} from "./types/theme"
