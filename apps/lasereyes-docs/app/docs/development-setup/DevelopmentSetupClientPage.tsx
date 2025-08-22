"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Code2,
  GitBranch,
  Terminal,
  PackageSearch,
  FolderTree,
  Wrench,
  Bug,
  FileCode,
  AlertTriangle,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SetupCardProps {
  icon: LucideIcon
  title: string
  description?: string
  content: React.ReactNode
  className?: string
}

function SetupCard({ icon: Icon, title, description, content, className }: SetupCardProps) {
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
        {description && <p className="mb-4 text-muted-foreground">{description}</p>}
        {content}
      </CardContent>
    </Card>
  )
}

function DevelopmentSetupContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Prerequisites</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <SetupCard
            icon={Terminal}
            title="Required Tools"
            content={
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Node.js</Badge>
                  <span>Version 18 or higher</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">pnpm</Badge>
                  <span>Package manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Git</Badge>
                  <span>Version control</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">VS Code</Badge>
                  <span>Recommended editor</span>
                </li>
              </ul>
            }
          />
          <SetupCard
            icon={Code2}
            title="Knowledge Prerequisites"
            content={
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">TypeScript</Badge>
                  <span>Core language</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">React</Badge>
                  <span>For components</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Bitcoin</Badge>
                  <span>Basic concepts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Testing</Badge>
                  <span>Jest & RTL</span>
                </li>
              </ul>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Repository Setup</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <SetupCard
            icon={GitBranch}
            title="Fork & Clone"
            content={
              <CodeBlock
                language="bash"
                code={`# Clone your fork
git clone https://github.com/YOUR_USERNAME/lasereyes.git

# Navigate to the project
cd lasereyes

# Add upstream remote
git remote add upstream https://github.com/omnisat/lasereyes.git`}
                copyButton={true}
              />
            }
          />
          <SetupCard
            icon={PackageSearch}
            title="Install Dependencies"
            content={
              <div className="space-y-4">
                <CodeBlock
                  language="bash"
                  code="pnpm install"
                  copyButton={true}
                />
                <p className="text-sm text-muted-foreground">
                  This will install all dependencies for the monorepo packages.
                </p>
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Project Structure</h2>
        <SetupCard
          icon={FolderTree}
          title="Monorepo Layout"
          content={
            <CodeBlock
              language="text"
              code={`lasereyes/
├── packages/
│   ├── core/                 # Core functionality
│   ├── react/                # React integration
│   ├── datasources/          # DataSource implementations
│   │   ├── maestro/          # Maestro DataSource
│   │   ├── sandshrew/        # Sandshrew DataSource
│   │   └── mempool-space/    # Mempool.space DataSource
│   └── utils/                # Shared utilities
├── examples/                 # Example applications
├── docs/                     # Documentation
├── scripts/                  # Build scripts
├── tests/                    # Test suites
└── package.json             # Root package.json`}
              copyButton={true}
            />
          }
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Development Workflow</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <SetupCard
            icon={Wrench}
            title="Build & Watch"
            content={
              <div className="space-y-4">
                <CodeBlock
                  language="bash"
                  code={`# Build all packages
pnpm build

# Watch mode
pnpm dev`}
                  copyButton={true}
                />
              </div>
            }
          />
          <SetupCard
            icon={Bug}
            title="Testing"
            content={
              <div className="space-y-4">
                <CodeBlock
                  language="bash"
                  code={`# Run all tests
pnpm test

# Test specific package
pnpm test --filter=@kevinoyl/lasereyes-core

# Watch mode
pnpm test:watch`}
                  copyButton={true}
                />
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Testing Environment</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <SetupCard
            icon={FileCode}
            title="API Keys Setup"
            content={
              <div className="space-y-4">
                <CodeBlock
                  language="bash"
                  code={`# .env.local
MAESTRO_API_KEY=test_key_123
SANDSHREW_API_KEY=test_key_456`}
                  copyButton={true}
                />
                <div className="rounded-md border-l-4 border-yellow-500 bg-yellow-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Never commit API keys to the repository</span>
                  </div>
                </div>
              </div>
            }
          />
          <SetupCard
            icon={HelpCircle}
            title="Test Networks"
            content={
              <div className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Bitcoin Testnet for integration testing</li>
                  <li>• Regtest for local development</li>
                  <li>• Mock DataSources for unit testing</li>
                </ul>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">Get testnet coins from:</p>
                  <div className="mt-2 space-y-1">
                    <Link href="https://coinfaucet.eu/en/btc-testnet/" className="text-sm text-purple-500 hover:underline">
                      coinfaucet.eu
                    </Link>
                    <br />
                    <Link href="https://testnet-faucet.mempool.co/" className="text-sm text-purple-500 hover:underline">
                      testnet-faucet.mempool.co
                    </Link>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-semibold mb-2">Common Issues</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Clean and rebuild:</strong>
                    <CodeBlock
                      language="bash"
                      code="pnpm clean && pnpm install && pnpm build"
                      copyButton={true}
                    />
                  </li>
                  <li>
                    <strong>Check dependencies:</strong>
                    <CodeBlock
                      language="bash"
                      code="pnpm why package-name"
                      copyButton={true}
                    />
                  </li>
                  <li>
                    <strong>Node.js version:</strong> Use version in <code>.nvmrc</code>
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                <span>Need more help? Join our Discord or open a GitHub discussion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function DevelopmentSetupClientPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Setup Guide</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-purple-500 to-violet-500 bg-clip-text text-transparent">
          Development Setup
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Get your development environment ready to contribute to LaserEyes. Follow this guide to set up your workspace and start building.
        </p>
      </div>

      <ClientPageWrapper>
        <DevelopmentSetupContent />
      </ClientPageWrapper>
    </div>
  )
} 