import { useContext } from 'react'
import { ThemeContext } from '../contexts/theme-context'
import type { ThemeContextValue } from '../types/theme'

export default function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
