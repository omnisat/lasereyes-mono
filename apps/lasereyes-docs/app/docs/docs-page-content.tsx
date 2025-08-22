"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import { Heading } from "@/components/heading"

export function DocsPageContent() {
  return (
    <>
      <Heading level={1}>Introduction to LaserEyes</Heading>
      <p className="text-lg mb-4">
        LaserEyes is a wallet connect library making it easier than ever to quickly build and maintain Bitcoin Ordinal
        Web Apps.
      </p>
      <p className="mb-6">
        This library provides a unified interface to interact with multiple Bitcoin wallets, making it simple to add
        wallet connectivity to your web applications.
      </p>

      <Heading level={2}>Why LaserEyes?</Heading>
      <p className="mb-6">
        Building Bitcoin web applications can be challenging due to the variety of wallet providers and their different
        APIs. LaserEyes solves this problem by providing a unified interface that works with all major Bitcoin wallets.
      </p>

      <Heading level={3}>Key Features</Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Multi-wallet support (UniSat, Xverse, OYL, and more)</li>
        <li>Full support for Bitcoin Ordinals, inscriptions, and BRC-20 tokens</li>
        <li>DataSource abstraction for switching between different Bitcoin data providers</li>
        <li>First-class TypeScript support</li>
        <li>Performance optimized</li>
        <li>Security focused</li>
      </ul>

      <Heading level={3}>Installation</Heading>
      <CodeBlock
        language="bash"
        code={`npm install @kevinoyl/lasereyes-core @kevinoyl/lasereyes-react`}
        copyButton={true}
      />

      <Heading level={3}>Basic Usage</Heading>
      <CodeBlock
        language="typescript"
        code={`import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { MAINNET, UNISAT } from '@kevinoyl/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ network: MAINNET }}
    >
      <WalletConnect />
    </LaserEyesProvider>
  )
}

function WalletConnect() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address 
  } = useLaserEyes()

  const connectWallet = async () => {
    try {
      await connect(UNISAT)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  )
}`}
        fileName="wallet-connect.tsx"
        copyButton={true}
      />

      <WarningBox title="Production API Keys Warning" className="mt-8">
        The API keys included with LaserEyes are intended for development purposes only. For production applications,
        please register for your own API keys with Maestro and/or Sandshrew to ensure reliable service and avoid rate
        limiting issues.
      </WarningBox>
    </>
  )
}

