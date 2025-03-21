"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function LaserEyesProviderPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        LaserEyesProvider
      </Heading>
      <p className="text-lg mb-4">
        The <code>LaserEyesProvider</code> is a React context provider that initializes the LaserEyes client and makes
        it available to all child components. This page explains how to set up and configure the provider in your React
        application.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Basic Usage
      </Heading>
      <p className="mb-6">
        To use LaserEyes in your React application, you need to wrap your components with the{" "}
        <code>LaserEyesProvider</code>:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET 
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="app.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Configuration Options
      </Heading>
      <p className="mb-6">
        The <code>LaserEyesProvider</code> accepts a configuration object that allows you to customize its behavior:
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Network Configuration
      </Heading>
      <p className="mb-4">You can specify which Bitcoin network to use:</p>
      <CodeBlock
        language="tsx"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET, TESTNET } from '@omnisat/lasereyes-core'

// Use Mainnet
function MainnetApp() {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      <YourApp />
    </LaserEyesProvider>
  )
}

// Use Testnet
function TestnetApp() {
  return (
    <LaserEyesProvider config={{ network: TESTNET }}>
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="network-config.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        DataSource Configuration
      </Heading>
      <p className="mb-4">You can configure the data sources used by LaserEyes:</p>
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
          // Maestro configuration
          maestro: {
            apiKey: 'your-maestro-api-key', // Optional for development
          },
          // Sandshrew configuration
          sandshrew: {
            url: 'https://api.sandshrew.io', // Optional, defaults to this
            apiKey: 'your-sandshrew-api-key', // Optional for development
          },
          // Mempool.space configuration
          mempool: {
            url: 'https://mempool.space/api', // Optional, defaults to this
          },
          // Esplora configuration (URL string)
          esplora: 'https://blockstream.info/api',
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="datasource-config.tsx"
        copyButton={true}
      />

      <WarningBox title="Development API Keys" className="mt-6 mb-6">
        LaserEyes includes development API keys for testing, but these are rate-limited. For production applications,
        you should register for your own API keys with data providers like Maestro and Sandshrew to avoid rate limiting
        issues.
      </WarningBox>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Wallet Options
      </Heading>
      <p className="mb-4">You can configure wallet-related options:</p>
      <CodeBlock
        language="tsx"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET, UNISAT } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET,
        walletOptions: {
          autoConnect: true, // Attempt to reconnect to the last used wallet on load
          defaultProvider: UNISAT, // Default wallet provider to use
          timeout: 30000, // Timeout for wallet operations in milliseconds
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="wallet-options.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Advanced Configuration
      </Heading>
      <p className="mb-6">For more advanced use cases, you can provide a complete configuration object:</p>
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
            apiKey: 'your-maestro-api-key',
          },
          sandshrew: {
            apiKey: 'your-sandshrew-api-key',
          },
        },
        walletOptions: {
          autoConnect: true,
          timeout: 30000,
        },
        debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
        cacheOptions: {
          ttl: 60000, // Cache time-to-live in milliseconds
          maxSize: 100, // Maximum number of items to cache
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="advanced-config.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Multiple Providers
      </Heading>
      <p className="mb-6">
        In some cases, you might need to use multiple LaserEyes providers in your application, for example, to support
        different networks in different parts of your app:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET, TESTNET } from '@omnisat/lasereyes-core'

function App() {
  return (
    <div>
      <h1>LaserEyes Multi-Network Demo</h1>
      
      <div>
        <h2>Mainnet Section</h2>
        <LaserEyesProvider config={{ network: MAINNET }}>
          <MainnetComponent />
        </LaserEyesProvider>
      </div>
      
      <div>
        <h2>Testnet Section</h2>
        <LaserEyesProvider config={{ network: TESTNET }}>
          <TestnetComponent />
        </LaserEyesProvider>
      </div>
    </div>
  )
}

// Components for different networks
function MainnetComponent() {
  // Uses the Mainnet provider
  return <div>Mainnet Component</div>
}

function TestnetComponent() {
  // Uses the Testnet provider
  return <div>Testnet Component</div>
}`}
        fileName="multiple-providers.tsx"
        copyButton={true}
      />
      <p className="mt-4 mb-6">
        Note that each provider creates its own isolated context, so components can only access the provider that wraps
        them.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Provider Lifecycle
      </Heading>
      <p className="mb-6">
        The <code>LaserEyesProvider</code> manages the lifecycle of the LaserEyes client:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Initialization</strong>: When the provider mounts, it creates and initializes the LaserEyes client
          with the provided configuration.
        </li>
        <li>
          <strong>Auto-connection</strong>: If <code>autoConnect</code> is enabled, it attempts to reconnect to the last
          used wallet.
        </li>
        <li>
          <strong>State management</strong>: It manages the state of the wallet connection, balances, and other data.
        </li>
        <li>
          <strong>Cleanup</strong>: When the provider unmounts, it cleans up resources and disconnects from the wallet.
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand how to set up the <code>LaserEyesProvider</code>, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/use-laser-eyes" className="text-primary hover:underline">
            useLaserEyes Hook
          </Link>{" "}
          - Learn how to interact with LaserEyes in your components
        </li>
        <li>
          <Link href="/docs/ui-components" className="text-primary hover:underline">
            UI Components
          </Link>{" "}
          - Explore the ready-to-use UI components provided by LaserEyes
        </li>
        <li>
          <Link href="/docs/wallet-providers" className="text-primary hover:underline">
            Wallet Providers
          </Link>{" "}
          - Learn about the supported wallet providers
        </li>
        <li>
          <Link href="/docs/datasource-system" className="text-primary hover:underline">
            DataSource System
          </Link>{" "}
          - Understand how LaserEyes interacts with Bitcoin data providers
        </li>
      </ul>
    </>
  )
}

