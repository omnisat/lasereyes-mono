"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Settings, Network, Database, Layers, Bot, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
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

function LaserEyesProviderContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              The <code>LaserEyesProvider</code> is a React context provider that initializes the LaserEyes client and makes it available throughout your application. It serves as the bridge between your React components and the core LaserEyes functionality.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Basic Usage</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Basic Setup</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { MAINNET } from '@kevinoyl/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET 
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Configuration Options</h2>
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <h3 className="font-medium">Network Configuration</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="tsx"
                code={`// Use Mainnet
<LaserEyesProvider config={{ network: MAINNET }}>
  <MainnetApp />
</LaserEyesProvider>

// Use Testnet
<LaserEyesProvider config={{ network: TESTNET }}>
  <TestnetApp />
</LaserEyesProvider>`}
                copyButton={true}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <h3 className="font-medium">DataSource Configuration</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="tsx"
                code={`<LaserEyesProvider
  config={{ 
    network: MAINNET,
    dataSources: {
      maestro: {
        apiKey: 'your-maestro-api-key',
      },
      sandshrew: {
        url: 'https://api.sandshrew.io',
        apiKey: 'your-sandshrew-api-key',
      },
      mempool: {
        url: 'https://mempool.space/api',
      },
      esplora: 'https://blockstream.info/api',
    }
  }}
>
  <YourApp />
</LaserEyesProvider>`}
                copyButton={true}
              />
              <WarningBox title="Development API Keys" className="mt-4">
                While development API keys are included for testing, register your own API keys for production use to avoid rate limiting.
              </WarningBox>
            </CardContent>
          </Card>


        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <div className="grid gap-4">
              {[
                {
                  href: "/docs/use-laser-eyes",
                  title: "useLaserEyes Hook",
                  description: "Learn how to interact with LaserEyes in your components",
                  icon: Bot
                },
                {
                  href: "/docs/wallet-providers",
                  title: "Wallet Providers",
                  description: "Explore the supported wallet providers",
                  icon: Layers
                },
                {
                  href: "/docs/datasource-system",
                  title: "DataSource System",
                  description: "Understand how LaserEyes interacts with Bitcoin data providers",
                  icon: Database
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

export default function LaserEyesProviderPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">React Integration</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          LaserEyesProvider
        </Heading>
        <p className="text-xl max-w-2xl text-muted-foreground">
          The essential React context provider that powers LaserEyes integration in your application.
        </p>
      </div>

      <ClientPageWrapper>
        <LaserEyesProviderContent />
      </ClientPageWrapper>
    </div>
  )
}

