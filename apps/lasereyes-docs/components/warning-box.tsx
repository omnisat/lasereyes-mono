import type React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface WarningBoxProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function WarningBox({ title, children, className }: WarningBoxProps) {
  return (
    <div className={cn("bg-amber-500/10 border border-amber-500/30 rounded-md p-4", className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          {title && <h4 className="font-medium text-amber-500 mb-1">{title}</h4>}
          <div className="text-sm text-amber-500/90">{children}</div>
        </div>
      </div>
    </div>
  )
}

