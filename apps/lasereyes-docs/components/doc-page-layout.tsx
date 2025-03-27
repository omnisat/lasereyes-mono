import type React from "react"
import { cn } from "@/lib/utils"

interface DocPageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DocPageLayout({ children, className }: DocPageLayoutProps) {
  return <div className={cn("w-full max-w-3xl mx-auto", className)}>{children}</div>
}

