'use client'

import { type ReactNode, Suspense } from 'react'

interface ClientPageWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientPageWrapper({
  children,
  fallback = <div>Loading...</div>,
}: ClientPageWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}
