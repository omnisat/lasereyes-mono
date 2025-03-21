"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar"

interface SidebarBackdropProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarBackdrop({ className, ...props }: SidebarBackdropProps) {
  const { open, setOpen } = useSidebar()

  if (!open) return null

  return (
    <div
      className={cn("fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden", className)}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
}

