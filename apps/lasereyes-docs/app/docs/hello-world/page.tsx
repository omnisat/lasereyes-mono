"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Code2, ArrowRight, Send, Coins, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

function HelloWorldContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              Let's build a simple application with LaserEyes to connect a wallet, display the balance, and send a
              transaction. This example will demonstrate the core features of LaserEyes in a practical way.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="complete-example">
        <h2 className="text-3xl font-bold">Complete Example</h2>
        <p className="text-lg mb-4">This example demonstrates a basic React application that:</p>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Wallet Connection</h3>
              <p className="text-sm text-muted-foreground">Connects to multiple Bitcoin wallets seamlessly</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Balance Display</h3>
              <p className="text-sm text-muted-foreground">Shows wallet address and current BTC balance</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Send BTC</h3>
              <p className="text-sm text-muted-foreground">Enables sending BTC to other addresses</p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-medium">Complete Example</h3>
              <Badge variant="secondary">hello-world.tsx</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { useState } from 'react'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { 
  MAINNET, 
  UNISAT, 
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE
} from '@omnisat/lasereyes-core'

// Main App Component
export default function App() {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-8">LaserEyes Hello World</h1>
        <WalletDemo />
      </div>
    </LaserEyesProvider>
  )
}

// ... rest of the code ...`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="step-by-step">
        <h2 className="text-3xl font-bold">Step-by-Step Explanation</h2>
        <div className="grid gap-6">
          <StepCard
            step={1}
            title="Setting up the Provider"
            description="First, wrap your application with the LaserEyesProvider component to enable wallet functionality:"
          >
            <CodeBlock
              language="tsx"
              code={`<LaserEyesProvider config={{ network: MAINNET }}>
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 className="text-2xl font-bold mb-8">LaserEyes Hello World</h1>
    <WalletDemo />
  </div>
</LaserEyesProvider>`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={2}
            title="Connecting to a Wallet"
            description="Use the useLaserEyes hook to access wallet connection methods:"
          >
            <CodeBlock
              language="tsx"
              code={`const { connect } = useLaserEyes()

// Connect wallet function
const connectWallet = async (provider) => {
  setError('')
  setLoading(true)
  try {
    await connect(provider)
  } catch (error) {
    setError(error.message || 'Failed to connect wallet')
  } finally {
    setLoading(false)
  }
}`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={3}
            title="Reading Wallet Balance"
            description="Access and format the wallet balance using the hook:"
          >
            <CodeBlock
              language="tsx"
              code={`const { balance } = useLaserEyes()

// Get balance in BTC
const formatBalance = () => {
  if (!balance) return '0'
  // Convert from satoshis to BTC
  return (Number(balance) / 100000000).toFixed(8)
}`}
              copyButton={true}
            />
          </StepCard>

          <StepCard
            step={4}
            title="Sending a Transaction"
            description="Implement BTC sending functionality with proper error handling:"
          >
            <CodeBlock
              language="tsx"
              code={`const { sendBTC } = useLaserEyes()

// Send BTC function
const handleSendBTC = async () => {
  if (!recipient || !amount) {
    setError('Please enter recipient address and amount')
    return
  }
  
  setError('')
  setTxId('')
  setLoading(true)
  
  try {
    // Convert amount to satoshis
    const satoshis = Math.floor(parseFloat(amount) * 100000000)
    const result = await sendBTC(recipient, satoshis)
    setTxId(result)
  } catch (error) {
    setError(error.message || 'Transaction failed')
  } finally {
    setLoading(false)
  }
}`}
              copyButton={true}
            />
          </StepCard>
        </div>

        <WarningBox title="Testing Transactions" className="mt-6">
          <p>
            When testing transactions, it's recommended to use a testnet network to avoid using real BTC. You can configure
            LaserEyes to use testnet by setting <code>network: TESTNET</code> in the provider config.
          </p>
        </WarningBox>
      </section>

      <section className="space-y-6" id="inscriptions">
        <h2 className="text-3xl font-bold">Working with Inscriptions</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-medium">Inscriptions Example</h3>
              <Badge variant="secondary">inscriptions-list.tsx</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-6 text-muted-foreground">
              LaserEyes also supports working with Bitcoin Ordinals and inscriptions. Here's a simple example of how to list
              inscriptions:
            </p>
            <CodeBlock
              language="tsx"
              code={`import { useState, useEffect } from 'react'
import { useLaserEyes } from '@omnisat/lasereyes-react'

function InscriptionsList() {
  // ... inscription list code ...
}`}
              copyButton={true}
            />
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
                  href: "/docs/wallet-connection",
                  title: "Wallet Connection",
                  description: "Learn more about connecting to different wallets",
                  icon: Wallet
                },
                {
                  href: "/docs/basic-transactions",
                  title: "Basic Transactions",
                  description: "Explore more transaction types",
                  icon: Send
                },
                {
                  href: "/docs/inscriptions",
                  title: "Working with Inscriptions",
                  description: "Learn how to create and transfer inscriptions",
                  icon: FileCode
                },
                {
                  href: "/docs/brc20",
                  title: "BRC-20 Operations",
                  description: "Work with BRC-20 tokens",
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

export default function HelloWorldPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Example</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Hello World Example
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Build your first Bitcoin application with LaserEyes in this step-by-step guide.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="#complete-example">
            <Button variant="default" className="group">
              View Complete Example
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#step-by-step">
            <Button variant="outline" className="group">
              Step-by-Step Guide
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#inscriptions">
            <Button variant="outline" className="group">
              Inscriptions Example
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      <HelloWorldContent />
    </div>
  )
}

