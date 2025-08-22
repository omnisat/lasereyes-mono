"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClientPageWrapper } from "@/components/client-page-wrapper"

function UseLaserEyesContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              The <code>useLaserEyes</code> hook is your gateway to Bitcoin wallet integration in React. It provides a simple,
              yet powerful interface to connect wallets, send transactions, and manage Bitcoin-related functionality in your application.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" id="quick-start">
        <h2 className="text-3xl font-bold">Basic Usage</h2>
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Quick Start Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { UNISAT } from '@kevinoyl/lasereyes-core'

function WalletConnect() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address 
  } = useLaserEyes()

  const handleConnect = async () => {
    try {
      await connect(UNISAT)
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Connection State</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Available Properties</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`const { 
  connected,      // Boolean indicating if a wallet is connected
  connecting,     // Boolean indicating if a connection is in progress
  address,        // Connected wallet address
  publicKey,      // Connected wallet public key
  balance,        // Wallet balance in satoshis
  provider,       // Current wallet provider (e.g., UNISAT, XVERSE)
  network,        // Current network (e.g., MAINNET, TESTNET)
} = useLaserEyes()`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Transaction Methods</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example: Sending BTC</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`const { sendBTC } = useLaserEyes()

const handleSend = async () => {
  try {
    // Convert amount to satoshis
    const satoshis = Math.floor(0.001 * 100000000)
    const txid = await sendBTC(
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      satoshis
    )
    console.log('Transaction sent:', txid)
  } catch (error) {
    console.error('Failed to send BTC:', error)
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Error Handling</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Best Practices</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`const { connect, sendBTC } = useLaserEyes()

// Handle specific error types
try {
  await connect(UNISAT)
} catch (err) {
  if (err.code === 'WALLET_NOT_FOUND') {
    alert('Please install UniSat wallet')
  } else if (err.code === 'USER_REJECTED') {
    alert('Connection rejected')
  } else {
    alert('Failed to connect: ' + err.message)
  }
}

// Transaction error handling
try {
  const txid = await sendBTC(recipient, amount)
  alert('Transaction sent: ' + txid)
} catch (err) {
  if (err.code === 'INSUFFICIENT_FUNDS') {
    alert('Not enough BTC')
  } else if (err.code === 'INVALID_ADDRESS') {
    alert('Invalid Bitcoin address')
  } else {
    alert('Transaction failed: ' + err.message)
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Next Steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-green-500">Guide</Badge>
              <h3 className="text-lg font-semibold">LaserEyesProvider</h3>
              <p className="mt-2 text-sm text-muted-foreground">Learn how to configure the provider</p>
              <Link href="/docs/laser-eyes-provider" className="mt-4 inline-block text-green-500 hover:underline">
                Read More →
              </Link>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-blue-500">Guide</Badge>
              <h3 className="text-lg font-semibold">UI Components</h3>
              <p className="mt-2 text-sm text-muted-foreground">Explore ready-to-use components</p>
              <Link href="/docs/ui-components" className="mt-4 inline-block text-blue-500 hover:underline">
                Read More →
              </Link>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-orange-500">Guide</Badge>
              <h3 className="text-lg font-semibold">DataSource System</h3>
              <p className="mt-2 text-sm text-muted-foreground">Understand data providers</p>
              <Link href="/docs/datasource-system" className="mt-4 inline-block text-orange-500 hover:underline">
                Read More →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function UseLaserEyesPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">React Hook</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          useLaserEyes Hook
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          The primary React hook for integrating Bitcoin wallet functionality into your application.
        </p>
      </div>

      <ClientPageWrapper>
        <UseLaserEyesContent />
      </ClientPageWrapper>
    </div>
  )
}

