import { useConnect, useConnectors } from '@omnisat/lasereyes-react'
import WalletConnectButton from './WalletConnectButton'

export default function SupportedWallets() {
  const connectors = useConnectors()
  const { error } = useConnect()

  return (
    <div className="flex items-center justify-center flex-col gap-4">
      <div className="text-orange-400 text-xl">supported wallets:</div>
      <div className="flex flex-wrap justify-center gap-3">
        {connectors.map(connector => (
          <WalletConnectButton key={connector.id} connector={connector} />
        ))}
      </div>
      {error && (
        <span className="text-red-500 text-sm mt-1 text-center font-normal">{error.message}</span>
      )}
    </div>
  )
}

