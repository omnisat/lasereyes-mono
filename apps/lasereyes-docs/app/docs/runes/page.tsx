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

export default function RunesPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Guide</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Working with Runes
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Learn how to interact with Bitcoin Runes using LaserEyes - fetch balances, send tokens, and more.
        </p>
      </div>

      <ClientPageWrapper>
        <RunesContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-purple-500/10 blur-2xl filter group-hover:bg-purple-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function RunesContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              LaserEyes provides comprehensive support for Bitcoin Runes, allowing you to easily fetch balances,
              send tokens, and interact with the Runes protocol through a unified interface.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Search}
            title="Fetch Rune Balances"
            description="Retrieve Rune balances for any Bitcoin address with support for multiple data sources."
          />
          <FeatureCard
            icon={Send}
            title="Send Runes"
            description="Securely transfer Runes between addresses with built-in PSBT support."
          />
          <FeatureCard
            icon={Database}
            title="Rich Metadata"
            description="Access comprehensive Rune metadata including name, symbol, decimals, and supply information."
          />
          <FeatureCard
            icon={Shield}
            title="Safe Transfers"
            description="Built-in safety checks and validations for secure Rune transfers."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">The Rune Balance Type</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Rune Balance Interface</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`type OrdRuneBalance = {
  name: string;      // The name of the rune
  balance: string;   // The balance amount
  symbol: string;    // The rune symbol
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Fetching Rune Balances</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'

function RuneBalances() {
  const { getAddressRunesBalances } = useLaserEyes()
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true)
        const results = await getAddressRunesBalances('bc1p...')
        setBalances(results)
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
  }, [])

  if (loading) return <div>Loading rune balances...</div>

  return (
    <div className="space-y-4">
      {balances.map(rune => (
        <div key={rune.name} className="p-4 border rounded">
          <h3 className="font-bold">{rune.name}</h3>
          <p>Balance: {rune.balance} {rune.symbol}</p>
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
        <h2 className="text-3xl font-bold">Sending Runes</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState } from 'react'
import { RUNES } from '@kevinoyl/lasereyes-core'

function SendRune() {
  const { send } = useLaserEyes()
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    try {
      setSending(true)
      
      // Send runes to an address
      const txId = await send(RUNES, {
        runeName: 'PEPE',
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
      className="px-4 py-2 bg-purple-500 text-white rounded"
    >
      {sending ? 'Sending...' : 'Send Runes'}
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
              <h3 className="text-lg font-semibold mb-2">1. Error Handling</h3>
              <p className="text-muted-foreground">
                Always implement proper error handling for Rune operations.
                Network issues, insufficient balances, or wallet rejections should be handled gracefully.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Loading States</h3>
              <p className="text-muted-foreground">
                Show appropriate loading states during Rune operations.
                Both fetching balances and sending can take time to complete.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Balance Validation</h3>
              <p className="text-muted-foreground">
                Always validate Rune balances before attempting transfers.
                Check both the balance amount and if the user owns the Rune.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. Data Source Fallbacks</h3>
              <p className="text-muted-foreground">
                Consider implementing fallback data sources for Rune operations.
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
            <h2 className="font-mono text-sm font-medium">Runes Dashboard Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'
import { RUNES } from '@kevinoyl/lasereyes-core'

function RunesDashboard() {
  const { getAddressRunesBalances, send, address } = useLaserEyes()
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedRune, setSelectedRune] = useState(null)
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
      const results = await getAddressRunesBalances(address)
      setBalances(results)
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!selectedRune || !amount || !recipient) return

    try {
      setSending(true)
      const txId = await send(RUNES, {
        runeName: selectedRune,
        amount,
        toAddress: recipient
      })
      
      console.log('Transaction ID:', txId)
      // Refresh balances after sending
      await fetchBalances()
      
      // Reset form
      setSelectedRune(null)
      setAmount('')
      setRecipient('')
    } catch (error) {
      console.error('Failed to send:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div>Loading rune balances...</div>

  return (
    <div className="space-y-8">
      {/* Balances Display */}
      <div className="grid gap-4 sm:grid-cols-2">
        {balances.map(rune => (
          <div 
            key={rune.name}
            className="p-4 border rounded hover:border-purple-500/30 cursor-pointer"
            onClick={() => setSelectedRune(rune.name)}
          >
            <h3 className="font-bold">{rune.name}</h3>
            <p>Balance: {rune.balance} {rune.symbol}</p>
          </div>
        ))}
      </div>

      {/* Send Form */}
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block mb-2">Selected Rune</label>
          <input
            type="text"
            value={selectedRune || ''}
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
          disabled={sending || !selectedRune || !amount || !recipient}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Runes'}
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