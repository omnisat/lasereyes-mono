"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Layers, Database, Wallet, Code2, Puzzle, Shield } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
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

function ArchitectureContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              LaserEyes is built with a modular architecture that separates concerns and provides flexibility through its provider system. This guide explains the core concepts and how different parts work together.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Core Concepts</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Layers}
            title="Provider System"
            description="A flexible provider architecture that allows seamless integration with different Bitcoin wallets through a unified interface."
          />
          <FeatureCard
            icon={Database}
            title="Data Sources"
            description="Pluggable data source system for fetching Bitcoin network data with built-in fallback support."
          />
          <FeatureCard
            icon={Wallet}
            title="Wallet Abstraction"
            description="Abstract wallet interfaces that normalize different wallet implementations into a consistent API."
          />
          <FeatureCard
            icon={Code2}
            title="Framework Adapters"
            description="Framework-specific packages that provide optimized integrations for React, Vue, and more."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Package Structure</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Project Layout</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="text"
              code={`lasereyes/
├── packages/
│   ├── core/     # Core functionality
│   ├── react/    # React integration
│   ├── vue/      # Vue integration
│   └── ui/       # Shared UI components
└── apps/
    ├── docs/               # Documentation site
    └── examples/           # Example applications`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Core Architecture</h2>
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <div className="flex items-center gap-2">
                <Puzzle className="h-4 w-4" />
                <h3 className="font-medium">Provider Architecture</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`interface WalletProvider {
  connect(): Promise<void>
  disconnect(): Promise<void>
  signMessage(message: string): Promise<string>
  sendBitcoin(address: string, amount: number): Promise<string>
  // ... other methods
}`}
                copyButton={true}
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Each wallet provider implements this interface, ensuring consistent behavior across different wallet implementations.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <h3 className="font-medium">Data Source System</h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`interface DataSource {
  getBalance(address: string): Promise<string>
  getTransaction(txid: string): Promise<Transaction>
  getInscriptions(address: string): Promise<Inscription[]>
  // ... other methods
}`}
                copyButton={true}
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Data sources provide a standardized way to interact with the Bitcoin network and fetch required data.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Security Considerations</h2>
        <Card className="overflow-hidden border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Security Best Practices</h3>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li>Never store private keys or sensitive wallet data</li>
              <li>Validate all transaction parameters before signing</li>
              <li>Implement proper error handling for failed transactions</li>
              <li>Use secure communication channels with wallet providers</li>
              <li>Follow Bitcoin network best practices for transaction handling</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <div className="grid gap-4">
              {[
                {
                  href: "/docs/wallet-providers",
                  title: "Wallet Providers",
                  description: "Learn about implementing custom wallet providers",
                  icon: Wallet
                },
                {
                  href: "/docs/datasource-system",
                  title: "Data Sources",
                  description: "Understand the data source system in depth",
                  icon: Database
                },
                {
                  href: "/docs/framework-integration",
                  title: "Framework Integration",
                  description: "Explore framework-specific implementations",
                  icon: Code2
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

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Architecture</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          System Architecture
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Understand how LaserEyes is built and how its components work together to provide a seamless Bitcoin wallet integration experience.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="#core-concepts">
            <Button variant="default" className="group">
              Core Concepts
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#package-structure">
            <Button variant="outline" className="group">
              Package Structure
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <ArchitectureContent />
      </ClientPageWrapper>
    </div>
  )
}

