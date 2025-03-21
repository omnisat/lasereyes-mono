"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "lasereyes-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Start with the default theme, don't try to access localStorage during initialization
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  // Load theme from localStorage only on the client side
  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(storageKey) as Theme
      if (savedTheme && ["dark", "light", "system"].includes(savedTheme)) {
        setTheme(savedTheme)
      }
    } catch (error) {
      // Silently handle any localStorage errors
      console.error("Error accessing localStorage:", error)
    }
  }, [storageKey])

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, newTheme)
        }
        setTheme(newTheme)
      } catch (error) {
        // Silently handle any localStorage errors
        console.error("Error setting localStorage:", error)
        setTheme(newTheme)
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

