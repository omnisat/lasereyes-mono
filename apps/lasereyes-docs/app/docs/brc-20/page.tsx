"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Search, Send, Code2, Database, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function Brc20Page() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-emerald-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Guide</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          Working with BRC-20 Tokens
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Learn how to interact with BRC-20 tokens using LaserEyes - fetch balances, send tokens, and manage transfers.
        </p>
      </div>

      <ClientPageWrapper>
        <Brc20Content />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/10 blur-2xl filter group-hover:bg-emerald-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function Brc20Content() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              LaserEyes provides comprehensive support for BRC-20 tokens, allowing you to easily fetch balances,
              send tokens, and manage transfers through a unified interface.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Search}
            title="Fetch BRC-20 Balances"
            description="Retrieve token balances for any Bitcoin address with support for multiple data sources."
          />
          <FeatureCard
            icon={Send}
            title="Send BRC-20 Tokens"
            description="Securely transfer BRC-20 tokens between addresses with built-in PSBT support."
          />
          <FeatureCard
            icon={Database}
            title="Rich Token Data"
            description="Access comprehensive token data including overall, transferable, and available balances."
          />
          <FeatureCard
            icon={Shield}
            title="Safe Transfers"
            description="Built-in safety checks and validations for secure token transfers."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">The BRC-20 Balance Type</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">BRC-20 Balance Interface</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`type Brc20Balance = {
  ticker: string;     // The token ticker symbol
  overall: string;    // Total token balance
  transferable: string; // Amount available for transfer
  available: string;  // Amount available for spending
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Fetching BRC-20 Balances</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'

function TokenBalances() {
  const { getAddressBrc20Balances } = useLaserEyes()
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true)
        const results = await getAddressBrc20Balances('bc1p...')
        setBalances(results)
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
  }, [])

  if (loading) return <div>Loading token balances...</div>

  return (
    <div className="space-y-4">
      {balances.map(token => (
        <div key={token.ticker} className="p-4 border rounded">
          <h3 className="font-bold">{token.ticker}</h3>
          <p>Overall: {token.overall}</p>
          <p>Transferable: {token.transferable}</p>
          <p>Available: {token.available}</p>
        </div>
      ))}
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Sending BRC-20 Tokens</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState } from 'react'
import { BRC20 } from '@kevinoyl/lasereyes-core'

function SendToken() {
  const { send } = useLaserEyes()
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    try {
      setSending(true)
      
      // Send BRC-20 tokens to an address
      const txId = await send(BRC20, {
        ticker: 'ORDI',
        amount: '1000',
        toAddress: 'bc1p...'
      })

      console.log('Transaction ID:', txId)
    } catch (error) {
      console.error('Failed to send:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <button 
      onClick={handleSend}
      disabled={sending}
      className="px-4 py-2 bg-emerald-500 text-white rounded"
    >
      {sending ? 'Sending...' : 'Send Tokens'}
    </button>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Best Practices</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Balance Validation</h3>
              <p className="text-muted-foreground">
                Always validate token balances before attempting transfers.
                Check both the transferable and available amounts.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Error Handling</h3>
              <p className="text-muted-foreground">
                Implement proper error handling for token operations.
                Network issues, insufficient balances, or wallet rejections should be handled gracefully.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Loading States</h3>
              <p className="text-muted-foreground">
                Show appropriate loading states during token operations.
                Both fetching balances and sending can take time to complete.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. Data Source Fallbacks</h3>
              <p className="text-muted-foreground">
                Consider implementing fallback data sources for token operations.
                LaserEyes supports multiple data providers to ensure reliability.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Complete Example</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">BRC-20 Token Dashboard</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'
import { BRC20 } from '@kevinoyl/lasereyes-core'

function TokenDashboard() {
  const { getAddressBrc20Balances, send, address } = useLaserEyes()
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  useEffect(() => {
    if (address) {
      fetchBalances()
    }
  }, [address])

  const fetchBalances = async () => {
    try {
      setLoading(true)
      const results = await getAddressBrc20Balances(address)
      setBalances(results)
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!selectedToken || !amount || !recipient) return

    try {
      setSending(true)
      const txId = await send(BRC20, {
        ticker: selectedToken,
        amount,
        toAddress: recipient
      })
      
      console.log('Transaction ID:', txId)
      // Refresh balances after sending
      await fetchBalances()
      
      // Reset form
      setSelectedToken(null)
      setAmount('')
      setRecipient('')
    } catch (error) {
      console.error('Failed to send:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div>Loading token balances...</div>

  return (
    <div className="space-y-8">
      {/* Token Balances Display */}
      <div className="grid gap-4 sm:grid-cols-2">
        {balances.map(token => (
          <div 
            key={token.ticker}
            className="p-4 border rounded hover:border-emerald-500/30 cursor-pointer"
            onClick={() => setSelectedToken(token.ticker)}
          >
            <h3 className="font-bold">{token.ticker}</h3>
            <p>Overall: {token.overall}</p>
            <p>Transferable: {token.transferable}</p>
            <p>Available: {token.available}</p>
          </div>
        ))}
      </div>

      {/* Send Form */}
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block mb-2">Selected Token</label>
          <input
            type="text"
            value={selectedToken || ''}
            readOnly
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter recipient address"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !selectedToken || !amount || !recipient}
          className="px-4 py-2 bg-emerald-500 text-white rounded disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Tokens'}
        </button>
      </form>
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