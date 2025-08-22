"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code2, Puzzle, Workflow, Layers, Settings, ArrowRight, Wrench, Boxes, Cpu, GitFork } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function CustomDataSourcePage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-violet-600/20 via-background to-background p-8">
        {/* Enhanced background effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-violet-400/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-violet-500/10 text-violet-500 hover:bg-violet-500/20">Advanced</Badge>
          <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20">Extensible</Badge>
          <Badge variant="secondary" className="bg-violet-500/10 text-violet-500 hover:bg-violet-500/20">Customizable</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-sm ring-1 ring-violet-500/20">
            <Puzzle className="h-7 w-7 text-violet-500" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Custom DataSource
            </Heading>
            <p className="text-sm text-muted-foreground">Build Your Own Bitcoin Data Provider</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          Create custom data sources to integrate any Bitcoin data provider with LaserEyes. Perfect for specialized use cases and custom infrastructure.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-violet-500/20 bg-violet-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <Workflow className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Flexible</div>
                  <div className="text-xs text-muted-foreground">Any data source</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-500/20 bg-violet-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <Layers className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Composable</div>
                  <div className="text-xs text-muted-foreground">Mix & match</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-500/20 bg-violet-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <Code2 className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Type-Safe</div>
                  <div className="text-xs text-muted-foreground">Full TypeScript</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-500/20 bg-violet-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <Settings className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Configurable</div>
                  <div className="text-xs text-muted-foreground">Full control</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="#implementation">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 group">
              Start Building
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#examples">
            <Button variant="outline" size="lg" className="group">
              <Code2 className="mr-2 h-4 w-4" />
              View Examples
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <CustomDataSourceContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-violet-500/10 blur-2xl filter group-hover:bg-violet-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-500 ring-1 ring-violet-500/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function CustomDataSourceContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Wrench}
            title="Custom Implementation"
            description="Build data sources tailored to your specific needs, from custom APIs to specialized blockchain indexers."
          />
          <FeatureCard
            icon={Boxes}
            title="Modular Design"
            description="Mix and match different data sources, with automatic fallback support and priority handling."
          />
          <FeatureCard
            icon={Cpu}
            title="Performance Control"
            description="Optimize performance with custom caching strategies, request batching, and error handling."
          />
          <FeatureCard
            icon={GitFork}
            title="Extensible Interface"
            description="Implement only the methods you need, with TypeScript ensuring type safety throughout."
          />
        </div>
      </section>

      <section id="implementation" className="space-y-6">
        <h2 className="text-3xl font-bold">Implementation Guide</h2>
        <Card className="overflow-hidden border-2 border-dashed border-violet-500/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Custom Data Source</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { DataSource, DataSourceConfig } from '@kevinoyl/lasereyes-core'

interface CustomConfig extends DataSourceConfig {
  apiKey?: string
  baseUrl: string
}

export class CustomDataSource implements DataSource {
  private config: CustomConfig

  constructor(config: CustomConfig) {
    this.config = config
  }

  async getBalance(address: string): Promise<string> {
    const response = await fetch(\`\${this.config.baseUrl}/balance/\${address}\`)
    const data = await response.json()
    return data.balance
  }

  async getTransaction(txid: string): Promise<any> {
    const response = await fetch(\`\${this.config.baseUrl}/tx/\${txid}\`)
    return response.json()
  }

  // Implement other methods as needed...
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Configuration</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Setup</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { LaserEyesClient, createConfig } from '@kevinoyl/lasereyes-core'
import { CustomDataSource } from './custom-datasource'

const config = createConfig({
  dataSources: {
    custom: new CustomDataSource({
      baseUrl: 'https://your-api.com',
      apiKey: 'your-api-key',
      priority: 1
    }),
    mempool: {  // Fallback source
      priority: 2
    }
  }
})

const client = new LaserEyesClient(config)`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section id="examples" className="space-y-6">
        <h2 className="text-3xl font-bold">Advanced Examples</h2>
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h2 className="font-mono text-sm font-medium">Caching Implementation</h2>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`export class CachedDataSource implements DataSource {
  private cache: Map<string, { data: any, timestamp: number }>
  private ttl: number // Time to live in ms

  constructor(config: CustomConfig) {
    this.cache = new Map()
    this.ttl = config.cacheTTL || 60000 // 1 minute default
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data as T
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  async getBalance(address: string): Promise<string> {
    const cacheKey = \`balance:\${address}\`
    const cached = this.getCached<string>(cacheKey)
    if (cached) return cached

    const balance = await super.getBalance(address)
    this.setCache(cacheKey, balance)
    return balance
  }
}`}
                copyButton={true}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50 px-6">
              <h2 className="font-mono text-sm font-medium">Batch Processing</h2>
            </CardHeader>
            <CardContent className="p-6">
              <CodeBlock
                language="typescript"
                code={`export class BatchDataSource implements DataSource {
  private batchSize: number
  private batchDelay: number
  private queue: Map<string, Promise<any>>

  constructor(config: CustomConfig) {
    this.batchSize = config.batchSize || 10
    this.batchDelay = config.batchDelay || 100
    this.queue = new Map()
  }

  private async processBatch(addresses: string[]): Promise<Record<string, string>> {
    const response = await fetch(this.config.baseUrl + '/batch', {
      method: 'POST',
      body: JSON.stringify({ addresses })
    })
    return response.json()
  }

  async getBalance(address: string): Promise<string> {
    if (this.queue.has(address)) {
      return this.queue.get(address)!
    }

    const promise = new Promise<string>(async (resolve) => {
      await new Promise(r => setTimeout(r, this.batchDelay))
      const batch = Array.from(this.queue.keys()).slice(0, this.batchSize)
      const results = await this.processBatch(batch)
      resolve(results[address])
    })

    this.queue.set(address, promise)
    return promise
  }
}`}
                copyButton={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Wrench className="h-5 w-5 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold">Best Practices</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Error Handling</h3>
                <p className="text-sm text-muted-foreground">
                  Implement proper error handling and normalize errors to match the LaserEyes error format.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  Add rate limiting and request queuing to prevent API abuse and handle throttling gracefully.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Normalization</h3>
                <p className="text-sm text-muted-foreground">
                  Normalize response data to match the expected format of other data sources for consistency.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Performance</h3>
                <p className="text-sm text-muted-foreground">
                  Implement caching and batch processing where appropriate to optimize performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

