"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type PackageManager = "npm" | "yarn" | "pnpm"

type PackageManagerContextType = {
  packageManager: PackageManager
  setPackageManager: (packageManager: PackageManager) => void
}

// Create context with default values
const PackageManagerContext = createContext<PackageManagerContextType>({
  packageManager: "npm",
  setPackageManager: () => {},
})

export function PackageManagerProvider({ children }: { children: React.ReactNode }) {
  // Start with a default value, don't try to access localStorage during initialization
  const [packageManager, setPackageManagerState] = useState<PackageManager>("npm")

  // Handle localStorage only in useEffect, which runs only on the client
  useEffect(() => {
    try {
      const savedPackageManager = window.localStorage.getItem("preferred-package-manager")
      if (savedPackageManager && ["npm", "yarn", "pnpm"].includes(savedPackageManager)) {
        setPackageManagerState(savedPackageManager as PackageManager)
      }
    } catch (error) {
      // Silently handle any localStorage errors
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  const setPackageManager = (newPackageManager: PackageManager) => {
    setPackageManagerState(newPackageManager)

    // Safely try to use localStorage
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("preferred-package-manager", newPackageManager)
      }
    } catch (error) {
      // Silently handle any localStorage errors
      console.error("Error setting localStorage:", error)
    }
  }

  return (
    <PackageManagerContext.Provider value={{ packageManager, setPackageManager }}>
      {children}
    </PackageManagerContext.Provider>
  )
}

export function usePackageManager() {
  return useContext(PackageManagerContext)
}

