"use client"

import * as React from "react"
import { Heading } from "@/components/heading"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart,
  ShieldCheck,
  Users,
  Scale,
  AlertTriangle,
  Gavel,
  Globe,
  MessageCircleWarning,
  Handshake,
  Link as LinkIcon
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ConductCardProps {
  icon: LucideIcon
  title: string
  description?: string
  content: React.ReactNode
  className?: string
  variant?: "default" | "warning" | "success"
}

function ConductCard({ icon: Icon, title, description, content, className, variant = "default" }: ConductCardProps) {
  const variantStyles = {
    default: "hover:border-indigo-500/30 hover:shadow-indigo-500/5",
    warning: "hover:border-yellow-500/30 hover:shadow-yellow-500/5 border-yellow-500/20",
    success: "hover:border-green-500/30 hover:shadow-green-500/5 border-green-500/20"
  }

  const iconStyles = {
    default: "bg-indigo-500/10 text-indigo-500",
    warning: "bg-yellow-500/10 text-yellow-500",
    success: "bg-green-500/10 text-green-500"
  }

  const blurStyles = {
    default: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    warning: "bg-yellow-500/10 group-hover:bg-yellow-500/20",
    success: "bg-green-500/10 group-hover:bg-green-500/20"
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      variantStyles[variant],
      className
    )}>
      <div className={cn(
        "absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full blur-2xl filter",
        blurStyles[variant]
      )} />
      <CardContent className="p-6">
        <div className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-lg",
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        {description && <p className="mb-4 text-muted-foreground">{description}</p>}
        {content}
      </CardContent>
    </Card>
  )
}

function CodeOfConductContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Our Standards</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <ConductCard
            icon={Heart}
            title="Positive Behavior"
            variant="success"
            content={
              <ul className="space-y-2 text-muted-foreground">
                <li>• Using welcoming and inclusive language</li>
                <li>• Being respectful of differing viewpoints</li>
                <li>• Gracefully accepting constructive criticism</li>
                <li>• Focusing on what's best for the community</li>
                <li>• Showing empathy towards others</li>
                <li>• Helping and mentoring new contributors</li>
              </ul>
            }
          />
          <ConductCard
            icon={AlertTriangle}
            title="Unacceptable Behavior"
            variant="warning"
            content={
              <ul className="space-y-2 text-muted-foreground">
                <li>• Harassment of any kind</li>
                <li>• Discriminatory jokes and language</li>
                <li>• Personal or political attacks</li>
                <li>• Publishing others' private information</li>
                <li>• Inappropriate conduct in professional settings</li>
                <li>• Any form of unwelcome advances</li>
              </ul>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Our Commitments</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <ConductCard
            icon={ShieldCheck}
            title="Project Maintainers"
            content={
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Project maintainers are responsible for clarifying and enforcing acceptable behavior standards. They have the right and responsibility to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Remove, edit, or reject inappropriate content</li>
                  <li>• Temporarily or permanently ban contributors</li>
                  <li>• Address behavior that violates guidelines</li>
                </ul>
              </div>
            }
          />
          <ConductCard
            icon={Users}
            title="Community Members"
            content={
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Community members are expected to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Follow the code of conduct</li>
                  <li>• Report violations when witnessed</li>
                  <li>• Help create a welcoming environment</li>
                  <li>• Lead by example in professionalism</li>
                </ul>
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Enforcement</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <ConductCard
            icon={Scale}
            title="Enforcement Guidelines"
            content={
              <div className="space-y-4">
                <div className="rounded-md border-l-4 border-indigo-500 bg-indigo-500/5 p-4">
                  <h4 className="mb-2 font-semibold">1. Correction</h4>
                  <p className="text-sm text-muted-foreground">Warning and education for minor violations</p>
                </div>
                <div className="rounded-md border-l-4 border-yellow-500 bg-yellow-500/5 p-4">
                  <h4 className="mb-2 font-semibold">2. Warning</h4>
                  <p className="text-sm text-muted-foreground">Consequences for repeated minor violations</p>
                </div>
                <div className="rounded-md border-l-4 border-orange-500 bg-orange-500/5 p-4">
                  <h4 className="mb-2 font-semibold">3. Temporary Ban</h4>
                  <p className="text-sm text-muted-foreground">Temporary ban for serious violations</p>
                </div>
                <div className="rounded-md border-l-4 border-red-500 bg-red-500/5 p-4">
                  <h4 className="mb-2 font-semibold">4. Permanent Ban</h4>
                  <p className="text-sm text-muted-foreground">Permanent ban for sustained misconduct</p>
                </div>
              </div>
            }
          />
          <ConductCard
            icon={Gavel}
            title="Reporting Guidelines"
            content={
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Report violations to our team at:
                </p>
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-2">
                    <MessageCircleWarning className="h-5 w-5 text-indigo-500" />
                    <a href="mailto:conduct@omnisat.io" className="text-primary hover:underline">
                      conduct@omnisat.io
                    </a>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  All reports will be reviewed promptly and kept confidential.
                </p>
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Scope & Attribution</h2>
                <p className="text-muted-foreground">Where and how this code applies</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake className="h-5 w-5 text-indigo-500" />
                  <span className="font-semibold">Scope of Application</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This Code of Conduct applies in all project spaces, including public and private spaces when representing the project.
                </p>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-5 w-5 text-indigo-500" />
                  <span className="font-semibold">Attribution</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This Code of Conduct is adapted from the{" "}
                  <Link href="https://www.contributor-covenant.org" className="text-primary hover:underline">
                    Contributor Covenant
                  </Link>
                  , version 2.0.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function CodeOfConductClientPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Community</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent">
          Code of Conduct
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Our commitment to fostering an open, welcoming, and safe environment for all contributors and community members.
        </p>
      </div>

      <ClientPageWrapper>
        <CodeOfConductContent />
      </ClientPageWrapper>
    </div>
  )
} 