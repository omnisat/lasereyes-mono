"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Sparkles, Cpu, Rocket, Scale, BarChart3, Shield, Workflow, Database, Code2, ArrowRight, Terminal, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function SandshrewPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-emerald-600/20 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-emerald-400/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">High Performance</Badge>
          <Badge variant="secondary" className="bg-teal-500/10 text-teal-500 hover:bg-teal-500/20">Open Source</Badge>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Sponsor</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm ring-1 ring-emerald-500/20">
            <Database className="h-7 w-7 text-emerald-500" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Sandshrew
            </Heading>
            <p className="text-sm text-muted-foreground">Enterprise-grade Bitcoin Indexer</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          High-performance, open-source Bitcoin indexer and API. Built for speed, reliability, and scalability.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Scale className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Scalable</div>
                  <div className="text-xs text-muted-foreground">Handles high load</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Lightning Fast</div>
                  <div className="text-xs text-muted-foreground">Sub-100ms queries</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Code2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Open Source</div>
                  <div className="text-xs text-muted-foreground">MIT Licensed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Terminal className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Easy Setup</div>
                  <div className="text-xs text-muted-foreground">Docker ready</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="https://sandshrew.io" target="_blank">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="https://github.com/sandshrew/sandshrew" target="_blank">
            <Button variant="outline" size="lg" className="group">
              <Github className="mr-2 h-4 w-4" />
              View Source
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <SandshrewContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/10 blur-2xl filter group-hover:bg-emerald-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-500 ring-1 ring-emerald-500/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function SandshrewContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Sparkles}
            title="Advanced Indexing"
            description="Efficient indexing of Bitcoin transactions, UTXOs, ordinals, and inscriptions with optimized storage."
          />
          <FeatureCard
            icon={Cpu}
            title="High Performance"
            description="Built for speed with Rust and optimized database queries for minimal latency."
          />
          <FeatureCard
            icon={Rocket}
            title="Easy Deployment"
            description="Simple setup with Docker and comprehensive documentation for quick deployment."
          />
          <FeatureCard
            icon={BarChart3}
            title="Rich API"
            description="Comprehensive REST API with WebSocket support for real-time updates."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Getting Started</h2>
        <Card className="overflow-hidden border-2 border-dashed border-emerald-500/20">
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
    sandshrew: {
      apiKey: process.env.SANDSHREW_API_KEY,
      priority: 1  // Set as primary data source
    }
  }
})`}
              copyButton={true}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              Get your API key at <a href="https://sandshrew.io" className="text-emerald-500 hover:text-emerald-400">sandshrew.io</a>
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
    
    // Get address balance and UTXOs
    const balance = await manager.getBalance('bc1p...')
    const utxos = await manager.getUtxos('bc1p...')
    
    // Get ordinals and inscriptions
    const inscriptions = await manager.getInscriptions('bc1p...')
    const content = await manager.getInscriptionContent('123...')
    
    // Get BRC-20 and runes data
    const brc20 = await manager.getMetaBalances('bc1p...', 'brc20')
    const runes = await manager.getMetaBalances('bc1p...', 'runes')
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
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Workflow className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Updates</h3>
              <CodeBlock
                language="typescript"
                code={`// Subscribe to real-time updates
const ws = new WebSocket('wss://api.sandshrew.io/v1/ws')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  // Handle different event types
  switch (data.type) {
    case 'block':
      console.log('New block:', data.block)
      break
    case 'tx':
      console.log('New transaction:', data.tx)
      break
    case 'inscription':
      console.log('New inscription:', data.inscription)
      break
  }
}`}
                copyButton={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Self-Hosting</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Docker Support</h3>
              <p className="text-sm text-muted-foreground">Easy deployment with official Docker images and compose files.</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Full Control</h3>
              <p className="text-sm text-muted-foreground">Run your own instance with complete control over data and settings.</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-sm text-muted-foreground">Active community and maintainers for support and contributions.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">Open Source</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Sandshrew is open source under the MIT license. We welcome contributions from the community!
            </p>
            <Link
              href="https://github.com/sandshrew/sandshrew"
              className="inline-flex items-center text-emerald-500 hover:text-emerald-400"
            >
              View on GitHub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

