import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface DataSourceCardProps {
  name: string
  description: string
  logo?: string
  url: string
  className?: string
}

export function DataSourceCard({ name, description, url, className }: DataSourceCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5",
        className,
      )}
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />

      <h3 className="mb-3 text-2xl font-bold gradient-text">{name}</h3>

      <p className="mb-4 text-muted-foreground">{description}</p>

      <Button asChild variant="outline" size="sm" className="group/btn">
        <Link href={url} target="_blank" rel="noreferrer" className="inline-flex items-center">
          Visit Website
          <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  )
}

