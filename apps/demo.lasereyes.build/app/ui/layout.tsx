'use client'

import { LaserEyesModalProvider } from '@kevinoyl/lasereyes-ui'
import { ReactNode } from 'react'
import '@kevinoyl/lasereyes-ui/style'
import { KEPLR, LaserEyesProvider, OYL, UNISAT } from '@kevinoyl/lasereyes'

export default function UILayout({ children }: { children: ReactNode }) {
  return (
    <LaserEyesProvider
      config={{
        dataSources: {
          sandshrew: {
            apiKey: '348ae3256c48c15cc99dcb056d2f78df',
            networks: {
              regtest: {
                apiUrl: 'http://localhost:18888',
                apiKey: '',
              },
            },
          },
        },
      }}
    >
      <LaserEyesModalProvider config={{
        providers: [KEPLR, UNISAT, OYL],
        theme: {
          primaryColor: '#3b82f6', // Blue primary color
          darkMode: 'auto', // Follow system preference
          borderRadius: 1, // Default border radius
        }
      }}>{children}</LaserEyesModalProvider>
    </LaserEyesProvider>
  )
}
