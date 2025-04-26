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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DynamicLasereyesProvider>
      <UtxoProvider>
        <App setNetwork={() => {}} />
      </UtxoProvider>
    </DynamicLasereyesProvider>
  )
}
