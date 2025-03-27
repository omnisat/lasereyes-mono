"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Zap, 
  Code2, 
  RefreshCw, 
  Database, 
  LayoutGrid, 
  Wallet,
  Lock,
  Cpu,
  FileCode2,
  Network,
  Bug
} from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PracticeCardProps {
  icon: LucideIcon
  title: string
  description: string
  code?: string
  className?: string
}

function PracticeCard({ icon: Icon, title, description, code, className }: PracticeCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-blue-500/10 blur-2xl filter group-hover:bg-blue-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="mb-4 text-muted-foreground">{description}</p>
        {code && (
          <CodeBlock
            language="typescript"
            code={code}
            copyButton={true}
          />
        )}
      </CardContent>
    </Card>
  )
}

function BestPracticesContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Wallet Integration</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <PracticeCard
            icon={Wallet}
            title="Proper Provider Setup"
            description="Always wrap your app with LaserEyesProvider at the root level and configure network settings appropriately."
            code={`// _app.tsx or layout.tsx
export default function RootLayout({ children }) {
  return (
    <LaserEyesProvider
      config={{
        network: MAINNET,
        enforceNetwork: true,
        autoConnect: true
      }}
    >
      {children}
    </LaserEyesProvider>
  )
}`}
          />
          <PracticeCard
            icon={Lock}
            title="Connection Management"
            description="Handle wallet connections gracefully with proper error handling and user feedback."
            code={`const { connect, disconnect } = useLaserEyes()

try {
  await connect(UNISAT)
  showSuccessToast('Wallet connected!')
} catch (error) {
  showErrorToast(error.message)
  // Log error for debugging
  console.error('Connection failed:', error)
}`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">State Management</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <PracticeCard
            icon={RefreshCw}
            title="State Updates"
            description="Keep wallet state fresh by implementing proper update strategies and handling state changes."
            code={`// Subscribe to state changes
useEffect(() => {
  const unsubscribe = subscribeToWalletEvents(
    (event) => {
      if (event.type === 'networkChanged') {
        refreshBalance()
      }
    }
  )
  return () => unsubscribe()
}, [])`}
          />
          <PracticeCard
            icon={Database}
            title="Data Persistence"
            description="Implement proper caching and persistence strategies for better performance and UX."
            code={`// Cache frequently accessed data
const { getCachedBalance, refreshBalance } = useLaserEyes()

// Use cached data first
const cached = getCachedBalance()
if (cached) {
  setBalance(cached)
}

// Then fetch fresh data
const fresh = await refreshBalance()
setBalance(fresh)`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Performance</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <PracticeCard
            icon={Cpu}
            title="Optimization"
            description="Optimize your application's performance with proper data fetching and rendering strategies."
            code={`// Use React.memo for expensive components
const WalletInfo = React.memo(({ address }) => (
  <div>
    <AddressDisplay address={address} />
    <BalanceDisplay address={address} />
  </div>
))

// Implement proper loading states
const { data, isLoading } = useInscriptions()
if (isLoading) return <LoadingSpinner />`}
          />
          <PracticeCard
            icon={Zap}
            title="Efficient Updates"
            description="Implement efficient update patterns to minimize unnecessary re-renders and API calls."
            code={`// Use callbacks for event handlers
const handleTransfer = useCallback(async () => {
  setLoading(true)
  try {
    await transfer(...)
    await refreshBalance()
  } finally {
    setLoading(false)
  }
}, [transfer, refreshBalance])`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Security</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <PracticeCard
            icon={Shield}
            title="Transaction Safety"
            description="Implement proper transaction validation and confirmation handling for secure operations."
            code={`// Validate transactions before sending
const { validateTransaction } = useLaserEyes()

try {
  await validateTransaction({
    recipient,
    amount,
    feeRate
  })
  // Proceed with transaction
} catch (error) {
  // Handle validation error
}`}
          />
          <PracticeCard
            icon={Bug}
            title="Error Handling"
            description="Implement comprehensive error handling and recovery strategies."
            code={`try {
  await sendTransaction(...)
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    notifyUser('Insufficient funds')
  } else if (error.code === 'NETWORK_ERROR') {
    await retryWithBackoff(sendTransaction)
  } else {
    reportError(error)
  }
}`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Code Organization</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <PracticeCard
            icon={FileCode2}
            title="Component Structure"
            description="Organize your wallet-related components and hooks in a maintainable way."
            code={`// src/features/wallet/hooks/useWalletConnection.ts
export function useWalletConnection() {
  const laser = useLaserEyes()
  // Custom connection logic
  return {
    connect: async () => {...},
    disconnect: async () => {...}
  }
}

// src/features/wallet/components/WalletButton.tsx
export function WalletButton() {
  const { connect } = useWalletConnection()
  // Button implementation
}`}
          />
          <PracticeCard
            icon={LayoutGrid}
            title="Feature Organization"
            description="Structure your Bitcoin features in a modular and scalable way."
            code={`src/features/
├── wallet/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── inscriptions/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── transactions/
    ├── components/
    ├── hooks/
    └── utils/`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/docs/debugging" className="block">
                <Card className="h-full transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Debugging Guide</h3>
                    <p className="text-sm text-muted-foreground">Learn how to effectively debug LaserEyes applications</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/docs/examples" className="block">
                <Card className="h-full transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Examples</h3>
                    <p className="text-sm text-muted-foreground">Explore real-world examples and patterns</p>
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

export default function BestPracticesClientPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Guidelines</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Best Practices
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Learn how to build robust and maintainable Bitcoin applications with LaserEyes best practices and patterns.
        </p>
      </div>

      <ClientPageWrapper>
        <BestPracticesContent />
      </ClientPageWrapper>
    </div>
  )
}

