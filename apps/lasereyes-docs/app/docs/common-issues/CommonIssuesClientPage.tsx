"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bug, Wallet, Network, RefreshCcw, Zap, ShieldAlert, Settings } from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface IssueCardProps {
  icon: LucideIcon
  title: string
  description: string
  solution: string
  code?: string
  className?: string
}

function IssueCard({ icon: Icon, title, description, solution, code, className }: IssueCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-red-500/10 blur-2xl filter group-hover:bg-red-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="mb-4 text-muted-foreground">{description}</p>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-semibold">Solution:</h4>
            <p className="text-sm text-muted-foreground">{solution}</p>
          </div>
          {code && (
            <CodeBlock
              language="typescript"
              code={code}
              copyButton={true}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CommonIssuesContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Connection Issues</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <IssueCard
            icon={Wallet}
            title="Wallet Not Detected"
            description="The wallet extension is installed but not being detected by LaserEyes."
            solution="Ensure the wallet extension is properly installed and enabled in your browser. Try refreshing the page or restarting your browser."
            code={`// Check if wallet is available
const { isWalletAvailable } = useLaserEyes()

if (!isWalletAvailable) {
  // Show wallet installation prompt
}`}
          />
          <IssueCard
            icon={Network}
            title="Network Mismatch"
            description="Wallet is connected to a different network than what's configured in LaserEyes."
            solution="Ensure your wallet and LaserEyes provider are configured for the same network (mainnet/testnet)."
            code={`<LaserEyesProvider
  config={{
    network: MAINNET, // or TESTNET
    enforceNetwork: true // Will enforce network matching
  }}
>`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Transaction Issues</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <IssueCard
            icon={AlertTriangle}
            title="Transaction Failures"
            description="Transactions are failing or getting stuck in a pending state."
            solution="Check for sufficient balance, proper fee estimation, and network congestion. Use the onError callback to handle failures gracefully."
            code={`const { sendBTC } = useLaserEyes()

try {
  await sendBTC({
    address: recipient,
    amount: "1000000", // in sats
    feeRate: "high", // Use higher fee rate during congestion
  })
} catch (error) {
  // Handle error appropriately
  console.error('Transaction failed:', error)
}`}
          />
          <IssueCard
            icon={Bug}
            title="Inscription Errors"
            description="Issues with inscribing or transferring ordinals and BRC-20 tokens."
            solution="Verify inscription ownership, check for proper UTXO selection, and ensure sufficient balance for fees."
            code={`const { getInscriptions, transferInscription } = useLaserEyes()

// Get all inscriptions first
const inscriptions = await getInscriptions()

// Verify ownership before transfer
const inscription = inscriptions.find(i => i.id === inscriptionId)
if (inscription?.owner !== address) {
  throw new Error('Inscription not owned by connected wallet')
}`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">State Management</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <IssueCard
            icon={RefreshCcw}
            title="Stale State"
            description="Wallet state not updating after transactions or network changes."
            solution="Use the refresh methods provided by LaserEyes to manually update state when needed."
            code={`const { refreshBalance, refreshInscriptions } = useLaserEyes()

// After a transaction completes
await refreshBalance()
await refreshInscriptions()`}
          />
          <IssueCard
            icon={ShieldAlert}
            title="Permission Issues"
            description="Wallet permissions being requested multiple times or unexpectedly."
            solution="Implement proper permission handling and state persistence using the LaserEyes storage options."
            code={`const { requestPermission, hasPermission } = useLaserEyes()

// Check permission before requesting
if (!await hasPermission('sign')) {
  await requestPermission('sign')
}`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Performance Issues</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <IssueCard
            icon={Zap}
            title="Slow Data Loading"
            description="Wallet data and inscriptions taking too long to load."
            solution="Implement proper loading states and consider using the LaserEyes caching system."
            code={`const { getInscriptions, getCachedInscriptions } = useLaserEyes()

// Use cached data first
const cached = getCachedInscriptions()
if (cached) {
  // Show cached data immediately
  setInscriptions(cached)
}

// Then fetch fresh data
const fresh = await getInscriptions()
setInscriptions(fresh)`}
          />
          <IssueCard
            icon={Settings}
            title="Memory Leaks"
            description="Application performance degrading over time due to subscription handling."
            solution="Properly cleanup subscriptions and event listeners when components unmount."
            code={`useEffect(() => {
  const unsubscribe = subscribeToWalletEvents()
  
  // Cleanup on unmount
  return () => {
    unsubscribe()
  }
}, [])`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Still Having Issues?</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="https://github.com/omnisat/lasereyes/issues" className="block">
                <Card className="h-full transition-all hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Open an Issue</h3>
                    <p className="text-sm text-muted-foreground">Report bugs and request features on our GitHub repository</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/docs/debugging" className="block">
                <Card className="h-full transition-all hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Debugging Guide</h3>
                    <p className="text-sm text-muted-foreground">Learn advanced debugging techniques for LaserEyes apps</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function CommonIssuesClientPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-red-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Troubleshooting</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-transparent">
          Common Issues
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Solutions to common problems you might encounter when building with LaserEyes.
        </p>
      </div>

      <ClientPageWrapper>
        <CommonIssuesContent />
      </ClientPageWrapper>
    </div>
  )
}

