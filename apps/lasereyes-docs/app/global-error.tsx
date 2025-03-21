"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-8 max-w-md">We apologize for the inconvenience. Please try again later.</p>
          <div className="flex gap-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}

