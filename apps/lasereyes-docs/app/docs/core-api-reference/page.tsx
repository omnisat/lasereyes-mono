"use client"

import Link from "next/link"
import { Heading } from "@/components/heading"

export default function CoreApiReferencePage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Core API Reference
      </Heading>
      <p className="text-lg mb-4">
        The LaserEyes Core API provides the foundation for interacting with Bitcoin wallets and blockchain data. This
        section documents the key classes and interfaces that make up the core functionality of LaserEyes.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <div className="bg-card rounded-lg border p-6 hover:border-primary/50 transition-colors">
          <Heading level={2} className="text-xl font-bold mb-2">
            LaserEyesClient
          </Heading>
          <p className="text-muted-foreground mb-4">
            The central client that orchestrates wallet connections, transactions, and data retrieval.
          </p>
          <Link href="/docs/laser-eyes-client" className="text-primary hover:underline">
            View Documentation →
          </Link>
        </div>

        <div className="bg-card rounded-lg border p-6 hover:border-primary/50 transition-colors">
          <Heading level={2} className="text-xl font-bold mb-2">
            DataSourceManager
          </Heading>
          <p className="text-muted-foreground mb-4">
            Manages interactions with Bitcoin data providers like Maestro, Sandshrew, and Mempool.space.
          </p>
          <Link href="/docs/data-source-manager" className="text-primary hover:underline">
            View Documentation →
          </Link>
        </div>

        <div className="bg-card rounded-lg border p-6 hover:border-primary/50 transition-colors">
          <Heading level={2} className="text-xl font-bold mb-2">
            Wallet Providers
          </Heading>
          <p className="text-muted-foreground mb-4">
            Constants and adapters for interacting with different Bitcoin wallet providers.
          </p>
          <Link href="/docs/wallet-providers" className="text-primary hover:underline">
            View Documentation →
          </Link>
        </div>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-12 mb-4">
        Core Concepts
      </Heading>
      <p className="mb-6">
        Understanding these core components is essential for advanced usage of LaserEyes, especially if you're:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Building custom integrations outside of React</li>
        <li>Extending LaserEyes with custom functionality</li>
        <li>Implementing advanced transaction types</li>
        <li>Creating custom data sources</li>
        <li>Working with multiple wallet providers</li>
      </ul>

      <p className="mb-6">
        While the React components and hooks provide a convenient way to use LaserEyes, the core API gives you more
        control and flexibility for advanced use cases.
      </p>

      <div className="bg-muted p-6 rounded-lg mt-8">
        <Heading level={3} className="text-lg font-bold mt-6 mb-2">
          Getting Started with the Core API
        </Heading>
        <p className="mb-4">
          If you're new to LaserEyes, we recommend starting with the React components and hooks before diving into the
          core API. Once you're familiar with the basics, you can explore the core API for more advanced use cases.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/docs/laser-eyes-provider"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            LaserEyesProvider
          </Link>
          <Link
            href="/docs/use-laser-eyes"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            useLaserEyes Hook
          </Link>
        </div>
      </div>
    </>
  )
}

