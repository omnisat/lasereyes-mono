"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Network, Globe, Zap, Shield, ArrowRight, Blocks, Laptop, Server, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function NetworkSupportPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        {/* Enhanced background effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-orange-800/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Multi-Network</Badge>
          <Badge variant="secondary" className="bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/20">Testnet Ready</Badge>
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Mainnet Secure</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-orange-900/20 to-yellow-900/20 backdrop-blur-sm ring-1 ring-orange-900/20">
            <Network className="h-7 w-7 text-orange-400" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Network Support
            </Heading>
            <p className="text-sm text-muted-foreground">Seamless Bitcoin Network Integration</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          Build with confidence across Bitcoin networks. Full support for mainnet and testnet with automatic network detection and switching.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Globe className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Mainnet</div>
                  <div className="text-xs text-muted-foreground">Production ready</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Laptop className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Testnet</div>
                  <div className="text-xs text-muted-foreground">Development</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Server className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Regtest</div>
                  <div className="text-xs text-muted-foreground">Local testing</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Wifi className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Auto-Switch</div>
                  <div className="text-xs text-muted-foreground">Smart detection</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="#implementation">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 group">
              Configure Networks
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#examples">
            <Button variant="outline" size="lg" className="group">
              <Blocks className="mr-2 h-4 w-4" />
              View Examples
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <NetworkSupportContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 text-orange-400 ring-1 ring-orange-500/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function NetworkSupportContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Globe}
            title="Multi-Network Support"
            description="Full support for Bitcoin mainnet, testnet, and regtest networks with seamless switching."
          />
          <FeatureCard
            icon={Shield}
            title="Network Safety"
            description="Built-in safeguards to prevent accidental mainnet transactions during testing."
          />
          <FeatureCard
            icon={Zap}
            title="Auto Detection"
            description="Automatic network detection from connected wallets and data providers."
          />
          <FeatureCard
            icon={Server}
            title="Custom Networks"
            description="Support for custom network configurations and local development environments."
          />
        </div>
      </section>

      <section id="implementation" className="space-y-6">
        <h2 className="text-3xl font-bold">Network Configuration</h2>
        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Basic Setup</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { LaserEyesClient, createConfig, MAINNET, TESTNET } from '@kevinoyl/lasereyes-core'

// Mainnet configuration
const mainnetConfig = createConfig({
  network: MAINNET,
  dataSources: {
    mempool: { priority: 1 },
    maestro: { priority: 2 }
  }
})

// Testnet configuration
const testnetConfig = createConfig({
  network: TESTNET,
  dataSources: {
    mempool: {
      url: 'https://mempool.space/testnet/api',
      priority: 1
    }
  }
})`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Network Detection</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Auto Detection</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function NetworkStatus() {
  const { network, switchNetwork } = useLaserEyes()
  
  return (
    <div>
      <div>Current Network: {network}</div>
      <button onClick={() => switchNetwork(TESTNET)}>
        Switch to Testnet
      </button>
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section id="examples" className="space-y-6">
        <h2 className="text-3xl font-bold">Advanced Examples</h2>
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h2 className="font-mono text-sm font-medium">Custom Network Configuration</h2>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`import { NetworkType, createConfig } from '@kevinoyl/lasereyes-core'

// Define custom network
const CUSTOM_NETWORK: NetworkType = {
  name: 'custom',
  networkId: 'bitcoin-custom',
  bech32: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05
}

// Create configuration
const config = createConfig({
  network: CUSTOM_NETWORK,
  dataSources: {
    custom: {
      url: 'https://your-bitcoin-node.com',
      priority: 1
    }
  }
})`}
                copyButton={true}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h2 className="font-mono text-sm font-medium">Network Event Handling</h2>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useEffect } from 'react'

function NetworkMonitor() {
  const { network, client } = useLaserEyes()

  useEffect(() => {
    const unsubscribe = client.on('networkChange', (newNetwork) => {
      console.log('Network changed:', newNetwork)
      // Update your app's state accordingly
    })

    return () => unsubscribe()
  }, [client])

  return <div>Current Network: {network}</div>
}`}
                copyButton={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden border-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Best Practices</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Network Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Always validate network compatibility before executing transactions to prevent errors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Environment Separation</h3>
                <p className="text-sm text-muted-foreground">
                  Use different configurations for development, staging, and production environments.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Error Handling</h3>
                <p className="text-sm text-muted-foreground">
                  Implement proper error handling for network-related operations and switches.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Testing Strategy</h3>
                <p className="text-sm text-muted-foreground">
                  Test your application thoroughly on testnet before deploying to mainnet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

