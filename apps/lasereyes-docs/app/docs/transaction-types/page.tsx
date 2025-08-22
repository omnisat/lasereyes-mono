"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Coins, FileCode, Scroll, Blocks, Wallet, Banknote, CircleDollarSign, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
  badges?: string[]
}

export default function TransactionTypesPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        {/* Enhanced background effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-orange-800/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">BTC</Badge>
          <Badge variant="secondary" className="bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/20">Ordinals</Badge>
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">BRC-20</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-orange-900/20 to-yellow-900/20 backdrop-blur-sm ring-1 ring-orange-900/20">
            <Coins className="h-7 w-7 text-orange-400" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Transaction Types
            </Heading>
            <p className="text-sm text-muted-foreground">Comprehensive Bitcoin Transaction Support</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          LaserEyes supports all major Bitcoin transaction types, from standard BTC transfers to Ordinals inscriptions and BRC-20 tokens.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Banknote className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">BTC Transfer</div>
                  <div className="text-xs text-muted-foreground">Standard transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Scroll className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Ordinals</div>
                  <div className="text-xs text-muted-foreground">Inscription support</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <CircleDollarSign className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">BRC-20</div>
                  <div className="text-xs text-muted-foreground">Token operations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="#implementation">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 group">
              View Examples
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#advanced">
            <Button variant="outline" size="lg" className="group">
              <Blocks className="mr-2 h-4 w-4" />
              Advanced Usage
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <TransactionTypesContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className, badges }: FeatureCardProps) {
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
        <p className="text-muted-foreground mb-4">{description}</p>
        {badges && (
          <div className="flex gap-2 flex-wrap">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="bg-orange-900/10 text-orange-400">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TransactionTypesContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Supported Types</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Banknote}
            title="BTC Transactions"
            description="Standard Bitcoin transactions with support for multiple inputs, outputs, and fee estimation."
            badges={["P2PKH", "P2SH", "P2WPKH", "P2WSH"]}
          />
          <FeatureCard
            icon={Scroll}
            title="Ordinal Inscriptions"
            description="Full support for inscribing and transferring Ordinals with various content types."
            badges={["Text", "Image", "JSON", "HTML"]}
          />
          <FeatureCard
            icon={CircleDollarSign}
            title="BRC-20 Tokens"
            description="Complete BRC-20 token support including minting, transferring, and balance checking."
            badges={["Deploy", "Mint", "Transfer"]}
          />
          <FeatureCard
            icon={FileCode}
            title="Custom Transactions"
            description="Build custom transaction types with our flexible transaction builder API."
            badges={["Custom Scripts", "Multi-sig"]}
          />
        </div>
      </section>

      <section id="implementation" className="space-y-6">
        <h2 className="text-3xl font-bold">Implementation Examples</h2>
        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">BTC Transfer</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function SendBitcoin() {
  const { sendBitcoin } = useLaserEyes()

  const handleSend = async () => {
    try {
      const txid = await sendBitcoin({
        address: 'bc1q...',
        amount: 0.001, // BTC
        feeRate: 10 // sats/vB
      })
      console.log('Transaction sent:', txid)
    } catch (error) {
      console.error('Failed to send:', error)
    }
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Ordinal Inscription</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function InscribeOrdinal() {
  const { inscribe } = useLaserEyes()

  const handleInscribe = async () => {
    try {
      const txid = await inscribe({
        content: 'Hello, Ordinals!',
        contentType: 'text/plain',
        feeRate: 15
      })
      console.log('Inscription created:', txid)
    } catch (error) {
      console.error('Failed to inscribe:', error)
    }
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">BRC-20 Transfer</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function TransferBRC20() {
  const { transferBRC20 } = useLaserEyes()

  const handleTransfer = async () => {
    try {
      const txid = await transferBRC20({
        ticker: 'ORDI',
        amount: '100',
        recipient: 'bc1q...',
        feeRate: 12
      })
      console.log('Transfer initiated:', txid)
    } catch (error) {
      console.error('Failed to transfer:', error)
    }
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section id="advanced" className="space-y-6">
        <h2 className="text-3xl font-bold">Advanced Features</h2>
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h2 className="font-mono text-sm font-medium">Custom Transaction Builder</h2>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function BuildCustomTx() {
  const { createTransaction } = useLaserEyes()

  const handleCustomTx = async () => {
    const tx = await createTransaction()
      .addInput({
        txid: '1234...',
        vout: 0,
        value: 10000
      })
      .addOutput({
        address: 'bc1q...',
        value: 5000
      })
      .addOutput({
        script: '6a0b48656c6c6f20576f726c64', // OP_RETURN
        value: 0
      })
      .sign()

    const txid = await tx.broadcast()
    console.log('Custom transaction sent:', txid)
  }
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
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Best Practices</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Fee Estimation</h3>
                <p className="text-sm text-muted-foreground">
                  Always use proper fee estimation to ensure transactions are confirmed in a timely manner.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Error Handling</h3>
                <p className="text-sm text-muted-foreground">
                  Implement comprehensive error handling for all transaction types.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Transaction Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Validate all transaction parameters before sending to prevent errors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">User Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  Always request user confirmation before broadcasting transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

