import { useContext } from "react"
import { ThemeContextValue } from "../types/theme"
import { ThemeContext } from "../contexts/theme-context"

export default function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
