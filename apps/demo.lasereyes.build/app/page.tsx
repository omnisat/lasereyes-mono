'use client'
import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '@omnisat/lasereyes'
import dynamic from 'next/dynamic'

import App from '@/components/App'
import { useState } from 'react'
import { UtxoProvider } from '@/hooks/useUtxos'

const DynamicLasereyesProvider = dynamic(
  () => import('@omnisat/lasereyes').then((mod) => mod.LaserEyesProvider),
  { ssr: false }
)

export default function Home() {
  const [network] = useState<
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET
  >(MAINNET)
  return (
    <DynamicLasereyesProvider config={{ network }}>
      <UtxoProvider network={network}>
        <App />
      </UtxoProvider>
    </DynamicLasereyesProvider>
  )
}
