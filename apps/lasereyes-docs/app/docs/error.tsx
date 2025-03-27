"use client"

import { useEffect } from "react"

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Documentation Error</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We're sorry, but there was an error loading this documentation page.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Try again
      </button>
    </div>
  )
}

