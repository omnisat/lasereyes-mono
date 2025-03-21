"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function LaserEyesClientPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        LaserEyesClient
      </Heading>
      <p className="text-lg mb-4">
        The <code>LaserEyesClient</code> is the central component of the LaserEyes core API. It orchestrates wallet
        connections, transactions, and data retrieval, providing a unified interface for interacting with Bitcoin
        wallets and blockchain data.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Initialization
      </Heading>
      <p className="mb-6">
        To use the <code>LaserEyesClient</code>, you need to create and initialize it with stores and configuration:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { 
  LaserEyesClient, 
  createStores, 
  createConfig, 
  MAINNET 
} from '@omnisat/lasereyes-core'

// Create stores for state management
const stores = createStores()

// Create configuration
const config = createConfig({ 
  network: MAINNET,
  // Optional: Configure data sources
  dataSources: {
    maestro: {
      apiKey: 'your-maestro-api-key', // Optional for development
    },
  },
})

// Create and initialize the client
const client = new LaserEyesClient(stores, config)
client.initialize()

// Now you can use the client
console.log('Client initialized')`}
        fileName="client-initialization.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Key Methods
      </Heading>
      <p className="mb-6">
        The <code>LaserEyesClient</code> provides methods for wallet connection, transactions, and data retrieval:
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Wallet Connection
      </Heading>
      <CodeBlock
        language="typescript"
        code={`// Connect to a wallet
await client.connect(UNISAT) // Connect to UniSat wallet

// Check if connected
const isConnected = client.isConnected()

// Get connected address
const address = client.getAddress()

// Disconnect
await client.disconnect()

// Switch to a different wallet provider
await client.switchProvider(XVERSE)`}
        fileName="wallet-connection.ts"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Transactions
      </Heading>
      <CodeBlock
        language="typescript"
        code={`// Send BTC
const txid = await client.sendBTC('bc1q...', 10000) // 10000 satoshis

// Sign a message
const signature = await client.signMessage('Hello, Bitcoin!')

// Sign a PSBT
const signedPsbtHex = await client.signPsbt(psbtHex)

// Broadcast a signed PSBT
const txid = await client.pushPsbt(signedPsbtHex)

// Create an inscription
const txid = await client.inscribe(contentBase64, 'text/plain')

// Send inscriptions
const txid = await client.sendInscriptions(['inscription1', 'inscription2'], 'bc1q...')`}
        fileName="transactions.ts"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Data Retrieval
      </Heading>
      <CodeBlock
        language="typescript"
        code={`// Get balance
const balance = await client.getBalance()

// Get UTXOs
const utxos = await client.getUtxos()

// Get inscriptions
const inscriptions = await client.getInscriptions()

// Get BRC-20 tokens
const tokens = await client.getMetaBalances('brc20')

// Get Runes
const runes = await client.getMetaBalances('runes')

