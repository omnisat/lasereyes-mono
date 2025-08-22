"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { themeConfig } from "@/lib/theme-config"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { LaserEyesLogo } from "@kevinoyl/lasereyes-react"


export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't render the header on docs pages as we have a custom header there
  if (pathname.startsWith("/docs")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[90rem] mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <LaserEyesLogo width={32} color={"orange"} className="mr-1" />
            <span className="font-bold text-xl inline-block">
              <span className="text-primary">Laser</span>Eyes
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {themeConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-foreground" : "text-muted-foreground",
                  item.highlight && "gradient-text font-bold",
                )}
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
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="container md:hidden py-4 border-t">
          <nav className="flex flex-col gap-4">
            {themeConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-foreground" : "text-muted-foreground",
                  item.highlight && "gradient-text font-bold",
                )}
                onClick={() => setMobileMenuOpen(false)}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {item.title}
              </Link>
            ))}
            <Link
              href={themeConfig.github}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              GitHub
            </Link>
            <Link
              href="/docs/installation"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

