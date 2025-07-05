'use client'

import { LaserEyesModalProvider } from '@omnisat/lasereyes-ui'
import { ReactNode } from 'react'
import '@omnisat/lasereyes-ui/style'
import { KEPLR, LaserEyesProvider, OYL, UNISAT } from '@omnisat/lasereyes'

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
      }}>{children}</LaserEyesModalProvider>
    </LaserEyesProvider>
  )
}
