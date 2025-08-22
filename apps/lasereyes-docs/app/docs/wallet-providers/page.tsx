'use client'

import * as React from 'react'
import { CodeBlock } from '@/components/code-block'
import Link from 'next/link'
import { Heading } from '@/components/heading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Wallet,
  Shield,
  Code2,
  Zap,
  Globe,
  Plug,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WalletIcon } from '@kevinoyl/lasereyes-react'
import {
  UNISAT,
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE,
  type ProviderType,
} from '@kevinoyl/lasereyes-core'

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

interface WalletCardProps {
  name: string
  constant: string
  description: string
  website: string
  className?: string
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
        'group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5',
        className
      )}
    >
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

function WalletCard({
  name,
  constant,
  description,
  website,
  className,
}: WalletCardProps) {
  // Map wallet names to their provider constants
  const walletProviders: Record<string, ProviderType> = {
    UniSat: UNISAT as ProviderType,
    Xverse: XVERSE as ProviderType,
    OYL: OYL as ProviderType,
    Leather: LEATHER as ProviderType,
    'Magic Eden': MAGIC_EDEN as ProviderType,
    OKX: OKX as ProviderType,
    Phantom: PHANTOM as ProviderType,
    Wizz: WIZZ as ProviderType,
    Orange: ORANGE as ProviderType,
  }

  const provider = walletProviders[name]

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5',
        className
      )}
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="transition-transform duration-300 group-hover:scale-110">
            <WalletIcon walletName={provider} size={42} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{name}</h3>
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="text-orange-500 hover:text-orange-600"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
            <code className="mt-1 block rounded bg-muted px-2 py-1 text-sm">
              {constant}
            </code>
          </div>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function WalletProvidersContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6" id="supported-wallets">
        <h2 className="text-3xl font-bold">Supported Wallets</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <WalletCard
            name="UniSat"
            constant="UNISAT"
            description="Popular Bitcoin and Ordinals wallet"
            website="https://unisat.io"
          />
          <WalletCard
            name="Xverse"
            constant="XVERSE"
            description="Stacks and Bitcoin wallet with Ordinals support"
            website="https://xverse.app"
          />
          <WalletCard
            name="OYL"
            constant="OYL"
            description="Bitcoin wallet focused on Ordinals"
            website="https://oyl.io"
          />
          <WalletCard
            name="Magic Eden"
            constant="MAGIC_EDEN"
            description="Multi-chain NFT marketplace wallet"
            website="https://magiceden.io"
          />
          <WalletCard
            name="OKX"
            constant="OKX"
            description="Multi-chain wallet from OKX exchange"
            website="https://okx.com/web3"
          />
          <WalletCard
            name="Leather"
            constant="LEATHER"
            description="Stacks and Bitcoin wallet"
            website="https://leather.io"
          />
          <WalletCard
            name="Phantom"
            constant="PHANTOM"
            description="Multi-chain wallet with Bitcoin support"
            website="https://phantom.app"
          />
          <WalletCard
            name="Wizz"
            constant="WIZZ"
            description="Bitcoin and Ordinals wallet"
            website="https://wizz.wallet"
          />
          <WalletCard
            name="Orange"
            constant="ORANGE"
            description="Bitcoin wallet with Ordinals support"
            website="https://orange.xyz"
          />
        </div>
      </section>

      <section className="space-y-6" id="usage">
        <h2 className="text-3xl font-bold">Usage</h2>
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h3 className="font-mono text-sm font-medium">Basic Example</h3>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { 
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

// Connect to UniSat wallet
await client.connect(UNISAT)

// Connect to Xverse wallet
await client.connect(XVERSE)

// Connect to OYL wallet
await client.connect(OYL)`}
              fileName="using-providers.ts"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="provider-detection">
        <h2 className="text-3xl font-bold">Provider Detection</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { isWalletAvailable } from '@kevinoyl/lasereyes-core'

// Check if UniSat wallet is available
const isUnisatAvailable = isWalletAvailable(UNISAT)

// Get all available wallet providers
const availableProviders = [
  UNISAT,
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE
].filter(provider => isWalletAvailable(provider))`}
              fileName="provider-detection.ts"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="next-steps">
        <h2 className="text-3xl font-bold">Next Steps</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/docs/laser-eyes-client" className="block">
            <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    LaserEyes Client
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to use the core client with wallet providers
                  </p>
                </div>
                <ArrowRight className="mt-4 h-5 w-5 text-orange-500" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/docs/wallet-connection" className="block">
            <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Wallet Connection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Explore wallet connection examples and best practices
                  </p>
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

export default function WalletProvidersPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">
          Core API
        </Badge>
        <Heading
          level={1}
          className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent"
        >
          Wallet Providers
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          LaserEyes supports multiple Bitcoin wallet providers through a unified
          interface, making it simple to integrate with any supported wallet.
        </p>
        <div className="flex gap-4 items-center">
          <Link href="#supported-wallets">
            <Button size="lg" className="group">
              View Supported Wallets
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Badge variant="secondary" className="h-7 px-3">
            9 Wallets
          </Badge>
        </div>
      </div>

      <WalletProvidersContent />
    </div>
  )
}
