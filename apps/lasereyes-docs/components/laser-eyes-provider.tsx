"use client"

import { LaserEyesProvider as Provider } from "@kevinoyl/lasereyes-react"
import { MAINNET } from "@kevinoyl/lasereyes-core"
import type { ReactNode } from "react"

interface LaserEyesProviderProps {
  children: ReactNode
}

export function LaserEyesProvider({ children }: LaserEyesProviderProps) {
  return (
    <Provider
      config={{
        network: MAINNET,
        dataSources: {
          // Use Maestro for Bitcoin data
          maestro: {
            // Using development API key
          },
          // Use Sandshrew as an alternative
          sandshrew: {
            // Using development API key
          },
        },
      }}
    >
      {children}
    </Provider>
  )
}

