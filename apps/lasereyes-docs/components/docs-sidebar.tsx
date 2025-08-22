"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { themeConfig } from "@/lib/theme-config"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight } from "lucide-react"
import { LaserEyesLogo } from "@kevinoyl/lasereyes-react"
import type { colorsType } from "@kevinoyl/lasereyes-react"

function DocsSidebarContent({
  className,
  mobileMenu = false,
  handleLinkClick,
}: {
  className?: string
  mobileMenu?: boolean
  handleLinkClick?: () => void
}) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  // Initialize open sections based on current path and localStorage (if available)
  useEffect(() => {
    // Initialize with sections that contain the current path
    const initialOpenSections = themeConfig.sidebarNav.reduce(
      (acc, section) => {
        // Check if any item in this section is active
        const isActive = section.items.some((item) => item.href === pathname)
        acc[section.title] = isActive || section.title === "Getting Started" // Always open "Getting Started"
        return acc
      },
      {} as Record<string, boolean>,
    )

    // Try to load saved state from localStorage
    try {
      const savedState = localStorage.getItem("lasereyes-sidebar-state")
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        // Merge saved state with active sections
        setOpenSections({ ...parsedState, ...initialOpenSections })
        return
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }

    // If no saved state, use the initial state
    setOpenSections(initialOpenSections)
  }, [pathname])

  // Save open sections state to localStorage
  useEffect(() => {
    if (Object.keys(openSections).length > 0) {
      try {
        localStorage.setItem("lasereyes-sidebar-state", JSON.stringify(openSections))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    }
  }, [openSections])

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const onLinkClick = () => {
    if (handleLinkClick) {
      handleLinkClick()
    }
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Only show this header in mobile menu */}
      {mobileMenu && (
        <div className="h-16 flex items-center px-4 md:px-6 border-b border-border/50 dark:border-border/30">
          <Link href="/docs" className="flex items-center space-x-2" onClick={onLinkClick}>
            <LaserEyesLogo width={24} color={"orange" as colorsType} className="mr-1" />
            <span className="font-bold text-lg">
              <span className="text-primary">Laser</span>Eyes Docs
            </span>
          </Link>
        </div>
      )}
      <ScrollArea className="flex-1 px-2 md:px-4 py-6">
        <div className="space-y-1 pr-2">
          {themeConfig.sidebarNav.map((section) => (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "flex w-full items-center justify-between py-3 md:py-2 text-sm font-medium transition-colors rounded-md px-3",
                  section.highlight
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-bold"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50",
                )}
              >
                <span>{section.title}</span>
                {openSections[section.title] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {openSections[section.title] && section.items.length > 0 && (
                <div
                  className={cn(
                    "mt-1 ml-2 space-y-1",
                    section.highlight ? "pl-2 border-l-2 border-orange-400/50" : "pl-2 border-l border-border/50",
                  )}
                >
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    // Check if this is a subpage by looking for a parent path in the href
                    const isSubpage = item.href.split("/").length > 4

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                          "flex items-center py-2 md:py-1.5 px-3 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          isSubpage && "ml-3 text-xs",
                          section.highlight && isActive && "text-orange-500 bg-orange-500/10",
                        )}
                      >
                        {isSubpage && <div className="mr-2 h-1 w-1 rounded-full bg-muted-foreground/70"></div>}
                        <span className={isSubpage ? "text-[13px]" : ""}>{item.title}</span>
                        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></div>}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export function DocsSidebar(props: {
  className?: string
  mobileMenu?: boolean
  handleLinkClick?: () => void
}) {
  return (
    <Suspense fallback={<div className="p-4">Loading sidebar...</div>}>
      <DocsSidebarContent {...props} />
    </Suspense>
  )
}

