"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Gauge, BarChart2, Cpu, Network, Layers, Workflow, Timer, Scale, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
  badges?: string[]
  stats?: {
    label: string
    value: string
  }[]
}

export default function PerformancePage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        {/* Enhanced background effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-orange-800/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Performance</Badge>
          <Badge variant="secondary" className="bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/20">Optimization</Badge>
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Best Practices</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-orange-900/20 to-yellow-900/20 backdrop-blur-sm ring-1 ring-orange-900/20">
            <Gauge className="h-7 w-7 text-orange-400" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Performance Guide
            </Heading>
            <p className="text-sm text-muted-foreground">Optimize Your Bitcoin Applications</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          Learn how to build lightning-fast Bitcoin applications with LaserEyes' performance optimization techniques and best practices.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Fast by Default</div>
                  <div className="text-xs text-muted-foreground">Optimized core</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <BarChart2 className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Performance Metrics</div>
                  <div className="text-xs text-muted-foreground">Real-time monitoring</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Cpu className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Resource Efficient</div>
                  <div className="text-xs text-muted-foreground">Minimal overhead</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="#implementation">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 group">
              View Optimizations
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#metrics">
            <Button variant="outline" size="lg" className="group">
              <BarChart2 className="mr-2 h-4 w-4" />
              View Metrics
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <PerformanceContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className, badges, stats }: FeatureCardProps) {
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
          <div className="flex gap-2 flex-wrap mb-4">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="bg-orange-900/10 text-orange-400">
                {badge}
              </Badge>
            ))}
          </div>
        )}
        {stats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <div className="text-sm font-medium">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PerformanceContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Performance Categories</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Network}
            title="Network Optimization"
            description="Efficient data fetching and caching strategies for optimal network performance."
            badges={["Caching", "Batching", "Prefetching"]}
            stats={[
              { label: "Cache Hit Rate", value: "95%" },
              { label: "Avg Response", value: "<100ms" }
            ]}
          />
          <FeatureCard
            icon={Layers}
            title="State Management"
            description="Optimized state updates and efficient re-rendering patterns."
            badges={["Atomic Updates", "Memoization", "Lazy Loading"]}
            stats={[
              { label: "Memory Usage", value: "<5MB" },
              { label: "Update Time", value: "<16ms" }
            ]}
          />
          <FeatureCard
            icon={Timer}
            title="Transaction Speed"
            description="Fast transaction processing and efficient signing operations."
            badges={["Parallel Signing", "Quick Broadcast", "Fast Validation"]}
            stats={[
              { label: "Sign Time", value: "<1s" },
              { label: "Broadcast", value: "<2s" }
            ]}
          />
          <FeatureCard
            icon={Scale}
            title="Resource Usage"
            description="Minimal CPU and memory footprint for smooth operation."
            badges={["Low CPU", "Memory Efficient", "Battery Friendly"]}
            stats={[
              { label: "CPU Usage", value: "<5%" },
              { label: "Memory", value: "Optimized" }
            ]}
          />
        </div>
      </section>

      <section id="implementation" className="space-y-6">
        <h2 className="text-3xl font-bold">Implementation Examples</h2>
        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Efficient Data Fetching</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, createBatchLoader } from '@kevinoyl/lasereyes-react'

// Create a batched loader for UTXO fetching
const utxoLoader = createBatchLoader({
  batchSize: 50,
  maxDelay: 100,
  cache: {
    maxAge: 60000,
    staleWhileRevalidate: true
  }
})

function WalletBalance() {
  const { address } = useLaserEyes()
  const { data, isLoading } = useQuery({
    queryKey: ['utxos', address],
    queryFn: () => utxoLoader.load(address),
    staleTime: 30000,
    cacheTime: 60000
  })

  // Render optimized balance display
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Optimized State Updates</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, useOptimizedState } from '@kevinoyl/lasereyes-react'

function TransactionList() {
  const { transactions } = useLaserEyes()
  const optimizedState = useOptimizedState(transactions, {
    batchUpdates: true,
    debounceTime: 100,
    compareFunction: (prev, next) => prev.txid === next.txid
  })

  // Use React.memo for optimized rendering
  const MemoizedTransaction = React.memo(({ tx }) => (
    <TransactionCard tx={tx} />
  ))

  return (
    <div>
      {optimizedState.map(tx => (
        <MemoizedTransaction key={tx.txid} tx={tx} />
      ))}
    </div>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Resource Optimization</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, ResourceManager } from '@kevinoyl/lasereyes-react'

// Configure resource management
const resourceManager = new ResourceManager({
  maxConcurrent: 5,
  memoryLimit: '50MB',
  garbageCollection: {
    enabled: true,
    threshold: '75%'
  }
})

function OptimizedApp() {
  return (
    <LaserEyesProvider
      config={{
        resources: resourceManager,
        performance: {
          enableMetrics: true,
          compression: true,
          workerThreads: true
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section id="metrics" className="space-y-6">
        <Card className="overflow-hidden border-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                <BarChart2 className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Performance Metrics</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor performance metrics in real-time with built-in analytics and profiling tools.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Automatic Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic performance optimization based on usage patterns and resource availability.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Memory Management</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent memory management with automatic garbage collection and resource cleanup.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Network Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed network analysis with bandwidth optimization and request batching.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-orange-900/20 bg-orange-900/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                <Workflow className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Optimization Checklist</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Maximize2 className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Performance Budgets</h3>
                  <p className="text-sm text-muted-foreground">Set and monitor performance budgets for key metrics.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Minimize2 className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Bundle Size</h3>
                  <p className="text-sm text-muted-foreground">Optimize bundle size with code splitting and lazy loading.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Network className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Network Optimization</h3>
                  <p className="text-sm text-muted-foreground">Implement request batching and efficient caching strategies.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Resource Usage</h3>
                  <p className="text-sm text-muted-foreground">Monitor and optimize CPU and memory usage patterns.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

