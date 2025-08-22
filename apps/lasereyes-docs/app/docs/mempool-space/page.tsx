"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Sparkles, Cpu, Rocket, Scale, BarChart3, Shield, Workflow, Database, Code2, ArrowRight, Terminal, Github, Globe, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function MempoolSpacePage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-600/20 via-background to-background p-8">
        {/* Enhanced background effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-blue-400/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Community Favorite</Badge>
          <Badge variant="secondary" className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/20">Open Source</Badge>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Real-time Data</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-sky-500/20 backdrop-blur-sm ring-1 ring-blue-500/20">
            <Activity className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              mempool.space
            </Heading>
            <p className="text-sm text-muted-foreground">Real-time Bitcoin Network Explorer</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          The most advanced Bitcoin mempool visualizer and blockchain explorer. Trusted by the community for real-time network insights.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Global Network</div>
                  <div className="text-xs text-muted-foreground">Worldwide nodes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Real-time Data</div>
                  <div className="text-xs text-muted-foreground">Live updates</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Code2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Open API</div>
                  <div className="text-xs text-muted-foreground">Free access</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Trusted</div>
                  <div className="text-xs text-muted-foreground">Community backed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="https://mempool.space" target="_blank">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 group">
              Explore Network
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="https://github.com/mempool/mempool" target="_blank">
            <Button variant="outline" size="lg" className="group">
              <Github className="mr-2 h-4 w-4" />
              View Source
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <MempoolSpaceContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-blue-500/10 blur-2xl filter group-hover:bg-blue-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-sky-500/20 text-blue-500 ring-1 ring-blue-500/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function MempoolSpaceContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Activity}
            title="Real-time Mempool"
            description="Live visualization of unconfirmed transactions, fees, and network activity with instant updates."
          />
          <FeatureCard
            icon={Globe}
            title="Global Network"
            description="Distributed network of nodes providing reliable and accurate Bitcoin network data."
          />
          <FeatureCard
            icon={Database}
            title="Rich Data"
            description="Comprehensive blockchain data including transactions, blocks, and network statistics."
          />
          <FeatureCard
            icon={BarChart3}
            title="Advanced Analytics"
            description="Detailed fee estimates, network statistics, and historical data analysis."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Getting Started</h2>
        <Card className="overflow-hidden border-2 border-dashed border-blue-500/20">
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
    mempool: {
      url: 'https://mempool.space/api',  // Optional, defaults to this
      priority: 1  // Set as primary data source
    }
  }
})`}
              copyButton={true}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              No API key required! mempool.space provides free access to their public API.
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
    
    // Get network stats
    const blockHeight = await manager.getBlockHeight()
    const feeEstimates = await manager.estimateFee()
    
    // Get address data
    const balance = await manager.getBalance('bc1p...')
    const utxos = await manager.getUtxos('bc1p...')
    const history = await manager.getAddressHistory('bc1p...')
    
    // Get transaction details
    const tx = await manager.getTransaction('abc...')
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Network Features</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Fee Estimation</h3>
              <p className="text-sm text-muted-foreground">Accurate fee estimates based on real-time mempool analysis.</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Block Explorer</h3>
              <p className="text-sm text-muted-foreground">Detailed block and transaction data with visual insights.</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-background">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Network Stats</h3>
              <p className="text-sm text-muted-foreground">Comprehensive network statistics and health metrics.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">Community Driven</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              mempool.space is an open-source project supported by the Bitcoin community. Run your own instance or contribute to the project!
            </p>
            <Link
              href="https://github.com/mempool/mempool"
              className="inline-flex items-center text-blue-500 hover:text-blue-400"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

