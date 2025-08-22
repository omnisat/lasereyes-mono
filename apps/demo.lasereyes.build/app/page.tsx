'use client'
import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  OYLNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '@kevinoyl/lasereyes'
import dynamic from 'next/dynamic'

import App from '@/components/App'
import { useEffect, useState } from 'react'
import { UtxoProvider } from '@/hooks/useUtxos'

const DynamicLasereyesProvider = dynamic(
  () => import('@kevinoyl/lasereyes').then((mod) => mod.LaserEyesProvider),
  { ssr: false }
)

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DynamicLasereyesProvider
      config={{
        dataSources: {
          sandshrew: {
            apiKey: '348ae3256c48c15cc99dcb056d2f78df',
            networks: {
              regtest: {
                apiUrl: "http://localhost:18888",
                apiKey: "",
              }
            }
          },
        },
      }}
    >
      <UtxoProvider>
        <App setNetwork={() => { }} />
      </UtxoProvider>
    </DynamicLasereyesProvider>
  )
}
