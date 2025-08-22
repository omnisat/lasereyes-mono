"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Code2, ArrowRight, Send, Coins, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from 'react'
import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import {
  MAINNET,
  UNISAT,
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE
} from '@kevinoyl/lasereyes-core'

interface StepCardProps {
  step: number
  title: string
  description: string
  children: React.ReactNode
}

function StepCard({ step, title, description, children }: StepCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter" />
      <CardHeader className="border-b bg-muted/50 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 font-semibold">
            {step}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="mb-4 text-muted-foreground">{description}</p>
        {children}
      </CardContent>
    </Card>
  )
}

function HelloWorldContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              Let's build a simple application with LaserEyes to connect a wallet, display the balance, and send a
              transaction. This example will demonstrate the core features of LaserEyes in a practical way.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="complete-example">
        <h2 className="text-3xl font-bold">Complete Example</h2>
        <p className="text-lg mb-4">This example demonstrates a basic React application that:</p>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Wallet Connection</h3>
              <p className="text-sm text-muted-foreground">Connects to multiple Bitcoin wallets seamlessly</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Balance Display</h3>
              <p className="text-sm text-muted-foreground">Shows wallet address and current BTC balance</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Send BTC</h3>
              <p className="text-sm text-muted-foreground">Enables sending BTC to other addresses</p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-medium">Complete Example</h3>
              <Badge variant="secondary">hello-world.tsx</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { useState } from 'react'
import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { 
  MAINNET, 
  UNISAT, 
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE
} from '@kevinoyl/lasereyes-core'

// Main App Component
export default function App() {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-8">LaserEyes Hello World</h1>
        <WalletDemo />
      </div>
    </LaserEyesProvider>
  )
}

