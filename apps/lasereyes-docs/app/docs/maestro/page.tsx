'use client'

import * as React from 'react'
import { ClientPageWrapper } from '@/components/client-page-wrapper'
import { CodeBlock } from '@/components/code-block'
import { Heading } from '@/components/heading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Sparkles,
  Cpu,
  Rocket,
  Infinity,
  BarChart3,
  Shield,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useTheme } from 'next-themes'

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function MaestroPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-600/20 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant="secondary"
            className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
          >
            Premium Provider
          </Badge>
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          >
            Sponsor
          </Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <MaestroLogo />
          <Heading
            level={1}
            className="bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 bg-clip-text text-transparent"
          >
            Maestro
          </Heading>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          Enterprise-grade Bitcoin data infrastructure. High-performance APIs
          for ordinals, inscriptions, and blockchain data.
        </p>

        <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Infinity className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Unlimited Scale</div>
                  <div className="text-xs text-muted-foreground">
                    No rate limits
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Ultra-fast APIs</div>
                  <div className="text-xs text-muted-foreground">
                    ~50ms latency
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">99.9% Uptime</div>
                  <div className="text-xs text-muted-foreground">
                    Enterprise SLA
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientPageWrapper>
        <MaestroContent />
      </ClientPageWrapper>
    </div>
  )
}

function MaestroLogo() {
  const { theme } = useTheme()
  const logoSrc = theme === 'dark' ? '/maestro-dark.svg' : '/maestro-light.svg'

  return (
    <div className="relative h-12 w-12">
      <Image
        src={logoSrc}
        alt="Maestro Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5',
        className
      )}
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-purple-500/10 blur-2xl filter group-hover:bg-purple-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function MaestroContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Sparkles}
            title="Premium Data Quality"
            description="Enterprise-grade data accuracy with real-time updates and comprehensive coverage of the Bitcoin network."
          />
          <FeatureCard
            icon={Cpu}
            title="High Performance"
            description="Ultra-low latency APIs with ~50ms response times and unlimited scaling capabilities."
          />
          <FeatureCard
            icon={Rocket}
            title="Advanced Indexing"
            description="Sophisticated indexing system for fast queries across inscriptions, ordinals, and transactions."
          />
          <FeatureCard
            icon={BarChart3}
            title="Rich Analytics"
            description="Detailed analytics and insights for ordinals, inscriptions, and blockchain metrics."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Getting Started</h2>
        <Card className="overflow-hidden border-2 border-dashed border-purple-500/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Configuration</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { LaserEyesClient, createConfig, MAINNET } from '@kevinoyl/lasereyes-core'

const config = createConfig({
  network: MAINNET,
  dataSources: {
    maestro: {
      apiKey: process.env.MAESTRO_API_KEY,
      priority: 1  // Set as primary data source
    }
  }
})`}
              copyButton={true}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              Get your API key at{' '}
              <a
                href="https://gomaestro.org"
                className="text-purple-500 hover:text-purple-400"
              >
                maestro.org
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">API Examples</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Fetching Data</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function BitcoinData() {
  const { client } = useLaserEyes()
  
  async function fetchData() {
    const manager = client.getDataSourceManager()
    
    // Get BRC-20 token balances
    const brc20Balances = await manager.getMetaBalances('bc1p...', 'brc20')
    
    // Get inscription content
    const inscription = await manager.getInscriptionContent('123...')
    
    // Get UTXO set
    const utxos = await manager.getUtxos('bc1p...')
    
    // Get detailed transaction data
    const tx = await manager.getTransaction('abc...')
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Advanced Features</h2>
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Workflow className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-4">WebSocket Support</h3>
              <CodeBlock
                language="typescript"
                code={`// Real-time updates for inscriptions and transactions
const ws = new WebSocket('wss://api.maestro.org/v1/ws')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  if (data.type === 'inscription') {
    console.log('New inscription:', data.inscription)
  }
  
  if (data.type === 'transaction') {
    console.log('New transaction:', data.transaction)
  }
}`}
                copyButton={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Enterprise Features</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Dedicated Support</h3>
              <p className="text-sm text-muted-foreground">
                24/7 technical support with dedicated account management.
              </p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Custom Solutions</h3>
              <p className="text-sm text-muted-foreground">
                Tailored solutions and custom API endpoints for your needs.
              </p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">SLA Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                99.9% uptime guarantee with enterprise SLA.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
