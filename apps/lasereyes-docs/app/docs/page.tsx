"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Wallet, Database, Code2, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Documentation</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Introduction to LaserEyes
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          A powerful wallet connect library making it easier than ever to build and maintain Bitcoin Ordinal Web Apps.
        </p>
      </div>

      <ClientPageWrapper>
        <DocsPageContent />
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
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function DocsPageContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              LaserEyes provides a unified interface to interact with multiple Bitcoin wallets, making it simple to add
              wallet connectivity to your web applications.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Why LaserEyes?</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              Building Bitcoin web applications can be challenging due to the variety of wallet providers and their different
              APIs. LaserEyes solves this problem by providing a unified interface that works with all major Bitcoin wallets.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Wallet}
            title="Multi-wallet Support"
            description="Seamless integration with UniSat, Xverse, OYL, and more Bitcoin wallets through a unified interface."
          />
          <FeatureCard
            icon={Database}
            title="Complete Ordinals Support"
            description="Full support for Bitcoin Ordinals, inscriptions, and BRC-20 tokens out of the box."
          />
          <FeatureCard
            icon={Code2}
            title="First-class TypeScript"
            description="Built with TypeScript from the ground up, providing excellent type safety and developer experience."
          />
          <FeatureCard
            icon={Shield}
            title="Security Focused"
            description="Security-first approach with built-in protections and best practices for handling Bitcoin transactions."
          />
          <FeatureCard
            icon={Rocket}
            title="Performance Optimized"
            description="Optimized for performance with minimal overhead and efficient state management."
          />
          <FeatureCard
            icon={Zap}
            title="DataSource Abstraction"
            description="Flexible data source system for seamlessly switching between different Bitcoin data providers."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Installation</h2>
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">npm</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="bash"
              code={`npm install @kevinoyl/lasereyes-core @kevinoyl/lasereyes-react`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Basic Usage</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { MAINNET, UNISAT } from '@kevinoyl/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ network: MAINNET }}
    >
      <WalletConnect />
    </LaserEyesProvider>
  )
}

function WalletConnect() {
  const {
    connect,
    disconnect,
    connected,
    address
  } = useLaserEyes()

  return (
    <div>
      {connected ? (
        <>
          <div>Connected: {address}</div>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={() => connect(UNISAT)}>Connect Wallet</button>
      )}
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

