"use client"

import { Heading } from "./heading"

interface DocPageHeaderProps {
  id: string
  title: string
  description?: string
}

export function DocPageHeader({ id, title, description }: DocPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={1} id={id}>
        {title}
      </Heading>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
    </div>
  )
} 