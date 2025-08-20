import ConnectWalletButton from "./components/connection-modal/ConnectButton";
import ConnectWalletModal from "./components/connection-modal/ConnectModal";
import { useLaserEyesModal } from "./providers/LaserEyesModalContext";
import { LaserEyesModalProvider } from "./providers/LaserEyesModalProvider";
import AccountInfo from "./components/user-profile/AccountInfo";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from "./components/ui/select";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useTheme } from "./hooks";
import ThemeControls from "./components/ThemeControls";

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
  ThemeControls
};

// Export types for theme configuration
export type {
  ThemeConfig,
  ThemeColors,
  HSLColor,
  DarkModeStrategy,
  ThemeState,
  ThemeContextValue
} from "./types/theme";

// Export theme utilities
export {
  hexToHsl,
  rgbToHsl,
  parseColorToHsl,
  hslToCssValue,
  generateComplementaryColors,
  applyThemeColors,
  setPrimaryColor,
  applyDarkModeClass,
  getSystemDarkMode,
  onSystemDarkModeChange,
  getDefaultThemeColors
} from "./lib/theme-utils";
