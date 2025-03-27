"use client"

import { cn } from "@/lib/utils"
import React from "react"

interface DocProseProps {
  children: React.ReactNode
  className?: string
}

export function DocProse({ children, className }: DocProseProps) {
  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        "prose-headings:scroll-m-20 prose-headings:font-semibold",
        "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-p:leading-7",
        "prose-li:my-1",
        "prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5",
        "prose-table:mt-6",
        "prose-thead:border-b prose-thead:border-border",
        "prose-th:px-4 prose-th:py-2 prose-th:text-left",
        "prose-td:px-4 prose-td:py-2",
        className
      )}
    >
      {children}
    </div>
  )
} 