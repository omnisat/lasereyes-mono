"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Wrench, Cog, Rocket, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StepCardProps {
  step: number
  title: string
  description: string
  children: React.ReactNode
}

function StepCard({ step, title, description, children }: StepCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter" />
      <CardHeader className="border-b bg-muted/50 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 font-semibold">
            {step}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="mb-4 text-muted-foreground">{description}</p>
        {children}
      </CardContent>
    </Card>
  )
}

function ConfigTable() {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left font-medium">Option</th>
            <th className="p-4 text-left font-medium">Description</th>
            <th className="p-4 text-left font-medium">Default</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="bg-card transition-colors hover:bg-muted/50">
            <td className="p-4"><code className="rounded bg-muted px-2 py-1">network</code></td>
            <td className="p-4">Bitcoin network to connect to</td>
            <td className="p-4"><code className="rounded bg-muted px-2 py-1">MAINNET</code></td>
          </tr>
          <tr className="bg-card transition-colors hover:bg-muted/50">
            <td className="p-4"><code className="rounded bg-muted px-2 py-1">dataSources</code></td>
            <td className="p-4">Array of data sources to use</td>
            <td className="p-4">Default data source</td>
          </tr>
          <tr className="bg-card transition-colors hover:bg-muted/50">
            <td className="p-4"><code className="rounded bg-muted px-2 py-1">walletProviders</code></td>
            <td className="p-4">Array of wallet providers to support</td>
            <td className="p-4">All available providers</td>
          </tr>
          <tr className="bg-card transition-colors hover:bg-muted/50">
            <td className="p-4"><code className="rounded bg-muted px-2 py-1">autoConnect</code></td>
            <td className="p-4">Whether to auto-connect to the last used wallet</td>
            <td className="p-4"><code className="rounded bg-muted px-2 py-1">true</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function BasicSetupContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6" id="prerequisites">
        <h2 className="text-3xl font-bold">Prerequisites</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">React</h3>
              <p className="text-sm text-muted-foreground">v16.8 or higher required for hooks support</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Cog className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Node.js</h3>
              <p className="text-sm text-muted-foreground">v14 or higher for modern JavaScript features</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Package Manager</h3>
              <p className="text-sm text-muted-foreground">npm, yarn, or pnpm for dependency management</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6" id="setup-guide">
        <h2 className="text-3xl font-bold">Setup Guide</h2>
        <div className="grid gap-6">
          <StepCard
            step={1}
            title="Installation"
            description="First, install the LaserEyes packages using your preferred package manager:"
          >
            <CodeBlock
              language="bash"
              code={`npm install @kevinoyl/lasereyes-core @kevinoyl/lasereyes-react`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={2}
            title="Provider Setup"
            description="Wrap your application with the LaserEyes provider to enable wallet functionality:"
          >
            <CodeBlock
              language="typescript"
              code={`import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { MAINNET } from '@kevinoyl/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{
        network: MAINNET,
        // Other configuration options
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={3}
            title="Using the Hook"
            description="Access LaserEyes functionality in your components using the useLaserEyes hook:"
          >
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function WalletStatus() {
  const { 
    connect, 
    disconnect, 
    address, 
    isConnected, 
    isConnecting 
  } = useLaserEyes()

  if (isConnecting) {
    return <div>Connecting...</div>
  }

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    )
  }

  return (
    <button onClick={connect}>Connect Wallet</button>
  )
}`}
              copyButton={true}
            />
          </StepCard>
        </div>
      </section>

      <section className="space-y-6" id="configuration">
        <h2 className="text-3xl font-bold">Configuration Options</h2>
        <ConfigTable />
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
                  description: "Learn about all the features provided by the useLaserEyes hook",
                  id: "use-laser-eyes"
                },
                {
                  href: "/docs/wallet-providers",
                  title: "Wallet Providers",
                  description: "Explore the different wallet providers and their capabilities",
                  id: "wallet-providers"
                },
                {
                  href: "/docs/datasource-system",
                  title: "Data Sources",
                  description: "Configure data sources for your application",
                  id: "data-sources"
                },
                {
                  href: "/docs/examples",
                  title: "Examples",
                  description: "Check out examples for common use cases",
                  id: "examples"
                }
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold group-hover:text-orange-500 transition-colors">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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

export default function BasicSetupPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Setup Guide</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Basic Setup
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Get started with LaserEyes in your React application with this step-by-step guide.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="#prerequisites">
            <Button variant="outline" className="group">
              Prerequisites
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#setup-guide">
            <Button variant="outline" className="group">
              Setup Guide
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#configuration">
            <Button variant="outline" className="group">
              Configuration
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <BasicSetupContent />
      </ClientPageWrapper>
    </div>
  )
}

