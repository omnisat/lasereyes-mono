"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertTriangle, ShieldAlert, Network, Wifi, Wallet, Bug, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
  badges?: string[]
}

export default function ErrorHandlingPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        {/* Enhanced background effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-orange-800/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Error Types</Badge>
          <Badge variant="secondary" className="bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/20">Recovery</Badge>
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Best Practices</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-orange-900/20 to-yellow-900/20 backdrop-blur-sm ring-1 ring-orange-900/20">
            <AlertTriangle className="h-7 w-7 text-orange-400" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Error Handling
            </Heading>
            <p className="text-sm text-muted-foreground">Comprehensive Error Management Guide</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          Learn how to handle errors gracefully in your Bitcoin applications with LaserEyes' robust error handling system.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <ShieldAlert className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Error Types</div>
                  <div className="text-xs text-muted-foreground">Categorized errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <RefreshCw className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Recovery</div>
                  <div className="text-xs text-muted-foreground">Error recovery patterns</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Bug className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Debugging</div>
                  <div className="text-xs text-muted-foreground">Debug strategies</div>
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
          <Link href="#best-practices">
            <Button variant="outline" size="lg" className="group">
              <AlertCircle className="mr-2 h-4 w-4" />
              Best Practices
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <ErrorHandlingContent />
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

function ErrorHandlingContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Error Categories</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Network}
            title="Network Errors"
            description="Handle connection issues, timeouts, and network-related failures gracefully."
            badges={["Timeout", "Connection Lost", "Rate Limit"]}
          />
          <FeatureCard
            icon={Wallet}
            title="Wallet Errors"
            description="Manage wallet connection, signing, and permission-related errors."
            badges={["Not Connected", "Rejected", "Insufficient Funds"]}
          />
          <FeatureCard
            icon={Bug}
            title="Transaction Errors"
            description="Handle transaction validation, broadcasting, and confirmation errors."
            badges={["Invalid Input", "Broadcast Failed", "Unconfirmed"]}
          />
          <FeatureCard
            icon={Wifi}
            title="API Errors"
            description="Handle API response errors, rate limiting, and data validation issues."
            badges={["Invalid Response", "Rate Limited", "Validation"]}
          />
        </div>
      </section>

      <section id="implementation" className="space-y-6">
        <h2 className="text-3xl font-bold">Implementation Examples</h2>
        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Basic Error Handling</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, WalletError, NetworkError } from '@kevinoyl/lasereyes-react'

function WalletConnect() {
  const { connect } = useLaserEyes()

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      if (error instanceof WalletError) {
        // Handle wallet-specific errors
        console.error('Wallet error:', error.message)
      } else if (error instanceof NetworkError) {
        // Handle network-related errors
        console.error('Network error:', error.message)
      } else {
        // Handle unknown errors
        console.error('Unknown error:', error)
      }
    }
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Advanced Error Recovery</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, useErrorHandler } from '@kevinoyl/lasereyes-react'

function TransactionComponent() {
  const { sendBitcoin } = useLaserEyes()
  const errorHandler = useErrorHandler({
    onWalletError: async (error) => {
      // Attempt to reconnect wallet
      await reconnectWallet()
    },
    onNetworkError: async (error) => {
      // Retry with exponential backoff
      await retryWithBackoff(async () => {
        // Original transaction logic
      })
    },
    onTransactionError: async (error) => {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        // Show insufficient funds UI
      } else if (error.code === 'BROADCAST_FAILED') {
        // Attempt to rebroadcast
        await rebroadcastTransaction(error.txHex)
      }
    }
  })

  const handleSend = async () => {
    try {
      await sendBitcoin({
        address: 'bc1q...',
        amount: 0.001
      })
    } catch (error) {
      await errorHandler.handle(error)
    }
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Custom Error Boundaries</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { LaserEyesErrorBoundary } from '@kevinoyl/lasereyes-react'

function App() {
  return (
    <LaserEyesErrorBoundary
      fallback={({ error, reset }) => (
        <div className="error-container">
          <h2>Something went wrong!</h2>
          <pre>{error.message}</pre>
          <button onClick={reset}>Try again</button>
        </div>
      )}
      onError={(error) => {
        // Log error to monitoring service
        logError(error)
      }}
    >
      <YourApp />
    </LaserEyesErrorBoundary>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section id="best-practices" className="space-y-6">
        <Card className="overflow-hidden border-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Best Practices</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Error Classification</h3>
                <p className="text-sm text-muted-foreground">
                  Always categorize errors properly to provide appropriate user feedback and recovery strategies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Graceful Degradation</h3>
                <p className="text-sm text-muted-foreground">
                  Implement fallback mechanisms and graceful degradation for critical functionality.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Error Boundaries</h3>
                <p className="text-sm text-muted-foreground">
                  Use error boundaries to prevent entire app crashes and provide meaningful recovery options.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Error Logging</h3>
                <p className="text-sm text-muted-foreground">
                  Implement comprehensive error logging for debugging and monitoring in production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

