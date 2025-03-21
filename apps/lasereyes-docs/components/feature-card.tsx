import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5",
        className,
      )}
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>

      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

