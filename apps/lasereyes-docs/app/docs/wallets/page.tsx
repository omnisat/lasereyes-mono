'use client'

import * as React from 'react'
import { ConnectWallet } from '@/components/connect-wallet'
import { ClientPageWrapper } from '@/components/client-page-wrapper'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/heading'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OYL,
  ORANGE,
  PHANTOM,
  UNISAT,
  WalletIcon,
  WIZZ,
  XVERSE,
  type ProviderType,
} from '@kevinoyl/lasereyes-react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/code-block'

const wallets = [
  {
    id: UNISAT as ProviderType,
    name: 'UniSat',
    description: 'The most popular Bitcoin wallet for BRC-20 and Ordinals.',
    url: 'https://unisat.io',
    icon: <WalletIcon walletName={UNISAT} size={64} />,
  },
  {
    id: XVERSE as ProviderType,
    name: 'Xverse',
    description: 'A powerful Bitcoin wallet with Ordinals and BRC-20 support.',
    url: 'https://www.xverse.app',
    icon: <WalletIcon walletName={XVERSE} size={64} />,
  },
  {
    id: OYL as ProviderType,
    name: 'OYL',
    description: 'A modern Bitcoin wallet focused on Ordinals and BRC-20.',
    url: 'https://oyl.io',
    icon: <WalletIcon walletName={OYL} size={64} />,
  },
  {
    id: MAGIC_EDEN as ProviderType,
    name: 'Magic Eden',
    description:
      "Leading NFT marketplace's Bitcoin wallet with Ordinals support.",
    url: 'https://magiceden.io',
    icon: <WalletIcon walletName={MAGIC_EDEN} size={64} />,
  },
  {
    id: OKX as ProviderType,
    name: 'OKX',
    description: 'Multi-chain wallet with robust Bitcoin and Ordinals support.',
    url: 'https://www.okx.com/web3',
    icon: <WalletIcon walletName={OKX} size={64} />,
  },
  {
    id: LEATHER as ProviderType,
    name: 'Leather',
    description: 'Secure Bitcoin and Stacks wallet with Ordinals support.',
    url: 'https://leather.io',
    icon: <WalletIcon walletName={LEATHER} size={64} />,
  },
  {
    id: PHANTOM as ProviderType,
    name: 'Phantom',
    description: 'Popular Solana wallet now with Bitcoin and Ordinals support.',
    url: 'https://phantom.app',
    icon: <WalletIcon walletName={PHANTOM} size={64} />,
  },
  {
    id: WIZZ as ProviderType,
    name: 'Wizz',
    description: 'Modern Bitcoin wallet with focus on Ordinals and BRC-20.',
    url: 'https://wizz.cash',
    icon: <WalletIcon walletName={WIZZ} size={64} />,
  },
  {
    id: ORANGE as ProviderType,
    name: 'Orange',
    description: 'Bitcoin-native wallet with Ordinals and BRC-20 support.',
    url: 'https://orange.xyz',
    icon: <WalletIcon walletName={ORANGE} size={64} />,
  },
].sort((a, b) => a.name.localeCompare(b.name))

function WalletsContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              LaserEyes provides seamless integration with all major Bitcoin
              wallets through a unified interface. Simply import the wallet
              constants and use them with the <code>connect</code> method from{' '}
              <code>useLaserEyes</code>.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Available Wallets</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {wallets.map((wallet) => (
            <Card
              key={wallet.id}
              className="group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
            >
              <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="transition-transform duration-300 group-hover:scale-110">
                  {wallet.icon}
                </div>
                <div>
                  <CardTitle className="group-hover:text-orange-500 transition-colors">
                    {wallet.name}
                  </CardTitle>
                  <CardDescription>{wallet.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <ConnectWallet
                  walletId={wallet.id}
                  variant="outline"
                  size="sm"
                  className="transition-all hover:border-orange-500 hover:text-orange-500"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="ml-2 transition-colors hover:text-orange-500"
                >
                  <a
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Visit ${wallet.name} website`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Usage Example</h2>
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">
              Connecting to Wallets
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { UNISAT, XVERSE } from '@kevinoyl/lasereyes-core'

function WalletConnect() {
  const { connect, disconnect, connected, address } = useLaserEyes()

  const connectUniSat = () => connect(UNISAT)
  const connectXverse = () => connect(XVERSE)

  if (connected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={connectUniSat}>Connect UniSat</button>
      <button onClick={connectXverse}>Connect Xverse</button>
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function WalletsPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">
          Wallet Integration
        </Badge>
        <Heading
          level={1}
          className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent"
        >
          Supported Wallets
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          LaserEyes supports a wide range of Bitcoin wallets, making it easy for
          users to interact with your application using their preferred wallet.
        </p>
      </div>

      <ClientPageWrapper>
        <WalletsContent />
      </ClientPageWrapper>
    </div>
  )
}
