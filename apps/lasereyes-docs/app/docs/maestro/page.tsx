"use client"

import { Suspense } from "react"
import MaestroContent from "./maestro-content"
import { Heading } from "@/components/heading"

export default function MaestroPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Maestro Integration
      </Heading>
      <Suspense fallback={<div>Loading Maestro documentation...</div>}>
        <MaestroContent />
      </Suspense>
    </>
  )
}

