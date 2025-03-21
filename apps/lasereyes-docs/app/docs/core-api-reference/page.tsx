"use client"

import * as React from "react"
import Link from "next/link"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Database, Wallet, Cog, Layers, Plug, Shield, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
  href: string
}

function FeatureCard({ icon: Icon, title, description, href, className }: FeatureCardProps) {
  return (
    <Link href={href} className="block">
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5",
        className
      )}>
        <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
        <CardContent className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-semibold group-hover:text-orange-500 transition-colors">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <div className="mt-4 flex items-center text-orange-500">
            <span className="text-sm">Learn more</span>
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CoreApiContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-lg leading-relaxed">
              The LaserEyes Core API provides a powerful foundation for building Bitcoin applications. It's designed to be flexible, 
              type-safe, and framework-agnostic, making it suitable for any JavaScript or TypeScript project.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Core Components</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Wallet}
            title="LaserEyesClient"
            description="The central client that orchestrates wallet connections, transactions, and data retrieval."
            href="/docs/laser-eyes-client"
          />
          <FeatureCard
            icon={Database}
            title="DataSourceManager"
            description="Manages interactions with Bitcoin data providers like Maestro, Sandshrew, and Mempool.space."
            href="/docs/data-source-manager"
          />
          <FeatureCard
            icon={Plug}
            title="Wallet Providers"
            description="Constants and adapters for interacting with different Bitcoin wallet providers."
            href="/docs/wallet-providers"
          />
          <FeatureCard
            icon={Shield}
            title="Security Manager"
            description="Handles secure key management, transaction signing, and message verification."
            href="/docs/security"
          />
          <FeatureCard
            icon={Layers}
            title="Transaction Builder"
            description="Utilities for constructing and managing Bitcoin transactions and PSBTs."
            href="/docs/transaction-builder"
          />
          <FeatureCard
            icon={Cog}
            title="Configuration"
            description="Flexible configuration system for customizing LaserEyes behavior."
            href="/docs/configuration"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Core Concepts</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Framework Agnostic</h3>
              <p className="text-muted-foreground mb-4">
                The core API is designed to work with any JavaScript framework or vanilla JS project. It provides the foundation that framework-specific packages build upon.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Code2 className="h-4 w-4 mr-2 text-orange-500" />
                  Pure TypeScript implementation
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-orange-500" />
                  No framework dependencies
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-orange-500" />
                  Consistent behavior across platforms
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Extensible Architecture</h3>
              <p className="text-muted-foreground mb-4">
                LaserEyes is built with extensibility in mind, allowing you to customize and extend its functionality to meet your specific needs.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Plug className="h-4 w-4 mr-2 text-orange-500" />
                  Custom wallet providers
                </li>
                <li className="flex items-center">
                  <Database className="h-4 w-4 mr-2 text-orange-500" />
                  Custom data sources
                </li>
                <li className="flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-orange-500" />
                  Plugin system
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Getting Started</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/docs/installation" className="block">
            <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Installation Guide</h3>
                  <p className="text-sm text-muted-foreground">Learn how to install and set up LaserEyes in your project</p>
                </div>
                <ArrowRight className="mt-4 h-5 w-5 text-orange-500" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/docs/examples" className="block">
            <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Examples & Recipes</h3>
                  <p className="text-sm text-muted-foreground">Explore practical examples and common use cases</p>
                </div>
                <ArrowRight className="mt-4 h-5 w-5 text-orange-500" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default function CoreApiReferencePage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">API Reference</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Core API Reference
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Explore the foundational building blocks of LaserEyes and learn how to leverage its powerful features in your applications.
        </p>
        <div className="flex gap-4 items-center">
          <Link href="#core-components">
            <Button size="lg" className="group">
              Explore Components
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Badge variant="secondary" className="h-7 px-3">6 Core Components</Badge>
        </div>
      </div>

      <CoreApiContent />
    </div>
  )
}

