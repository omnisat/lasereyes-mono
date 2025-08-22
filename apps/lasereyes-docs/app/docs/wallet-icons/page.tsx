"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Paintbrush, Palette, Zap, Settings2, ArrowRight } from "lucide-react"
import Link from "next/link"
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
} from "@kevinoyl/lasereyes-react"
import { cn } from "@/lib/utils"

interface WalletIconInfo {
  name: string
  constant: ProviderType
  description: string
}

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

function WalletIconsContent() {
  const [selectedSize, setSelectedSize] = React.useState(24)

  const walletIcons = React.useMemo<WalletIconInfo[]>(
    () => [
      {
        name: "UniSat",
        constant: UNISAT as ProviderType,
        description: "The most popular Bitcoin wallet for Ordinals"
      },
      {
        name: "Xverse",
        constant: XVERSE as ProviderType,
        description: "Feature-rich Bitcoin and Ordinals wallet"
      },
      {
        name: "OYL",
        constant: OYL as ProviderType,
        description: "Modern Bitcoin wallet with Ordinals support"
      },
      {
        name: "Magic Eden",
        constant: MAGIC_EDEN as ProviderType,
        description: "Leading NFT marketplace's Bitcoin wallet"
      },
      {
        name: "OKX",
        constant: OKX as ProviderType,
        description: "Secure and reliable exchange wallet"
      },
      {
        name: "Leather",
        constant: LEATHER as ProviderType,
        description: "Formerly known as Stacks Wallet"
      },
      {
        name: "Phantom",
        constant: PHANTOM as ProviderType,
        description: "Multi-chain wallet with Bitcoin support"
      },
      {
        name: "Wizz",
        constant: WIZZ as ProviderType,
        description: "Innovative Bitcoin and Ordinals wallet"
      },
      {
        name: "Orange",
        constant: ORANGE as ProviderType,
        description: "Bitcoin-focused wallet solution"
      },
    ].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Installation</h2>
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h3 className="font-mono text-sm font-medium">npm</h3>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="bash"
              code="npm install @kevinoyl/lasereyes-react"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Available Icons</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSize(Math.max(16, selectedSize - 4))}
            >
              -
            </Button>
            <span className="min-w-[3rem] text-center">{selectedSize}px</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSize(Math.min(48, selectedSize + 4))}
            >
              +
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {walletIcons.map((wallet) => (
            <Card
              key={wallet.name}
              className="group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
            >
              <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                  <WalletIcon walletName={wallet.constant} size={selectedSize} />
                </div>
                <div>
                  <h3 className="font-medium">{wallet.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {wallet.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Usage</h2>
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h3 className="font-mono text-sm font-medium">Basic Example</h3>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { WalletIcon, UNISAT } from "@kevinoyl/lasereyes-react"

export function MyComponent() {
  return <WalletIcon walletName={UNISAT} size={24} />
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>


      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Props</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 text-left font-semibold">Prop</th>
                  <th className="pb-4 text-left font-semibold">Type</th>
                  <th className="pb-4 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-4 font-mono text-sm">walletName</td>
                  <td className="py-4 font-mono text-sm">ProviderType</td>
                  <td className="py-4 text-sm">The wallet identifier from @kevinoyl/lasereyes-react</td>
                </tr>
                <tr>
                  <td className="py-4 font-mono text-sm">size</td>
                  <td className="py-4 font-mono text-sm">number</td>
                  <td className="py-4 text-sm">Icon size in pixels (default: 24)</td>
                </tr>
                <tr>
                  <td className="py-4 font-mono text-sm">className</td>
                  <td className="py-4 font-mono text-sm">string</td>
                  <td className="py-4 text-sm">Additional CSS classes for custom styling</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Customization Examples</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h3 className="font-mono text-sm font-medium">Custom Styling</h3>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="tsx"
                code={`<WalletIcon
  walletName={UNISAT}
  size={32}
  className="opacity-75 transition-opacity hover:opacity-100"
/>`}
                copyButton={true}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h3 className="font-mono text-sm font-medium">With Animation</h3>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="tsx"
                code={`<WalletIcon
  walletName={UNISAT}
  size={32}
  className="transform transition-transform hover:scale-110"
/>`}
                copyButton={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function WalletIconsPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">React Component</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Wallet Icons
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Beautiful, customizable wallet icons that automatically adapt to your theme and enhance your application's user experience.
        </p>
        <div className="flex gap-4 items-center">
          <Link href="#usage">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Badge variant="secondary" className="h-7 px-3">v1.0.0</Badge>
        </div>
      </div>

      <ClientPageWrapper>
        <WalletIconsContent />
      </ClientPageWrapper>
    </div>
  )
} 