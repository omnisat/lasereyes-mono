"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function DataSourceManagerPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        DataSourceManager
      </Heading>
      <p className="text-lg mb-4">
        The <code>DataSourceManager</code> is a core component of LaserEyes that abstracts away the complexities of
        interacting with different Bitcoin data providers. It provides a unified interface for fetching blockchain data,
        regardless of the underlying provider.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Overview
      </Heading>
      <p className="mb-6">The DataSourceManager handles:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Provider selection based on availability and capability</li>
        <li>Fallback mechanisms when a provider fails</li>
        <li>Caching to improve performance</li>
        <li>Error handling and retry logic</li>
        <li>Data normalization across different providers</li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Accessing the DataSourceManager
      </Heading>
      <p className="mb-6">You can access the DataSourceManager through the LaserEyesClient:</p>
      <CodeBlock
        language="typescript"
        code={`import { 
  LaserEyesClient, 
  createStores, 
  createConfig, 
  MAINNET 
} from '@kevinoyl/lasereyes-core'

// Create and initialize the client
const stores = createStores()
const config = createConfig({ network: MAINNET })
const client = new LaserEyesClient(stores, config)
client.initialize()

// Get the DataSourceManager
const dataSourceManager = client.getDataSourceManager()

// Now you can use the DataSourceManager
const balance = await dataSourceManager.getBalance('bc1q...')`}
        fileName="accessing-datasource-manager.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Key Methods
      </Heading>
      <p className="mb-6">The DataSourceManager provides methods for interacting with the Bitcoin blockchain:</p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Basic Bitcoin Operations
      </Heading>
      <CodeBlock
        language="typescript"
        code={`// Get balance for an address
const balance = await dataSourceManager.getBalance('bc1q...')

// Get UTXOs for an address
const utxos = await dataSourceManager.getUtxos('bc1q...')

// Get transaction details
const tx = await dataSourceManager.getTransaction('txid...')

// Broadcast a transaction
const txid = await dataSourceManager.broadcastTransaction(txHex)

// Estimate fee rate
const feeRate = await dataSourceManager.estimateFee(1) // For next block

// Get current block height
const blockHeight = await dataSourceManager.getBlockHeight()

// Get address transaction history
const history = await dataSourceManager.getAddressHistory('bc1q...')`}
        fileName="basic-operations.ts"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Ordinals and Inscriptions
      </Heading>
      <CodeBlock
        language="typescript"
        code={`// Get inscriptions for an address
const inscriptions = await dataSourceManager.getInscriptions('bc1q...')

// Get inscription content
const content = await dataSourceManager.getInscriptionContent('inscriptionId...')

// Get inscription details
const inscription = await dataSourceManager.getInscriptionById('inscriptionId...')

// Get inscription UTXO
const utxo = await dataSourceManager.getInscriptionUtxo('inscriptionId...')`}
        fileName="inscriptions.ts"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Tokens (BRC-20 and Runes)
      </Heading>
      <CodeBlock
        language="typescript"
        code={`// Get BRC-20 token balances
const brc20Tokens = await dataSourceManager.getMetaBalances('bc1q...', 'brc20')

// Get Rune balances
const runes = await dataSourceManager.getMetaBalances('bc1q...', 'runes')

// Get token info
const tokenInfo = await dataSourceManager.getTokenInfo('ORDI', 'brc20')

// Get token transfers
const transfers = await dataSourceManager.getTokenTransfers('bc1q...', 'ORDI', 'brc20')`}
        fileName="tokens.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Configuration
      </Heading>
      <p className="mb-6">You can configure the DataSourceManager through the LaserEyesClient configuration:</p>
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
        fileName="configuration.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Custom Data Sources
      </Heading>
      <p className="mb-6">You can register custom data sources with the DataSourceManager:</p>
      <CodeBlock
        language="typescript"
        code={`import { DataSource } from '@kevinoyl/lasereyes-core'

// Implement the DataSource interface
class CustomDataSource implements DataSource {
  constructor(private apiKey: string, private network: NetworkType) {
    // Initialize your data source
  }

  // Implement required methods
  async getBalance(address: string): Promise<string> {
    // Implement balance fetching logic
    const response = await fetch(\`https://your-api.com/balance/\${address}?apiKey=\${this.apiKey}\`)
    const data = await response.json()
    return data.balance
  }

  // Implement other required methods...
}

// Register your custom data source
const customDataSource = new CustomDataSource('your-api-key', MAINNET)
dataSourceManager.registerDataSource('custom', customDataSource)`}
        fileName="custom-datasource.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Provider Selection
      </Heading>
      <p className="mb-6">The DataSourceManager automatically selects the appropriate provider based on:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>The operation being performed</li>
        <li>Provider availability</li>
        <li>Provider capabilities</li>
        <li>Previous success/failure with each provider</li>
      </ul>
      <p className="mb-6">You can also manually specify which provider to use for a specific operation:</p>
      <CodeBlock
        language="typescript"
        code={`// Use Maestro specifically for this operation
const balance = await dataSourceManager.getBalance('bc1q...', { provider: 'maestro' })

// Use Sandshrew specifically for this operation
const utxos = await dataSourceManager.getUtxos('bc1q...', { provider: 'sandshrew' })`}
        fileName="provider-selection.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Error Handling
      </Heading>
      <p className="mb-6">The DataSourceManager includes built-in error handling and retry logic:</p>
      <CodeBlock
        language="typescript"
        code={`try {
  const balance = await dataSourceManager.getBalance('bc1q...')
} catch (error) {
  if (error.code === 'PROVIDER_ERROR') {
    console.error('All providers failed:', error.message)
  } else if (error.code === 'INVALID_ADDRESS') {
    console.error('Invalid Bitcoin address')
  } else {
    console.error('Operation failed:', error.message)
  }
}`}
        fileName="error-handling.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Caching
      </Heading>
      <p className="mb-6">The DataSourceManager includes built-in caching to improve performance:</p>
      <CodeBlock
        language="typescript"
        code={`// Configure cache options
const config = createConfig({
  network: MAINNET,
  cacheOptions: {
    ttl: 60000, // Cache time-to-live in milliseconds
    maxSize: 100, // Maximum number of items to cache
  }
})

// The DataSourceManager will automatically cache results
// You can bypass the cache for specific operations
const balance = await dataSourceManager.getBalance('bc1q...', { bypassCache: true })`}
        fileName="caching.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Provider Capabilities
      </Heading>
      <p className="mb-6">Different data providers have different capabilities:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Feature</th>
              <th className="border p-2 text-center">Maestro</th>
              <th className="border p-2 text-center">Sandshrew</th>
              <th className="border p-2 text-center">Mempool.space</th>
              <th className="border p-2 text-center">Esplora</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Basic Bitcoin Operations</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
            </tr>
            <tr>
              <td className="border p-2">Ordinals & Inscriptions</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border p-2">BRC-20 Tokens</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border p-2">Runes</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border p-2">Fee Estimation</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
            </tr>
            <tr>
              <td className="border p-2">Transaction History</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">Now that you understand the DataSourceManager, you can explore related topics:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/maestro" className="text-primary hover:underline">
            Maestro Integration
          </Link>{" "}
          - Learn more about the Maestro data provider
        </li>
        <li>
          <Link href="/docs/sandshrew" className="text-primary hover:underline">
            Sandshrew Integration
          </Link>{" "}
          - Explore the Sandshrew data provider
        </li>
        <li>
          <Link href="/docs/mempool-space" className="text-primary hover:underline">
            Mempool.space Integration
          </Link>{" "}
          - Understand the Mempool.space data provider
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

