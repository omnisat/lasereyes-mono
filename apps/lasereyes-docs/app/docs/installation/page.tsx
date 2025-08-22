"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { PackageManagerSelector } from "@/components/package-manager-selector"
import { InstallationCommand } from "@/components/installation-command"
import Link from "next/link"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Box, Wrench, ArrowRight, Boxes, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GuideCardProps {
  href: string
  title: string
  description: string
  icon: React.ElementType
}

function GuideCard({ href, title, description, icon: Icon }: GuideCardProps) {
  return (
    <Link href={href}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
        <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold group-hover:text-orange-500">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
        </CardContent>
      </Card>
    </Link>
  )
}

export default function InstallationPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Installation Guide</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Installation
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Getting started with LaserEyes is simple. Follow these steps to install and set up LaserEyes in your project.
        </p>
      </div>

      <div className="space-y-10">
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Package Structure</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <h3 className="font-mono text-sm font-medium">@kevinoyl/lasereyes-core</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground">The core functionality, framework-agnostic implementation for Bitcoin wallet integration.</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <h3 className="font-mono text-sm font-medium">@kevinoyl/lasereyes-react</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground">React-specific components and hooks for seamless integration with React applications.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Installation</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-muted-foreground">Select your package manager:</span>
                <PackageManagerSelector />
              </div>
              <InstallationCommand packages={["@kevinoyl/lasereyes-core", "@kevinoyl/lasereyes-react"]} />
            </CardContent>
          </Card>
        </section>


        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Next Steps</h2>
          <div className="grid gap-4">
            <GuideCard
              href="/docs/basic-setup"
              title="Basic Setup"
              description="Learn how to set up LaserEyes in your application with step-by-step instructions."
              icon={Wrench}
            />
            <GuideCard
              href="/docs/hello-world"
              title="Hello World Example"
              description="Get started quickly with a simple example showcasing basic wallet integration."
              icon={Boxes}
            />
            <GuideCard
              href="/docs/wallet-connection"
              title="Wallet Connection"
              description="Explore how to connect and interact with different Bitcoin wallets in your application."
              icon={Workflow}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

