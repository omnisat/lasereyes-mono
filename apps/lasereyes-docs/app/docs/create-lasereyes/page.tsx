'use client'

import * as React from 'react'
import { CodeBlock } from '@/components/code-block'
import { Heading } from '@/components/heading'
import { ClientPageWrapper } from '@/components/client-page-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Bot, Zap, Palette, Bitcoin } from 'lucide-react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

function CreateLaserEyesContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-4" id="quick-start">
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Quick Start</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock code="npx create-lasereyes" language="bash" copyButton={true} />
            <div className="mt-4 text-sm text-muted-foreground">
              Then follow the interactive prompts to configure your project.
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <CodeBlock 
              code={`cd your-project-name\nnpm run dev`}
              language="bash"
              copyButton={true}
            />
            <div className="flex flex-col justify-center">
              <h3 className="mb-2 text-lg font-semibold">Launch Your Project</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to your new project directory and start the development server to see your Bitcoin app in action.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="features">
        <h2 className="text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Zap}
            title="⚡️ Next.js Integration"
            description="Modern Next.js project with App Router, React 18, and TypeScript configuration out of the box."
          />
          <FeatureCard
            icon={Bitcoin}
            title="🔐 Bitcoin Wallet Integration"
            description="Pre-configured wallet connection modal supporting UniSat, Xverse, Oyl, Magic Eden, and more."
          />
          <FeatureCard
            icon={Palette}
            title="🎨 Modern Styling"
            description="Beautiful UI with Shadcn components, Tailwind CSS, and automatic dark mode support."
          />
          <FeatureCard
            icon={Bot}
            title="🤖 Developer Experience"
            description="Enhanced development with Cursor.ai integration, TypeScript, and proper tooling configuration."
          />
        </div>
      </section>

      <section className="space-y-6" id="cli-options">
        <h2 className="text-3xl font-bold">CLI Options</h2>
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Option</th>
                    <th className="py-3 px-4 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4"><code className="rounded bg-muted px-2 py-1">-t, --template [name]</code></td>
                    <td className="py-3 px-4">Specify template (next-app, vue-app)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4"><code className="rounded bg-muted px-2 py-1">--npm</code></td>
                    <td className="py-3 px-4">Use npm package manager</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4"><code className="rounded bg-muted px-2 py-1">--pnpm</code></td>
                    <td className="py-3 px-4">Use pnpm package manager</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4"><code className="rounded bg-muted px-2 py-1">--yarn</code></td>
                    <td className="py-3 px-4">Use yarn package manager</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4"><code className="rounded bg-muted px-2 py-1">--tailwind</code></td>
                    <td className="py-3 px-4">Install TailwindCSS (default: true)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="rounded bg-muted px-2 py-1">--shadcn</code></td>
                    <td className="py-3 px-4">Install Shadcn UI components</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="project-structure">
        <h2 className="text-3xl font-bold">Project Structure</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <CodeBlock 
              code={`your-project-name/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx    # Root layout with providers
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── ui/           # Reusable Shadcn UI Components
│   │   ├── ConnectWallet.tsx # LaserEyes Wallet Connection
│   │   ├── DefaultLayout.tsx # LaserEyes Provider Wrapper
│   │   └── ThemeToggle.tsx   # Light/Dark Mode Toggle
│   └── lib/
│       └── utils.ts
├── .cursorrules          # AI assistant configuration
└── package.json`}
              language="text"
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6" id="framework-support">
        <h2 className="text-3xl font-bold">Framework Support</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-green-500">Ready</Badge>
              <h3 className="text-lg font-semibold">Next.js (App Router)</h3>
              <p className="mt-2 text-sm text-muted-foreground">Fully supported and production-ready</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-yellow-500">Coming Soon</Badge>
              <h3 className="text-lg font-semibold">Vue 3 + Vite</h3>
              <p className="mt-2 text-sm text-muted-foreground">In active development</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-blue-500">Planned</Badge>
              <h3 className="text-lg font-semibold">Vanilla JS</h3>
              <p className="mt-2 text-sm text-muted-foreground">On our roadmap</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6" id="contributing">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Contributing</h2>
            <ol className="list-decimal pl-6 space-y-2 mb-6">
              <li>Fork the repository</li>
              <li>Create a feature branch: <code className="rounded bg-muted px-2 py-1">git checkout -b feature/your-feature-name</code></li>
              <li>Commit your changes: <code className="rounded bg-muted px-2 py-1">git commit -m 'Add some feature'</code></li>
              <li>Push to the branch: <code className="rounded bg-muted px-2 py-1">git push origin feature/your-feature-name</code></li>
              <li>Submit a pull request</li>
            </ol>
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">License</h3>
              <p className="text-muted-foreground">MIT License - feel free to use this in your own projects!</p>
            </div>
          </CardContent>
        </Card>
      </section>
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

export default function CreateLaserEyesPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">CLI Tool</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Create LaserEyes
        </Heading>
        <p className="text-xl mb-6 max-w-2xl">
          The fastest way to scaffold modern Bitcoin applications with Next.js and LaserEyes wallet integration.
        </p>
        <div className="flex gap-4 items-center">
          <Link href="#quick-start">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Badge variant="secondary" className="h-7 px-3">v1.0.0</Badge>
        </div>
      </div>

      <ClientPageWrapper>
        <CreateLaserEyesContent />
      </ClientPageWrapper>
    </div>
  )
} 