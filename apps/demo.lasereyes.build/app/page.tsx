'use client'
import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
  LaserEyesProvider,
} from '@omnisat/lasereyes'

import App from '@/components/App'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const DynamicLaserEyesProvider = dynamic(
  () => import('@omnisat/lasereyes-react').then((mod) => mod.LaserEyesProvider),
  { ssr: false }
)

export default function Home() {
  const [network, setNetwork] = useState<
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET
  >(MAINNET)
  return (
    <DynamicLaserEyesProvider config={{ network }}>
      <App setNetwork={setNetwork} />
    </DynamicLaserEyesProvider>
  )
}
