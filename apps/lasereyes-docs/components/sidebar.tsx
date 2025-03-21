"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { themeConfig } from "@/lib/theme-config"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown } from "lucide-react"
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar-menu"

export function Sidebar() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Initialize all sections as open by default
    return themeConfig.sidebarNav.reduce(
      (acc, section) => {
        // Check if any item in this section is active
        const isActive = section.items.some((item) => item.href === pathname)
        acc[section.title] = isActive || section.title === "Getting Started" // Always open "Getting Started"
        return acc
      },
      {} as Record<string, boolean>,
    )
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <div className="relative overflow-hidden h-full py-8 pl-6 pr-4">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          {themeConfig.sidebarNav.map((section) => (
            <div key={section.title} className="pb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "flex w-full items-center justify-between mb-3 text-sm font-medium transition-colors",
                  section.highlight
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 font-bold text-base"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{section.title}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    openSections[section.title] ? "transform rotate-180" : "",
                    section.highlight ? "text-orange-400" : "text-muted-foreground",
                  )}
                />
              </button>

              {openSections[section.title] && section.items.length > 0 && (
                <div
                  className={cn(
                    "grid grid-flow-row auto-rows-max gap-1.5 pl-1 transition-all duration-200",
                    section.highlight ? "border-l-2 border-orange-400/50 pl-4" : "border-l border-border/50 pl-4",
                  )}
                >
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    // Check if this is a subpage by looking for a parent path in the href
                    const isSubpage = item.href.split("/").length > 3

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            section.highlight && isActive && "text-orange-500",
                            isSubpage && "pl-4 text-sm", // Add indentation and smaller text for subpages
                          )}
                        >
                          <Link href={item.href}>
                            {isSubpage && <span className="mr-2 text-muted-foreground">•</span>}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
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

