"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function ArchitecturePage() {
  return (
    <>
      <Heading level={1}>Architecture Overview</Heading>
      <p className="text-lg mb-4">
        LaserEyes is designed with a modular, extensible architecture that separates concerns and provides a consistent
        interface for Bitcoin wallet interactions. This page explains the core architectural components and how they
        work together.
      </p>

      <Heading level={2}>High-Level Architecture</Heading>
      <p className="mb-6">
        LaserEyes follows a layered architecture pattern with clear separation of concerns. The library is divided into
        several key components that work together to provide a seamless wallet connection experience.
      </p>

      <div className="bg-muted p-6 rounded-lg mb-8 overflow-auto">
        <pre className="text-xs md:text-sm whitespace-pre">
          {`┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│                                                                  │
│  ┌──────────────────┐       ┌──────────────────────────────┐    │
│  │  React Components│       │  React Hooks                 │    │
│  │  <LaserEyesProvider>     │  useLaserEyes()             │    │
│  └──────────────────┘       └──────────────────────────────┘    │
│                                                                  │
└──────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Core Layer                              │
│                                                                  │
│  ┌──────────────────┐       ┌──────────────────────────────┐    │
│  │  LaserEyesClient │       │  Stores                      │    │
│  │                  │◄─────►│  (State Management)          │    │
│  └────────┬─────────┘       └──────────────────────────────┘    │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐       ┌──────────────────────────────┐    │
│  │  Wallet Adapters │       │  DataSource Manager          │    │
│  │  (UniSat, Xverse,│◄─────►│  (Maestro, Sandshrew, etc.)  │    │
│  │   OYL, etc.)     │       │                              │    │
│  └──────────────────┘       └──────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│                                                                  │
│  ┌──────────────────┐       ┌──────────────────────────────┐    │
│  │  Wallet Providers│       │  Bitcoin Data Providers      │    │
│  │  (Browser        │       │  (Maestro, Sandshrew,        │    │
│  │   Extensions)    │       │   Mempool.space, etc.)       │    │
│  └──────────────────┘       └──────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘`}
        </pre>
      </div>

      <Heading level={2}>Core Components</Heading>

      <Heading level={3}>LaserEyesClient</Heading>
      <p className="mb-4">
        The central component that orchestrates all interactions between the application and Bitcoin wallets. It manages
        wallet connections, transactions, and data retrieval.
      </p>
      <CodeBlock
        language="typescript"
        code={`import { LaserEyesClient, createStores, createConfig, MAINNET } from '@omnisat/lasereyes-core'

// Create stores and config
const stores = createStores()
const config = createConfig({ network: MAINNET })

// Initialize the client
const client = new LaserEyesClient(stores, config)
client.initialize()`}
        fileName="client-initialization.ts"
        copyButton={true}
      />

      <Heading level={3}>Stores</Heading>
      <p className="mb-4">
        LaserEyes uses a lightweight, reactive store system for state management. The stores maintain the current state
        of the wallet connection, balances, and other relevant data.
      </p>
      <CodeBlock
        language="typescript"
        code={`// Core stores structure
interface Stores {
  $store: Store<{
    connected: boolean
    address: string
    publicKey: string
    balance: string
    network: NetworkType
    provider: string
    loading: boolean
    error: string | null
  }>

  $inscriptions: Store<{
    inscriptions: Inscription[]
    loading: boolean
    error: string | null
  }>

  $metaBalances: Store<{
    brc20: BRC20Token[]
    runes: Rune[]
    loading: boolean
    error: string | null
  }>
}`}
        fileName="stores.ts"
        copyButton={true}
      />

      <Heading level={3}>Wallet Adapters</Heading>
      <p className="mb-4">
        Wallet adapters provide a consistent interface to interact with different Bitcoin wallet providers. Each adapter
        implements the same interface but handles the specific requirements of its respective wallet.
      </p>
      <CodeBlock
        language="typescript"
        code={`// Wallet adapter interface
interface WalletAdapter {
  connect(): Promise<{ address: string; publicKey: string }>
  disconnect(): Promise<void>
  getAddress(): Promise<string>
  getPublicKey(): Promise<string>
  getBalance(): Promise<string>
  signMessage(message: string, address?: string): Promise<string>
  signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string>
  pushPsbt(psbtHex: string): Promise<string>
  // Additional methods for specific wallet capabilities
}`}
        fileName="wallet-adapter.ts"
        copyButton={true}
      />

      <Heading level={3}>DataSource Manager</Heading>
      <p className="mb-4">
        The DataSource Manager abstracts away the details of interacting with different Bitcoin data providers. It
        provides a unified interface for fetching blockchain data, regardless of the underlying provider.
      </p>
      <CodeBlock
        language="typescript"
        code={`// DataSource Manager interface
interface DataSourceManager {
  getBalance(address: string): Promise<string>
  getUtxos(address: string): Promise<UTXO[]>
  getTransaction(txid: string): Promise<Transaction>
  getInscriptions(address: string): Promise<Inscription[]>
  getMetaBalances(address: string, type: 'brc20' | 'runes'): Promise<any[]>
  broadcastTransaction(txHex: string): Promise<string>
  // Additional methods for specific data needs
}`}
        fileName="data-source-manager.ts"
        copyButton={true}
      />

      <Heading level={2}>React Integration</Heading>
      <p className="mb-6">
        LaserEyes provides React-specific components and hooks for seamless integration with React applications.
      </p>

      <Heading level={3}>LaserEyesProvider</Heading>
      <p className="mb-4">
        A React context provider that initializes the LaserEyesClient and makes it available to all child components.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET,
        dataSources: {
          maestro: {
            apiKey: 'your-api-key' // Optional for development
          }
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="provider.tsx"
        copyButton={true}
      />

      <Heading level={3}>useLaserEyes Hook</Heading>
      <p className="mb-4">
        A React hook that provides access to all LaserEyes functionality within functional components.
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { UNISAT } from '@omnisat/lasereyes-core'

function WalletConnect() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address,
    balance,
    sendBTC,
    getInscriptions,
    // ... other methods and properties
  } = useLaserEyes()

  const handleConnect = async () => {
    try {
      await connect(UNISAT)
      console.log('Connected to wallet:', address)
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  return (
    <div>
      {connected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  )
}`}
        fileName="use-hook.tsx"
        copyButton={true}
      />

      <Heading level={2}>Data Flow</Heading>
      <p className="mb-6">The data flow in LaserEyes follows a unidirectional pattern:</p>
      <ol className="list-decimal pl-6 mb-6 space-y-2">
        <li>
          <strong>User Interaction</strong>: The user interacts with the UI (e.g., clicks "Connect Wallet").
        </li>
        <li>
          <strong>React Components</strong>: React components call methods from the useLaserEyes hook.
        </li>
        <li>
          <strong>LaserEyesClient</strong>: The hook delegates to the LaserEyesClient, which orchestrates the operation.
        </li>
        <li>
          <strong>Wallet Adapters</strong>: For wallet operations, the client uses the appropriate wallet adapter.
        </li>
        <li>
          <strong>DataSource Manager</strong>: For blockchain data, the client uses the DataSource Manager.
        </li>
        <li>
          <strong>State Update</strong>: The operation results update the stores.
        </li>
        <li>
          <strong>UI Update</strong>: React components re-render with the updated state from the stores.
        </li>
      </ol>

      <Heading level={2}>Design Principles</Heading>
      <p className="mb-6">LaserEyes is built on several key design principles:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Separation of Concerns</strong>: Each component has a specific responsibility, making the code more
          maintainable and testable.
        </li>
        <li>
          <strong>Abstraction</strong>: The library abstracts away the complexities of different wallet providers and
          data sources, providing a consistent interface.
        </li>
        <li>
          <strong>Extensibility</strong>: The modular design makes it easy to add support for new wallets or data
          providers.
        </li>
        <li>
          <strong>Framework Agnostic Core</strong>: The core functionality is framework-agnostic, with
          framework-specific integrations built on top.
        </li>
        <li>
          <strong>Type Safety</strong>: Comprehensive TypeScript types ensure type safety throughout the library.
        </li>
      </ul>

      <Heading level={2}>Configuration</Heading>
      <p className="mb-6">
        LaserEyes is highly configurable, allowing you to customize its behavior to suit your needs:
      </p>
      <CodeBlock
        language="typescript"
        code={`// Configuration options
interface Config {
  network: NetworkType // MAINNET, TESTNET, etc.
  dataSources?: {
    maestro?: {
      apiKey?: string
    }
    sandshrew?: {
      url?: string
      apiKey?: string
    }
    mempool?: {
      url?: string
    }
    esplora?: string
  }
  walletOptions?: {
    autoConnect?: boolean
    defaultProvider?: string
    timeout?: number
  }
}`}
        fileName="config.ts"
        copyButton={true}
      />

      <WarningBox title="Development vs. Production" className="mt-6 mb-6">
        While LaserEyes includes development API keys for testing, you should register for your own API keys with data
        providers like Maestro and Sandshrew for production applications to avoid rate limiting issues.
      </WarningBox>

      <Heading level={2}>Next Steps</Heading>
      <p className="mb-6">
        Now that you understand the architecture of LaserEyes, you can explore more specific topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/network-support" className="text-primary hover:underline">
            Network Support
          </Link>{" "}
          - Learn about the different Bitcoin networks supported by LaserEyes
        </li>
        <li>
          <Link href="/docs/datasource-system" className="text-primary hover:underline">
            DataSource System
          </Link>{" "}
          - Dive deeper into how LaserEyes interacts with Bitcoin data providers
        </li>
        <li>
          <Link href="/docs/wallet-providers" className="text-primary hover:underline">
            Wallet Providers
          </Link>{" "}
          - Explore the supported wallet providers and their capabilities
        </li>
        <li>
          <Link href="/docs/transaction-types" className="text-primary hover:underline">
            Transaction Types
          </Link>{" "}
          - Learn about the different types of transactions supported by LaserEyes
        </li>
      </ul>
    </>
  )
}

