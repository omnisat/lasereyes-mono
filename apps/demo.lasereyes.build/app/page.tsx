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
import { useEffect, useState } from 'react'
import { UtxoProvider } from '@/hooks/useUtxos'

const DynamicLasereyesProvider = dynamic(
  () => import('@omnisat/lasereyes').then((mod) => mod.LaserEyesProvider),
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

  const [mounted, setMounted] = useState(false)

  const switchNet = () => {
    if (network === MAINNET) {
      setNetwork(TESTNET4)
    } else if (network === TESTNET4) {
      setNetwork(TESTNET)
    } else if (network === TESTNET) {
      setNetwork(SIGNET)
    } else if (network === SIGNET) {
      setNetwork(FRACTAL_MAINNET)
    } else if (network === FRACTAL_MAINNET) {
      setNetwork(FRACTAL_TESTNET)
    } else {
      setNetwork(MAINNET)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DynamicLasereyesProvider
      config={{
        network: network,
      }}
    >
      <UtxoProvider>
        <App setNetwork={() => {}} />
      </UtxoProvider>
    </DynamicLasereyesProvider>
  )
}
