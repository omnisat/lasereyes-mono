"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Shield, Zap, Code2, Server, Layers, Workflow, GitFork } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
}

export default function DataSourceSystemPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">System</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-transparent">
          DataSource System
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          A powerful abstraction layer for interacting with Bitcoin data providers, offering flexibility, reliability, and seamless integration.
        </p>
      </div>

      <ClientPageWrapper>
        <DataSourceContent />
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

function DataSourceContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              The DataSource system is a core component of LaserEyes that abstracts away the complexities of interacting with
              different Bitcoin data providers. This abstraction allows you to switch providers seamlessly, implement fallbacks,
              and maintain consistent data access across your application.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Database}
            title="Multiple Providers"
            description="Switch between different data providers without changing your application code."
          />
          <FeatureCard
            icon={Shield}
            title="Automatic Fallbacks"
            description="Use multiple data providers simultaneously for redundancy and reliability."
          />
          <FeatureCard
            icon={GitFork}
            title="Custom Sources"
            description="Implement custom data sources for specialized needs with a simple interface."
          />
          <FeatureCard
            icon={Workflow}
            title="Unified Interface"
            description="Handle provider-specific features through a consistent, type-safe API."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Supported Providers</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-4 bg-purple-500">Primary</Badge>
              <h3 className="text-xl font-bold mb-2">Maestro</h3>
              <p className="text-muted-foreground mb-4">
                A comprehensive Bitcoin API with support for Ordinals, inscriptions, and more.
              </p>
              <a
                href="https://www.gomaestro.org/"
                target="_blank"
                rel="noreferrer"
                className="text-purple-500 hover:underline text-sm"
              >
                Learn more →
              </a>
            </CardContent>
          </Card>
          <Card className="border-violet-500/30 bg-violet-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-4 bg-violet-500">Primary</Badge>
              <h3 className="text-xl font-bold mb-2">Sandshrew</h3>
              <p className="text-muted-foreground mb-4">
                Fast and reliable Bitcoin data indexing with excellent developer experience.
              </p>
              <a
                href="https://sandshrew.io/"
                target="_blank"
                rel="noreferrer"
                className="text-violet-500 hover:underline text-sm"
              >
                Learn more →
              </a>
            </CardContent>
          </Card>
          <Card className="border-fuchsia-500/30 bg-fuchsia-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-4 bg-fuchsia-500">Secondary</Badge>
              <h3 className="text-xl font-bold mb-2">Mempool.space</h3>
              <p className="text-muted-foreground mb-4">
                Open-source explorer and API for Bitcoin mempool and network data.
              </p>
              <a
                href="https://mempool.space/"
                target="_blank"
                rel="noreferrer"
                className="text-fuchsia-500 hover:underline text-sm"
              >
                Learn more →
              </a>
            </CardContent>
          </Card>
          <Card className="border-pink-500/30 bg-pink-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-4 bg-pink-500">Secondary</Badge>
              <h3 className="text-xl font-bold mb-2">Esplora</h3>
              <p className="text-muted-foreground mb-4">
                Blockstream's Bitcoin block explorer and HTTP API for basic operations.
              </p>
              <a
                href="https://github.com/Blockstream/esplora"
                target="_blank"
                rel="noreferrer"
                className="text-pink-500 hover:underline text-sm"
              >
                Learn more →
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Configuration</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">React Setup</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="tsx"
              code={`import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { MAINNET } from '@kevinoyl/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET,
        dataSources: {
          // Maestro configuration
          maestro: {
            apiKey: 'your-maestro-api-key',
          },
          // Sandshrew configuration
          sandshrew: {
            url: 'https://api.sandshrew.io',
            apiKey: 'your-sandshrew-api-key',
          },
          // Mempool.space configuration
          mempool: {
            url: 'https://mempool.space/api',
          },
          // Esplora configuration
          esplora: 'https://blockstream.info/api',
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

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Provider Capabilities</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Feature</th>
                    <th className="border p-2 text-center">Maestro</th>
                    <th className="border p-2 text-center">Sandshrew</th>
                    <th className="border p-2 text-center">Mempool</th>
                    <th className="border p-2 text-center">Esplora</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Basic Bitcoin Operations</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Ordinals & Inscriptions</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-red-500">✗</td>
                    <td className="border p-2 text-center text-red-500">✗</td>
                  </tr>
                  <tr>
                    <td className="border p-2">BRC-20 Tokens</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-red-500">✗</td>
                    <td className="border p-2 text-center text-red-500">✗</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Runes</td>
                    <td className="border p-2 text-center text-green-500">✓</td>
                    <td className="border p-2 text-center text-red-500">✗</td>
                    <td className="border p-2 text-center text-red-500">✗</td>
                    <td className="border p-2 text-center text-red-500">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Custom Implementation</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Custom DataSource</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { DataSource, NetworkType } from '@kevinoyl/lasereyes-core'

class CustomDataSource implements DataSource {
  constructor(private apiKey: string, private network: NetworkType) {}

  async getBalance(address: string): Promise<string> {
    const response = await fetch(
      \`https://your-api.com/balance/\${address}?apiKey=\${this.apiKey}\`
    )
    const data = await response.json()
    return data.balance
  }

  async getUtxos(address: string): Promise<UTXO[]> {
    const response = await fetch(
      \`https://your-api.com/utxos/\${address}?apiKey=\${this.apiKey}\`
    )
    const data = await response.json()
    return data.utxos
  }

  // Implement other required methods...
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Best Practices</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Multiple Providers</h3>
              <p className="text-muted-foreground">
                Configure multiple data providers for redundancy. If one provider fails,
                LaserEyes will automatically fall back to others.
              </p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">API Keys</h3>
              <p className="text-muted-foreground">
                Register for your own API keys with data providers for production use.
                Development keys are rate-limited.
              </p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
              <p className="text-muted-foreground">
                Implement proper error handling for blockchain operations.
                Network issues or provider outages can occur.
              </p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Caching</h3>
              <p className="text-muted-foreground">
                Cache frequently accessed data to reduce API calls and improve
                performance. Monitor your API usage.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

