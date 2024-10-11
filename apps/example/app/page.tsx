'use client'
import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
  LaserEyesProvider
} from '@omnisat/lasereyes-react'


import App from '@/components/App'
import { useState } from 'react'

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
    <LaserEyesProvider config={{ network }}>
      <App setNetwork={setNetwork} />
    </LaserEyesProvider>
  )
}
