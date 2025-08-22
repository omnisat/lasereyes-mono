import type React from "react"
import { DocsSidebar } from "@/components/docs-sidebar"
import { DocNavigation } from "@/components/doc-navigation"
import { MobileNav } from "@/components/mobile-nav"
import type { Metadata } from "next"
import { TableOfContents } from "@/components/table-of-contents"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { themeConfig } from "@/lib/theme-config"
import { LaserEyesLogo } from "@kevinoyl/lasereyes-react"
import type { colorsType } from "@kevinoyl/lasereyes-react"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use LaserEyes in your projects",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main header with all links and buttons */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="max-w-[90rem] mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href="/" className="flex items-center space-x-2">
              <LaserEyesLogo width={32} color={"orange" as colorsType} className="mr-1" />
              <span className="font-bold text-xl inline-block">
                <span className="text-primary">Laser</span>Eyes
              </span>
            </Link>
            <nav className="hidden md:flex gap-6 ml-6">
              {themeConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden md:flex" asChild>
              <Link href={themeConfig.github} target="_blank" rel="noreferrer">
                GitHub
              </Link>
            </Button>
            <Button variant="default" size="sm" className="hidden md:flex" asChild>
              <Link href="/docs/installation">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-[90rem] mx-auto">
          <div className="flex relative mx-4 xl:mx-0">
            {/* Static sidebar for desktop */}
            <div className="hidden md:block w-64 flex-none">
              <div className="fixed h-[calc(100vh-4rem)] w-64 top-16 overflow-y-auto border-r border-border/50 dark:border-border/30 bg-sidebar ">
                <DocsSidebar />
              </div>
            </div>

            {/* Main content area */}
            <main className="flex-auto min-w-0 px-4 md:px-8 pt-4 md:pt-10 pb-8 md:pb-12">
              <div className="max-w-4xl mx-auto">
                <Suspense fallback={<div className="py-4">Loading content...</div>}>{children}</Suspense>
                <DocNavigation />
              </div>
            </main>

            {/* Table of contents - only show on large screens */}
            <div className="hidden xl:block w-64 flex-none">
              <div className="fixed h-[calc(100vh-4rem)] w-64 top-16 overflow-y-auto border-l border-border/50 dark:border-border/30 bg-background ">
                <TableOfContents />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

