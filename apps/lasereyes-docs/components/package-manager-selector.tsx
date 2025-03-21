"use client"

import { usePackageManager } from "./package-manager-provider"
import { cn } from "@/lib/utils"

export function PackageManagerSelector({ className }: { className?: string }) {
  const { packageManager, setPackageManager } = usePackageManager()

  return (
    <div className={cn("flex rounded-md overflow-hidden border border-border", className)}>
      <button
        className={cn(
          "px-3 py-1 text-sm transition-colors",
          packageManager === "npm" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
        )}
        onClick={() => setPackageManager("npm")}
      >
        npm
      </button>
      <button
        className={cn(
          "px-3 py-1 text-sm transition-colors border-l border-border",
          packageManager === "yarn" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
        )}
        onClick={() => setPackageManager("yarn")}
      >
        yarn
      </button>
      <button
        className={cn(
          "px-3 py-1 text-sm transition-colors border-l border-border",
          packageManager === "pnpm" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
        )}
        onClick={() => setPackageManager("pnpm")}
      >
        pnpm
      </button>
    </div>
  )
}

