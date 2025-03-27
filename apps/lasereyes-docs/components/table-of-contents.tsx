"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Suspense } from "react"

function TableOfContentsContent() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const pathname = usePathname()

  useEffect(() => {
    const headingElements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .filter((element) => element.id)
      .map((element) => ({
        id: element.id,
        text: element.textContent || "",
        level: Number.parseInt(element.tagName.substring(1)),
      }))
    setHeadings(headingElements)
  }, [pathname])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0px 0px -80% 0px" },
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="p-4 overflow-auto max-h-[calc(100vh-4rem)]">
      <div className="text-sm font-medium mb-4">On This Page</div>
      <nav>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{
                paddingLeft: `${(heading.level - 1) * 0.75}rem`,
              }}
            >
              <a
                href={`#${heading.id}`}
                className={`block py-1 hover:text-primary transition-colors ${
                  activeId === heading.id ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function TableOfContents() {
  return (
    <Suspense fallback={<div className="p-4">Loading table of contents...</div>}>
      <TableOfContentsContent />
    </Suspense>
  )
}

