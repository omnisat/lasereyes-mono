"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Server, Code2, Workflow, GitFork, Layers, ArrowRight, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function DataSourceManagerPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Core Component</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-indigo-500 to-blue-500 bg-clip-text text-transparent">
          DataSource Manager
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          The central orchestrator for Bitcoin data retrieval, providing seamless access to multiple data providers through a unified interface.
        </p>
      </div>

      <ClientPageWrapper>
        <DataSourceManagerContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-indigo-500/10 blur-2xl filter group-hover:bg-indigo-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function DataSourceManagerContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="text-lg leading-relaxed space-y-4">
              <p>
                The DataSource Manager is the central component that orchestrates data retrieval from different Bitcoin data providers.
                It handles provider selection, fallbacks, caching, and data normalization, ensuring your application maintains
                consistent access to blockchain data.
              </p>
              <div className="relative overflow-hidden rounded-lg bg-muted p-4">
                <pre className="text-xs md:text-sm whitespace-pre text-muted-foreground">
                  {`┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
└──────────────────────────┬──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   DataSource Manager                        │
└───────┬─────────────┬─────────────┬─────────────┬─────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Maestro │   │Sandshrew│   │ Mempool │   │ Esplora │
   └─────────┘   └─────────┘   └─────────┘   └─────────┘`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Core Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Database}
            title="Provider Management"
            description="Seamlessly manage multiple data providers with automatic fallback and load balancing."
          />
          <FeatureCard
            icon={Server}
            title="Intelligent Caching"
            description="Built-in caching system to optimize performance and reduce API calls."
          />
          <FeatureCard
            icon={Code2}
            title="Type-Safe Interface"
            description="Fully typed API with TypeScript for a robust development experience."
          />
          <FeatureCard
            icon={Workflow}
            title="Data Normalization"
            description="Consistent data format across different providers through automatic normalization."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Core Methods</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">DataSourceManager Interface</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`interface DataSourceManager {
  // Bitcoin Operations
  getBalance(address: string): Promise<string>
  getUtxos(address: string): Promise<UTXO[]>
  getTransaction(txid: string): Promise<Transaction>
  broadcastTransaction(txHex: string): Promise<string>

  // Ordinals & Inscriptions
  getInscriptions(address: string): Promise<Inscription[]>
  getInscriptionContent(id: string): Promise<string>
  getInscriptionById(id: string): Promise<Inscription>

  // Token Operations
  getMetaBalances(address: string, type: 'brc20' | 'runes'): Promise<any[]>
  getTokenInfo(ticker: string, type: 'brc20' | 'runes'): Promise<any>

  // Network Operations
  estimateFee(targetBlocks?: number): Promise<number>
  getBlockHeight(): Promise<number>
  getAddressHistory(address: string): Promise<Transaction[]>
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Usage Example</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">React Component Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'

function BitcoinData() {
  const { client } = useLaserEyes()
  const [balance, setBalance] = useState('0')
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const manager = client.getDataSourceManager()
        
        // Fetch balance and inscriptions in parallel
        const [balanceResult, inscriptionsResult] = await Promise.all([
          manager.getBalance('bc1p...'),
          manager.getInscriptions('bc1p...')
        ])

        setBalance(balanceResult)
        setInscriptions(inscriptionsResult)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [client])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Balance: {balance} sats</h2>
      <h3>Inscriptions: {inscriptions.length}</h3>
      {/* Render inscriptions */}
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Provider Configuration</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Configuration Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { LaserEyesClient, createConfig, MAINNET } from '@kevinoyl/lasereyes-core'

const config = createConfig({
  network: MAINNET,
  dataSources: {
    // Primary providers
    maestro: {
      apiKey: process.env.MAESTRO_API_KEY,
      priority: 1
    },
    sandshrew: {
      apiKey: process.env.SANDSHREW_API_KEY,
      priority: 2
    },
    // Fallback providers
    mempool: {
      url: 'https://mempool.space/api',
      priority: 3
    },
    esplora: {
      url: 'https://blockstream.info/api',
      priority: 4
    }
  }
})`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Best Practices</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-indigo-500/30">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Providers</h3>
              <p className="text-muted-foreground">
                Configure multiple data providers with different priorities for optimal reliability and performance.
              </p>
            </CardContent>
          </Card>
          <Card className="border-indigo-500/30">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <GitFork className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
              <p className="text-muted-foreground">
                Implement proper error handling and retries for network issues or provider outages.
              </p>
            </CardContent>
          </Card>
          <Card className="border-indigo-500/30">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Caching Strategy</h3>
              <p className="text-muted-foreground">
                Utilize the built-in caching system effectively to reduce API calls and improve response times.
              </p>
            </CardContent>
          </Card>
          <Card className="border-indigo-500/30">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <ArrowRight className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">API Keys</h3>
              <p className="text-muted-foreground">
                Use environment variables for API keys and register for production keys with data providers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
} 