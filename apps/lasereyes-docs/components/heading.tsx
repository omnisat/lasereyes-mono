"use client"

import { cn } from "@/lib/utils"
import React from "react"

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
  id?: string
}

export function Heading({ level = 1, children, className, id, ...props }: HeadingProps) {
  // Generate an ID from the text content if not provided
  const generatedId = React.useMemo(() => {
    if (id) return id

    // Convert children to string if possible
    let text = ""
    if (typeof children === "string") {
      text = children
    } else if (React.isValidElement(children) && typeof children.props.children === "string") {
      text = children.props.children
    }

    // Generate slug from text
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-")
  }, [children, id])

  const Component = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Component
      id={generatedId}
      className={cn(
        "scroll-m-20 break-words hyphens-auto",
        level === 1 && "text-3xl font-bold tracking-tight mt-8 mb-4",
        level === 2 && "text-2xl font-semibold tracking-tight mt-10 mb-3",
        level === 3 && "text-xl font-semibold tracking-tight mt-8 mb-2",
        level === 4 && "text-lg font-semibold tracking-tight mt-6 mb-2",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

