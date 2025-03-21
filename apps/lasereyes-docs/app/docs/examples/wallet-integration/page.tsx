"use client"

import { Heading } from "@/components/heading"
import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"

export default function WalletIntegrationExample() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Heading level={1} className="text-4xl font-bold mb-6">
        💰 Wallet Integration Example
      </Heading>

      <p className="text-lg mb-6">
        Connect to Bitcoin wallets faster than a maximalist can say "have fun staying poor!"
      </p>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        The Problem
      </Heading>

      <p className="mb-4">
        You want to connect to a user's Bitcoin wallet without the complexity of managing wallet connections yourself.
        You need a solution that works across different wallet providers and handles all the edge cases.
      </p>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        The LaserEyes Solution
      </Heading>

      <p className="mb-4">LaserEyes makes wallet integration as easy as ordering pizza (but with fewer calories):</p>

      <CodeBlock
        code={`import { useLaserEyes } from 'laser-eyes';
import { WalletConnectCard } from 'laser-eyes/ui';

export function WalletConnector() {
  const { 
    connect, 
    disconnect, 
    isConnected, 
    wallet, 
    balance 
  } = useLaserEyes();
  
  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
        <WalletConnectCard onConnect={connect} />
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Wallet Connected!</h2>
      <p>Wallet: {wallet.name}</p>
      <p>Address: {wallet.address}</p>
      <p>Balance: {balance} sats</p>
      <button 
        onClick={disconnect}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Disconnect
      </button>
    </div>
  );
}`}
        language="tsx"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        How It Works
      </Heading>

      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>
          We use the <code>useLaserEyes</code> hook to access wallet functionality
        </li>
        <li>
          The <code>WalletConnectCard</code> component provides a pre-styled UI for connecting wallets
        </li>
        <li>When connected, we display wallet info and balance</li>
        <li>The disconnect button lets users disconnect their wallet</li>
      </ol>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Advanced: Custom Wallet Selection
      </Heading>

      <p className="mb-4">For more control over the wallet selection UI:</p>

      <CodeBlock
        code={`import { useLaserEyes } from 'laser-eyes';
import { 
  WalletOption, 
  WalletList 
} from 'laser-eyes/ui';

export function CustomWalletSelector() {
  const { availableWallets, connect } = useLaserEyes();
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Choose Your Weapon</h2>
      <WalletList>
        {availableWallets.map(wallet => (
          <WalletOption
            key={wallet.id}
            name={wallet.name}
            icon={wallet.icon}
            onClick={() => connect(wallet.id)}
          />
        ))}
      </WalletList>
    </div>
  );
}`}
        language="tsx"
      />

      <WarningBox title="Security Note">
        Always verify the wallet connection is secure. LaserEyes handles this for you, but it's good practice to
        understand what's happening under the hood. Never ask users for seed phrases - not even if they offer to send
        you 2 BTC if you send 1 BTC first.
      </WarningBox>

      <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg mt-8">
        <p className="font-semibold">🎉 Achievement Unlocked: Wallet Whisperer</p>
        <p>You can now connect to Bitcoin wallets with the elegance of a blockchain ballet dancer!</p>
      </div>
    </div>
  )
}

