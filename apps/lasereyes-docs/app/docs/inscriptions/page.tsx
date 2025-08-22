"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Send, Search, Code2, Database, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function InscriptionsPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Guide</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Working with Inscriptions
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Learn how to fetch, manage, and send Bitcoin Ordinal inscriptions using LaserEyes.
        </p>
      </div>

      <ClientPageWrapper>
        <InscriptionsContent />
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

function InscriptionsContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              LaserEyes provides comprehensive support for Bitcoin Ordinal inscriptions, allowing you to easily fetch, display,
              and transfer inscriptions across different Bitcoin wallets.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Search}
            title="Fetch Inscriptions"
            description="Retrieve inscriptions for any Bitcoin address with pagination support."
          />
          <FeatureCard
            icon={Send}
            title="Send Inscriptions"
            description="Securely transfer inscriptions between addresses with built-in PSBT support."
          />
          <FeatureCard
            icon={Database}
            title="Rich Metadata"
            description="Access comprehensive inscription metadata including content type, preview, and transaction details."
          />
          <FeatureCard
            icon={Shield}
            title="Safe Transfers"
            description="Built-in safety checks and validations for secure inscription transfers."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">The Inscription Type</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Inscription Interface</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`type Inscription = {
  id: string;              // Unique identifier
  inscriptionId: string;   // Ordinal inscription ID
  content: string;         // Content data
  number: number;          // Inscription number
  address: string;         // Current owner address
  contentType: string;     // MIME type of content
  output: string;          // UTXO containing the inscription
  location: string;        // Location within the UTXO
  genesisTransaction: string; // Transaction where inscription was created
  height: number;          // Block height of inscription
  preview: string;         // Preview URL if available
  outputValue: number;     // Value of the UTXO
  offset?: number;         // Offset within the UTXO
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Fetching Inscriptions</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'

function InscriptionsList() {
  const { getInscriptions } = useLaserEyes()
  const [inscriptions, setInscriptions] = useState([])

  useEffect(() => {
    const fetchInscriptions = async () => {
      // Fetch first 20 inscriptions
      const results = await getInscriptions(0, 20)
      setInscriptions(results)
    }

    fetchInscriptions()
  }, [])

  return (
    <div>
      {inscriptions.map(inscription => (
        <div key={inscription.id}>
          <img 
            src={inscription.preview} 
            alt={\`Inscription #\${inscription.number}\`}
          />
          <p>Number: {inscription.number}</p>
          <p>Content Type: {inscription.contentType}</p>
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
        <h2 className="text-3xl font-bold">Sending Inscriptions</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState } from 'react'

function SendInscription() {
  const { sendInscriptions } = useLaserEyes()
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    try {
      setSending(true)
      
      // Send multiple inscriptions to an address
      const txId = await sendInscriptions(
        ['inscription1', 'inscription2'],
        'bc1p...'  // Recipient address
      )

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
    >
      {sending ? 'Sending...' : 'Send Inscriptions'}
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
              <h3 className="text-lg font-semibold mb-2">1. Pagination</h3>
              <p className="text-muted-foreground">
                Always implement pagination when fetching inscriptions to improve performance and user experience.
                The getInscriptions method accepts offset and limit parameters.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Error Handling</h3>
              <p className="text-muted-foreground">
                Implement proper error handling for both fetching and sending inscriptions.
                Network issues or wallet rejections should be handled gracefully.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Loading States</h3>
              <p className="text-muted-foreground">
                Show appropriate loading states during inscription operations.
                Both fetching and sending can take time to complete.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. Validation</h3>
              <p className="text-muted-foreground">
                Always validate inscription IDs and recipient addresses before attempting transfers.
                The sendInscriptions method will throw if inscriptions are not found.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 