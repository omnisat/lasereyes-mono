import ConnectWalletModal from '../components/connection-modal/ConnectModal'
import type { LaserEyesModalConfig } from '../types/config'
import {
  MAINNET,
  SIGNET,
  TESTNET,
  useLaserEyes,
} from '@omnisat/lasereyes-react'
import { type ReactNode, useCallback, useState } from 'react'
import { laserEyesModalContext } from './LaserEyesModalContext'

export function LaserEyesModalProvider({
  children,
  config,
}: {
  children: ReactNode | ReactNode[]
  config?: LaserEyesModalConfig
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalConfig, setConfig] = useState<LaserEyesModalConfig>(
    config || {
      networks: [MAINNET, TESTNET, SIGNET],
      defaultNetwork: MAINNET,
    }
  )
  const { isConnecting, connected } = useLaserEyes()
  const isLoading = isOpen || isConnecting

  const showModal = useCallback(() => {
    if (!connected) setIsOpen(true)
  }, [connected])
  const hideModal = useCallback(() => setIsOpen(false), [])

  return (
    <laserEyesModalContext.Provider
      value={{
        isOpen,
        isLoading,
        showModal,
        hideModal,
        config: modalConfig,
        setConfig,
      }}
    >
      {children}
      <ConnectWalletModal
        onClose={() => setIsOpen(false)}
        open={isOpen && !connected}
      />
    </laserEyesModalContext.Provider>
  )
}
