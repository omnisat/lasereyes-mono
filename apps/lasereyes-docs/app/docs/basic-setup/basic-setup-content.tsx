"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export function BasicSetupContent() {
  return (
    <>
      <Heading level={1}>Basic Setup</Heading>
      <p className="text-lg mb-4">This guide will walk you through the basic setup of LaserEyes in your application.</p>

      <Heading level={2}>React Setup</Heading>
      <p className="mb-6">
        If you're using React, LaserEyes provides a convenient provider component and hooks to make integration
        seamless.
      </p>

      <Heading level={3}>Setting up the Provider</Heading>
      <p className="mb-4">
        First, wrap your application with the <code>LaserEyesProvider</code> component:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { MAINNET } from '@kevinoyl/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET,
        // Optional: Configure data sources
        dataSources: {
          // Use Maestro for Bitcoin data
          maestro: {
            apiKey: 'your-api-key', // Optional for development
          },
          // Use Sandshrew as an alternative
          sandshrew: {
            apiKey: 'your-api-key', // Optional for development
          }
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="app.tsx"
        copyButton={true}
      />

      <WarningBox title="Development API Keys" className="mt-4 mb-6">
        LaserEyes includes development API keys for Maestro and Sandshrew, but these are rate-limited. For production
        applications, you should register for your own API keys.
      </WarningBox>

      <Heading level={3}>Using the Hook</Heading>
      <p className="mb-4">
        Once the provider is set up, you can use the <code>useLaserEyes</code> hook in any component:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { UNISAT } from '@kevinoyl/lasereyes-core'

function WalletConnect() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address 
  } = useLaserEyes()

  const connectWallet = async () => {
    try {
      await connect(UNISAT)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  )
}`}
        fileName="wallet-connect.tsx"
        copyButton={true}
      />

      <Heading level={2}>Core Setup (Framework-Agnostic)</Heading>
      <p className="mb-6">If you're not using React or want more control, you can use the core client directly:</p>
      <CodeBlock
        language="typescript"
        code={`import { 
  LaserEyesClient, 
  createStores, 
  createConfig,
  MAINNET,
  UNISAT
} from '@kevinoyl/lasereyes-core'

// Create stores and config
const stores = createStores()
const config = createConfig({ network: MAINNET })

// Initialize the client
const client = new LaserEyesClient(stores, config)
client.initialize()

// Connect to a wallet
async function connectWallet() {
  try {
    await client.connect(UNISAT)
    console.log('Connected:', stores.$store.get().address)
  } catch (error) {
    console.error('Connection failed:', error)
  }
}

// Disconnect
function disconnectWallet() {
  client.disconnect()
}

// Clean up when done
function cleanup() {
  client.dispose()
}`}
        fileName="core-setup.ts"
        copyButton={true}
      />

      <Heading level={2}>Network Configuration</Heading>
      <p className="mb-6">
        LaserEyes supports multiple Bitcoin networks. You can specify the network in the configuration:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { 
  MAINNET,  // Bitcoin Mainnet
  TESTNET,  // Bitcoin Testnet
  SIGNET,   // Bitcoin Signet
  TESTNET4  // Bitcoin Testnet4
} from '@kevinoyl/lasereyes-core'

// Use mainnet
const mainnetConfig = createConfig({ network: MAINNET })

// Use testnet
const testnetConfig = createConfig({ network: TESTNET })`}
        fileName="network-config.ts"
        copyButton={true}
      />

      <Heading level={2}>DataSource Configuration</Heading>
      <p className="mb-6">
        LaserEyes uses a DataSource system to interact with Bitcoin data providers. You can configure multiple data
        sources:
      </p>
      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
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
})`}
        fileName="datasource-config.ts"
        copyButton={true}
      />

      <Heading level={2}>Next Steps</Heading>
      <p className="mb-6">Now that you have set up LaserEyes, you can start building your Bitcoin web application:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/hello-world" className="text-primary hover:underline">
            Hello World Example
          </Link>{" "}
          - A simple example to get you started
        </li>
        <li>
          <Link href="/docs/wallet-connection" className="text-primary hover:underline">
            Wallet Connection
          </Link>{" "}
          - Learn how to connect to different wallets
        </li>
        <li>
          <Link href="/docs/basic-transactions" className="text-primary hover:underline">
            Basic Transactions
          </Link>{" "}
          - Send BTC and other assets
        </li>
      </ul>
    </>
  )
}