// Wallet Demo Component
function WalletDemo() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address, 
    balance, 
    sendBTC 
  } = useLaserEyes()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txId, setTxId] = useState('')

  // Connect wallet function
  const connectWallet = async (provider) => {
    setError('')
    setLoading(true)
    try {
      await connect(provider)
    } catch (error) {
      setError(error.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  // Format balance from satoshis to BTC
  const formatBalance = () => {
    if (!balance) return '0'
    return (Number(balance) / 100000000).toFixed(8)
  }

  // Send BTC function
  const handleSendBTC = async () => {
    if (!recipient || !amount) {
      setError('Please enter recipient address and amount')
      return
    }
    
    setError('')
    setTxId('')
    setLoading(true)
    
    try {
      // Convert amount to satoshis
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      const result = await sendBTC(recipient, satoshis)
      setTxId(result)
      setRecipient('')
      setAmount('')
    } catch (error) {
      setError(error.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => connectWallet(UNISAT)}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Connect UniSat
          </button>
          <button
            onClick={() => connectWallet(XVERSE)}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Connect Xverse
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Wallet Info</h2>
        <p className="mb-2">Address: {address}</p>
        <p className="mb-4">Balance: {formatBalance()} BTC</p>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Send BTC</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
              placeholder="Enter Bitcoin address"
            />
          </div>
          <div>
            <label className="block mb-1">Amount (BTC)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
              placeholder="0.00000000"
              step="0.00000001"
            />
          </div>
          <button
            onClick={handleSendBTC}
            disabled={loading}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Send
          </button>
          {error && <p className="text-red-500">{error}</p>}
          {txId && (
            <p className="text-green-500">
              Transaction sent! TXID: {txId}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="step-by-step">
        <h2 className="text-3xl font-bold">Step-by-Step Explanation</h2>
        <div className="grid gap-6">
          <StepCard
            step={1}
            title="Setting up the Provider"
            description="First, wrap your application with the LaserEyesProvider component to enable wallet functionality:"
          >
            <CodeBlock
              language="tsx"
              code={`<LaserEyesProvider config={{ network: MAINNET }}>
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 className="text-2xl font-bold mb-8">LaserEyes Hello World</h1>
    <WalletDemo />
  </div>
</LaserEyesProvider>`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={2}
            title="Connecting to a Wallet"
            description="Use the useLaserEyes hook to access wallet connection methods:"
          >
            <CodeBlock
              language="tsx"
              code={`const { connect } = useLaserEyes()

// Connect wallet function
const connectWallet = async (provider) => {
  setError('')
  setLoading(true)
  try {
    await connect(provider)
  } catch (error) {
    setError(error.message || 'Failed to connect wallet')
  } finally {
    setLoading(false)
  }
}`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={3}
            title="Reading Wallet Balance"
            description="Access and format the wallet balance using the hook:"
          >
            <CodeBlock
              language="tsx"
              code={`const { balance } = useLaserEyes()

// Get balance in BTC
const formatBalance = () => {
  if (!balance) return '0'
  // Convert from satoshis to BTC
  return (Number(balance) / 100000000).toFixed(8)
}`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={4}
            title="Sending a Transaction"
            description="Implement BTC sending functionality with proper error handling:"
          >
            <CodeBlock
              language="tsx"
              code={`const { sendBTC } = useLaserEyes()

// Send BTC function
const handleSendBTC = async () => {
  if (!recipient || !amount) {
    setError('Please enter recipient address and amount')
    return
  }
  
  setError('')
  setTxId('')
  setLoading(true)
  
  try {
    // Convert amount to satoshis
    const satoshis = Math.floor(parseFloat(amount) * 100000000)
    const result = await sendBTC(recipient, satoshis)
    setTxId(result)
  } catch (error) {
    setError(error.message || 'Transaction failed')
  } finally {
    setLoading(false)
  }
}`}
              copyButton={true}
            />
          </StepCard>
        </div>

        <WarningBox title="Testing Transactions" className="mt-6">
          <p>
            When testing transactions, it's recommended to use a testnet network to avoid using real BTC. You can configure
            LaserEyes to use testnet by setting <code>network: TESTNET</code> in the provider config.
          </p>
        </WarningBox>
      </section>

      <section className="space-y-6" id="inscriptions">
        <h2 className="text-3xl font-bold">Working with Inscriptions</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-medium">Inscriptions Example</h3>
              <Badge variant="secondary">inscriptions-list.tsx</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-6 text-muted-foreground">
              LaserEyes also supports working with Bitcoin Ordinals and inscriptions. Here's a complete example showing how to list inscriptions and create new ones:
            </p>
            <CodeBlock
              language="tsx"
              code={`import { useState, useEffect } from 'react'
import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function InscriptionsList() {
  const { 
    getInscriptions, 
    inscribe, 
    connected, 
    address 
  } = useLaserEyes()

  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const [inscribing, setInscribing] = useState(false)
  const [txId, setTxId] = useState('')

  // Load inscriptions
  useEffect(() => {
    if (connected) {
      loadInscriptions()
    }
  }, [connected, address])

  const loadInscriptions = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getInscriptions()
      setInscriptions(result)
    } catch (error) {
      setError(error.message || 'Failed to load inscriptions')
    } finally {
      setLoading(false)
    }
  }

  // Create new inscription
  const handleInscribe = async () => {
    if (!content) {
      setError('Please enter content to inscribe')
      return
    }

    setInscribing(true)
    setError('')
    setTxId('')

    try {
      const result = await inscribe(content, 'text/plain')
      setTxId(result)
      setContent('')
      // Reload inscriptions after successful inscription
      await loadInscriptions()
    } catch (error) {
      setError(error.message || 'Failed to create inscription')
    } finally {
      setInscribing(false)
    }
  }

  if (!connected) {
    return <p>Please connect your wallet first</p>
  }

  return (
    <div className="space-y-8 w-full max-w-md">
      {/* Create New Inscription */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Create Inscription</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
              placeholder="Enter text to inscribe"
              rows={4}
            />
          </div>
          <button
            onClick={handleInscribe}
            disabled={inscribing || !content}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {inscribing ? 'Creating Inscription...' : 'Create Inscription'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
          {txId && (
            <p className="text-green-500">
              Inscription created! TXID: {txId}
            </p>
          )}
        </div>
      </div>

      {/* List Inscriptions */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Inscriptions</h2>
          <button
            onClick={loadInscriptions}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <p>Loading inscriptions...</p>
        ) : inscriptions.length > 0 ? (
          <div className="space-y-4">
            {inscriptions.map((inscription: any) => (
              <div
                key={inscription.id}
                className="border dark:border-gray-700 rounded p-3"
              >
                <p className="text-sm mb-1">
                  ID: {inscription.id}
                </p>
                <p className="text-sm mb-1">
                  Number: {inscription.number}
                </p>
                <p className="text-sm">
                  Content Type: {inscription.contentType}
                </p>
                {inscription.contentType.startsWith('text/') && (
                  <p className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                    {inscription.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No inscriptions found</p>
        )}
      </div>
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <WarningBox title="Inscription Fees" className="mt-6">
          <p>
            Creating inscriptions requires paying Bitcoin network fees. Make sure you have enough BTC in your wallet to cover both the inscription and the network fees. The exact fee will depend on network conditions and inscription size.
          </p>
        </WarningBox>

        <Card className="overflow-hidden mt-6">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h3 className="font-mono text-sm font-medium">Key Features</h3>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="list-disc pl-6 space-y-2">
              <li>List all inscriptions owned by the connected wallet</li>
              <li>Create new text inscriptions</li>
              <li>Display inscription details including ID, number, and content</li>
              <li>Handle loading states and errors</li>
              <li>Automatic refresh after creating new inscriptions</li>
              <li>Support for viewing text-based inscription content</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <div className="grid gap-4">
              {[
                {
                  href: "/docs/wallet-connection",
                  title: "Wallet Connection",
                  description: "Learn more about connecting to different wallets",
                  icon: Wallet
                },
                {
                  href: "/docs/basic-transactions",
                  title: "Basic Transactions",
                  description: "Explore more transaction types",
                  icon: Send
                },
                {
                  href: "/docs/inscriptions",
                  title: "Working with Inscriptions",
                  description: "Learn how to create and transfer inscriptions",
                  icon: FileCode
                },
                {
                  href: "/docs/brc20",
                  title: "BRC-20 Operations",
                  description: "Work with BRC-20 tokens",
                  icon: Code2
                }
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-orange-500 transition-colors">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function HelloWorldPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Example</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Hello World Example
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Build your first Bitcoin application with LaserEyes in this step-by-step guide.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="#complete-example">
            <Button variant="default" className="group">
              View Complete Example
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#step-by-step">
            <Button variant="outline" className="group">
              Step-by-Step Guide
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#inscriptions">
            <Button variant="outline" className="group">
              Inscriptions Example
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      <HelloWorldContent />
    </div>
  )
}

