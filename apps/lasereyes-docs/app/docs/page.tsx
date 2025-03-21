"use client"

import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <Heading>Introduction to LaserEyes</Heading>

      <ClientPageWrapper>
        <DocsPageContent />
      </ClientPageWrapper>
    </div>
  )
}

// Client component with all the content
function DocsPageContent() {
  return (
    <div className="space-y-6">
      <p>
        LaserEyes is a wallet connect library making it easier than ever to quickly build and maintain Bitcoin Ordinal
        Web Apps.
      </p>

      <p>
        This library provides a unified interface to interact with multiple Bitcoin wallets, making it simple to add
        wallet connectivity to your web applications.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Why LaserEyes?</h2>
      <p>
        Building Bitcoin web applications can be challenging due to the variety of wallet providers and their different
        APIs. LaserEyes solves this problem by providing a unified interface that works with all major Bitcoin wallets.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Key Features</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Multi-wallet support (UniSat, Xverse, OYL, and more)</li>
        <li>Full support for Bitcoin Ordinals, inscriptions, and BRC-20 tokens</li>
        <li>DataSource abstraction for switching between different Bitcoin data providers</li>
        <li>First-class TypeScript support</li>
        <li>Performance optimized</li>
        <li>Security focused</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Installation</h2>
                <CodeBlock
                  language="bash"
                  code={`npm install @omnisat/lasereyes-core @omnisat/lasereyes-react`}
                  copyButton={true}
                />

      <h2 className="text-2xl font-bold mt-8 mb-4">Basic Usage</h2>
                <CodeBlock
                  language="bash"
                  code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { MAINNET, UNISAT } from '@omnisat/lasereyes-core'

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

  return (
    <div>
      {connected ? (
        <>
          <div>Connected: {address}</div>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={() => connect(UNISAT)}>Connect Wallet</button>
      )}
    </div>
  )
}`}
                  copyButton={true}
                />
    </div>
  )
}

