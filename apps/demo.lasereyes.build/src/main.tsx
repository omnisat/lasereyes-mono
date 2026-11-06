import { loadAllWallets } from '@omnisat/lasereyes-core/detection'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import { Toaster } from './components/ui/sonner'
import { config } from './lib/lasereyes'
import './index.css'

function Root() {
  useEffect(() => {
    // Announce every installed wallet so it can be discovered.
    loadAllWallets()
  }, [])

  return (
    <LaserEyesProvider config={config}>
      <App />
      <Toaster />
    </LaserEyesProvider>
  )
}

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <StrictMode>
      <Root />
    </StrictMode>
  )
}
