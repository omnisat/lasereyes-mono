"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wallet, Database, Code2, Shield, Settings2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function LaserEyesClientContent() {
  return (
    <div className="space-y-10">

      <section className="space-y-6" id="initialization">
        <h2 className="text-3xl font-bold">Initialization</h2>
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h3 className="font-mono text-sm font-medium">Client Setup</h3>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { 
  LaserEyesClient, 
  createStores, 
  createConfig, 
  MAINNET 
} from '@kevinoyl/lasereyes-core'

// Create stores for state management
const stores = createStores()

// Create configuration
const config = createConfig({ 
  network: MAINNET,
  // Optional: Configure data sources
  dataSources: {
    maestro: {
      apiKey: 'your-maestro-api-key', // Optional for development
    },
  },
})

// Create and initialize the client
const client = new LaserEyesClient(stores, config)
client.initialize()

// Now you can use the client
console.log('Client initialized')`}
              fileName="client-initialization.ts"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="wallet-operations">
        <h2 className="text-3xl font-bold">Wallet Operations</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h3 className="font-mono text-sm font-medium">Connection Management</h3>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`// Connect to a wallet
await client.connect(UNISAT)

// Check connection status
const isConnected = client.isConnected()

// Get connected address
const address = client.getAddress()

// Disconnect
await client.disconnect()

// Switch wallet provider
await client.switchProvider(XVERSE)`}
                fileName="wallet-connection.ts"
                copyButton={true}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h3 className="font-mono text-sm font-medium">Transaction Operations</h3>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`// Send BTC
const txid = await client.sendBTC('bc1q...', 10000)

// Sign a message
const signature = await client.signMessage('Hello')

// Sign a PSBT
const signedPsbt = await client.signPsbt(psbtHex)

// Create an inscription
const txid = await client.inscribe(content, 'text/plain')`}
                fileName="transactions.ts"
                copyButton={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6" id="data-retrieval">
        <h2 className="text-3xl font-bold">Data Retrieval</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`// Get balance
const balance = await client.getBalance()

// Get UTXOs
const utxos = await client.getUtxos()

// Get inscriptions
const inscriptions = await client.getInscriptions()

// Get BRC-20 tokens
const tokens = await client.getMetaBalances('brc20')

// Get Runes
const runes = await client.getMetaBalances('runes')

// Estimate fee
const feeRate = await client.estimateFee(1) // For next block`}
              fileName="data-retrieval.ts"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="error-handling">
        <h2 className="text-3xl font-bold">Error Handling</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`try {
  await client.connect(UNISAT)
} catch (error) {
  if (error.code === 'WALLET_NOT_FOUND') {
    console.error('UniSat wallet extension not found')
  } else if (error.code === 'USER_REJECTED') {
    console.error('User rejected the connection request')
  } else {
    console.error('Connection failed:', error.message)
  }
}

try {
  const txid = await client.sendBTC('bc1q...', 10000)
  console.log('Transaction sent:', txid)
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Insufficient funds for this transaction')
  } else if (error.code === 'INVALID_ADDRESS') {
    console.error('Invalid Bitcoin address')
  } else {
    console.error('Transaction failed:', error.message)
  }
}`}
              fileName="error-handling.ts"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="configuration">
        <h2 className="text-3xl font-bold">Configuration</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`const config = createConfig({
  // Required: Bitcoin network
  network: MAINNET, // or TESTNET, SIGNET, etc.
  
  // Optional: Data source configuration
  dataSources: {
    maestro: {
      apiKey: 'your-maestro-api-key',
    },
    sandshrew: {
      apiKey: 'your-sandshrew-api-key',
    },
    mempool: {
      url: 'https://mempool.space/api',
    },
    esplora: 'https://blockstream.info/api',
  },
  
  // Optional: Wallet options
  walletOptions: {
    autoConnect: true, // Try to reconnect to last used wallet
    defaultProvider: UNISAT, // Default wallet provider
    timeout: 30000, // Timeout for wallet operations (ms)
  },
  
  // Optional: Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Optional: Cache options
  cacheOptions: {
    ttl: 60000, // Cache time-to-live (ms)
    maxSize: 100, // Maximum number of items to cache
  },
})`}
              fileName="configuration.ts"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="next-steps">
        <h2 className="text-3xl font-bold">Next Steps</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/docs/data-source-manager" className="block">
            <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Data Source Manager</h3>
                  <p className="text-sm text-muted-foreground">Learn how to interact with Bitcoin data providers</p>
                </div>
                <ArrowRight className="mt-4 h-5 w-5 text-orange-500" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/docs/wallet-providers" className="block">
            <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Wallet Providers</h3>
                  <p className="text-sm text-muted-foreground">Explore the supported wallet providers</p>
                </div>
                <ArrowRight className="mt-4 h-5 w-5 text-orange-500" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default function LaserEyesClientPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Core API</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          LaserEyesClient
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          The central component of the LaserEyes core API, orchestrating wallet connections, transactions, and data retrieval through a unified interface.
        </p>
        <div className="flex gap-4 items-center">
          <Link href="#initialization">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Badge variant="secondary" className="h-7 px-3">v1.0.0</Badge>
        </div>
      </div>

      <LaserEyesClientContent />
    </div>
  )
}

