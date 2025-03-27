"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { themeConfig } from "@/lib/theme-config"
import { Suspense } from "react"

function DocNavigationContent() {
  const pathname = usePathname()

  // Find current page index
  let currentPageIndex = -1
  let currentSectionIndex = -1

  // Flatten all navigation items
  const allPages = themeConfig.sidebarNav.flatMap((section, sectionIndex) => {
    return section.items.map((item) => {
      if (item.href === pathname) {
        currentSectionIndex = sectionIndex
      }
      return {
        ...item,
        sectionIndex,
      }
    })
  })

  // Find the current page in the flattened array
  currentPageIndex = allPages.findIndex((item) => item.href === pathname)

  // Get previous and next pages
  const prevPage = currentPageIndex > 0 ? allPages[currentPageIndex - 1] : null
  const nextPage = currentPageIndex < allPages.length - 1 ? allPages[currentPageIndex + 1] : null

  if (!prevPage && !nextPage) return null

  return (
    <div className="flex items-center justify-between mt-16 pt-8 border-t">
      {prevPage ? (
        <Link
          href={prevPage.href}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <div>
            <div className="text-xs text-muted-foreground mb-1">Previous</div>
            <div>{prevPage.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextPage ? (
        <Link
          href={nextPage.href}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Next</div>
            <div>{nextPage.title}</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}

export function DocNavigation() {
  return (
    <Suspense fallback={<div className="mt-16 pt-8 border-t">Loading navigation...</div>}>
      <DocNavigationContent />
    </Suspense>
  )
}