// Estimate fee
const feeRate = await client.estimateFee(1) // For next block`}
        fileName="data-retrieval.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Advanced Usage
      </Heading>
      <p className="mb-6">For more advanced use cases, you can access the underlying components of the client:</p>
      <CodeBlock
        language="typescript"
        code={`// Get the DataSource Manager
const dataSourceManager = client.getDataSourceManager()

// Get the current wallet adapter
const walletAdapter = client.getWalletAdapter()

// Access stores directly
const storeState = client.getStores().$store.get()

// Listen for store changes
client.getStores().$store.subscribe((state) => {
  console.log('Store updated:', state)
})

// Dispose the client when done
client.dispose()`}
        fileName="advanced-usage.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Error Handling
      </Heading>
      <p className="mb-6">
        The <code>LaserEyesClient</code> methods can throw errors that you should handle:
      </p>
      <CodeBlock
        language="typescript"
        code={`try {
  await client.connect(UNISAT)
} catch (error) {
  if (error.code === 'WALLET_NOT_FOUND') {
    console.error('UniSat wallet extension not found')
  } else if (error.code === 'USER_REJECTED') {
    console.error('User rejected the connection request')
  } else {
    console.error('Connection failed:', error.message)
  }
}

try {
  const txid = await client.sendBTC('bc1q...', 10000)
  console.log('Transaction sent:', txid)
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Insufficient funds for this transaction')
  } else if (error.code === 'INVALID_ADDRESS') {
    console.error('Invalid Bitcoin address')
  } else {
    console.error('Transaction failed:', error.message)
  }
}`}
        fileName="error-handling.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Configuration Options
      </Heading>
      <p className="mb-6">
        The <code>LaserEyesClient</code> can be configured with various options:
      </p>
      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
  // Required: Bitcoin network
  network: MAINNET, // or TESTNET, SIGNET, etc.
  
  // Optional: Data source configuration
  dataSources: {
    maestro: {
      apiKey: 'your-maestro-api-key',
    },
    sandshrew: {
      apiKey: 'your-sandshrew-api-key',
    },
    mempool: {
      url: 'https://mempool.space/api',
    },
    esplora: 'https://blockstream.info/api',
  },
  
  // Optional: Wallet options
  walletOptions: {
    autoConnect: true, // Try to reconnect to last used wallet
    defaultProvider: UNISAT, // Default wallet provider
    timeout: 30000, // Timeout for wallet operations (ms)
  },
  
  // Optional: Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Optional: Cache options
  cacheOptions: {
    ttl: 60000, // Cache time-to-live (ms)
    maxSize: 100, // Maximum number of items to cache
  },
})`}
        fileName="configuration.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        TypeScript Support
      </Heading>
      <p className="mb-6">
        The <code>LaserEyesClient</code> provides comprehensive TypeScript types:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { 
  LaserEyesClient, 
  createStores, 
  createConfig, 
  MAINNET,
  type Config,
  type Stores,
  type UTXO,
  type Inscription,
  type Transaction,
} from '@omnisat/lasereyes-core'

// Type-safe configuration
const config: Config = createConfig({ 
  network: MAINNET 
})

// Type-safe stores
const stores: Stores = createStores()

// Type-safe client
const client: LaserEyesClient = new LaserEyesClient(stores, config)

// Type-safe method calls
async function example() {
  const balance: string = await client.getBalance()
  const utxos: UTXO[] = await client.getUtxos()
  const inscriptions: Inscription[] = await client.getInscriptions()
  
  // Type-safe error handling
  try {
    const txid: string = await client.sendBTC('bc1q...', 10000)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message)
    }
  }
}`}
        fileName="typescript-support.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Related Components
      </Heading>
      <p className="mb-6">
        The <code>LaserEyesClient</code> works with several other components in the LaserEyes core API:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/data-source-manager" className="text-primary hover:underline">
            DataSourceManager
          </Link>{" "}
          - Manages interactions with Bitcoin data providers
        </li>
        <li>
          <Link href="/docs/wallet-providers" className="text-primary hover:underline">
            Wallet Providers
          </Link>{" "}
          - Constants and adapters for different wallet providers
        </li>
        <li>
          <strong>Stores</strong> - State management for the client
        </li>
        <li>
          <strong>Config</strong> - Configuration options for the client
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand the <code>LaserEyesClient</code>, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/data-source-manager" className="text-primary hover:underline">
            DataSourceManager
          </Link>{" "}
          - Learn how to interact with Bitcoin data providers
        </li>
        <li>
          <Link href="/docs/wallet-providers" className="text-primary hover:underline">
            Wallet Providers
          </Link>{" "}
          - Explore the supported wallet providers
        </li>
        <li>
          <Link href="/docs/transaction-types" className="text-primary hover:underline">
            Transaction Types
          </Link>{" "}
          - Learn about the different types of transactions
        </li>
        <li>
          <Link href="/docs/custom-datasource" className="text-primary hover:underline">
            Custom DataSource Implementation
          </Link>{" "}
          - Create your own data source
        </li>
      </ul>
    </>
  )
}

