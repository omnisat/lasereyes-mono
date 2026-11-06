'use client'
import { loadAllWallets } from '@omnisat/lasereyes-core/detection'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { useEffect, useState } from 'react'
import App from '@/components/App'
import { config } from '@/lib/lasereyes'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Announce every installed wallet so it can be discovered.
    loadAllWallets()
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <LaserEyesProvider config={config}>
      <App />
    </LaserEyesProvider>
  )
}
