"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function DataSourceSystemPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        DataSource System
      </Heading>
      <p className="text-lg mb-4">
        The DataSource system is a core component of LaserEyes that abstracts away the complexities of interacting with
        different Bitcoin data providers. This page explains how the DataSource system works and how to configure it for
        your application.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Overview
      </Heading>
      <p className="mb-6">
        The DataSource system provides a unified interface for fetching blockchain data, regardless of the underlying
        provider. This abstraction allows you to:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Switch between different data providers without changing your application code</li>
        <li>Use multiple data providers simultaneously for redundancy and reliability</li>
        <li>Implement custom data sources for specialized needs</li>
        <li>Handle provider-specific features in a consistent way</li>
      </ul>

      <div className="bg-muted p-6 rounded-lg mb-8 overflow-auto">
        <pre className="text-xs md:text-sm whitespace-pre">
          {`┌─────────────────────────────────────────────────────────────────┐
│                      Your Application                            │
│                                                                  │
└──────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DataSource Manager                          │
│                                                                  │
└───────┬─────────────┬─────────────┬─────────────┬───────────────┘
      │             │             │             │
      ▼             ▼             ▼             ▼
┌───────────┐  ┌─────────────┐ ┌──────────┐ ┌────────────┐
│  Maestro  │  │  Sandshrew  │ │ Mempool  │ │  Esplora   │
│  Provider │  │  Provider   │ │ Provider │ │  Provider  │
└───────────┘  └─────────────┘ └──────────┘ └────────────┘`}
        </pre>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Supported Data Providers
      </Heading>
      <p className="mb-6">LaserEyes supports several Bitcoin data providers out of the box:</p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Maestro
          </Heading>
          <p className="text-muted-foreground mb-4">
            A comprehensive Bitcoin API with support for Ordinals, inscriptions, and more. Offers high performance and
            reliability.
          </p>
          <a
            href="https://www.gomaestro.org/"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline text-sm"
          >
            https://www.gomaestro.org/
          </a>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Sandshrew
          </Heading>
          <p className="text-muted-foreground mb-4">
            Fast and reliable Bitcoin data indexing service with excellent developer experience and Ordinals support.
          </p>
          <a
            href="https://sandshrew.io/"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline text-sm"
          >
            https://sandshrew.io/
          </a>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Mempool.space
          </Heading>
          <p className="text-muted-foreground mb-4">
            Open-source explorer and API for the Bitcoin mempool and network. Provides real-time transaction data.
          </p>
          <a
            href="https://mempool.space/"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline text-sm"
          >
            https://mempool.space/
          </a>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Esplora
          </Heading>
          <p className="text-muted-foreground mb-4">
            Blockstream's Bitcoin block explorer and HTTP API. Simple and reliable for basic Bitcoin operations.
          </p>
          <a
            href="https://github.com/Blockstream/esplora"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline text-sm"
          >
            https://github.com/Blockstream/esplora
          </a>
        </div>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        DataSource Manager
      </Heading>
      <p className="mb-6">
        The DataSource Manager is the central component that orchestrates data retrieval from different providers. It
        handles:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Provider selection based on availability and capability</li>
        <li>Fallback mechanisms when a provider fails</li>
        <li>Caching to improve performance</li>
        <li>Error handling and retry logic</li>
        <li>Data normalization across different providers</li>
      </ul>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Core Methods
      </Heading>
      <p className="mb-4">
        The DataSource Manager provides a set of core methods for interacting with the Bitcoin blockchain:
      </p>
      <CodeBlock
        language="typescript"
        code={`// DataSource Manager interface
interface DataSourceManager {
  // Basic Bitcoin operations
  getBalance(address: string): Promise<string>
  getUtxos(address: string): Promise<UTXO[]>
  getTransaction(txid: string): Promise<Transaction>
  broadcastTransaction(txHex: string): Promise<string>

  // Ordinals and inscriptions
  getInscriptions(address: string): Promise<Inscription[]>
  getInscriptionContent(inscriptionId: string): Promise<string>
  getInscriptionById(inscriptionId: string): Promise<Inscription>

  // BRC-20 and other tokens
  getMetaBalances(address: string, type: 'brc20' | 'runes'): Promise<any[]>
  getTokenInfo(ticker: string, type: 'brc20' | 'runes'): Promise<any>

  // Advanced operations
  estimateFee(targetBlocks?: number): Promise<number>
  getBlockHeight(): Promise<number>
  getAddressHistory(address: string): Promise<Transaction[]>
}`}
        fileName="data-source-manager.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Configuration
      </Heading>
      <p className="mb-6">You can configure the DataSource system when initializing LaserEyes:</p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        React Setup
      </Heading>
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

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Core Setup
      </Heading>
      <CodeBlock
        language="typescript"
        code={`import { 
  LaserEyesClient, 
  createStores, 
  createConfig,
  MAINNET
} from '@omnisat/lasereyes-core'

// Create config with data sources
const config = createConfig({ 
  network: MAINNET,
  dataSources: {
    maestro: {
      apiKey: 'your-maestro-api-key',
    },
    sandshrew: {
      apiKey: 'your-sandshrew-api-key',
    },
    // You can specify multiple data sources for redundancy
  }
})

// Create stores and initialize client
const stores = createStores()
const client = new LaserEyesClient(stores, config)
client.initialize()`}
        fileName="core-datasource-config.ts"
        copyButton={true}
      />

      <WarningBox title="Development API Keys" className="mt-6 mb-6">
        LaserEyes includes development API keys for testing, but these are rate-limited. For production applications,
        you should register for your own API keys with data providers like Maestro and Sandshrew to avoid rate limiting
        issues.
      </WarningBox>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Using the DataSource Manager
      </Heading>
      <p className="mb-6">
        In most cases, you won't need to interact with the DataSource Manager directly, as the LaserEyesClient and
        useLaserEyes hook provide higher-level methods that use it internally. However, if you need direct access, you
        can use the following approach:
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        React Usage
      </Heading>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'

function BitcoinData() {
  const { client } = useLaserEyes()
  const [balance, setBalance] = useState('0')
  const [address, setAddress] = useState('')

  // Access the DataSource Manager through the client
  const fetchBalance = async () => {
    if (!address) return
    
    try {
      // Use the DataSource Manager to get the balance
      const dataSourceManager = client.getDataSourceManager()
      const balanceSats = await dataSourceManager.getBalance(address)
      setBalance(balanceSats)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  return (
    <div>
      <input 
        type="text" 
        value={address} 
        onChange={(e) => setAddress(e.target.value)} 
        placeholder="Bitcoin address"
      />
      <button onClick={fetchBalance}>Get Balance</button>
      <p>Balance: {balance} satoshis</p>
    </div>
  )
}`}
        fileName="datasource-usage.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Core Usage
      </Heading>
      <CodeBlock
        language="typescript"
        code={`import { 
  LaserEyesClient, 
  createStores, 
  createConfig,
  MAINNET
} from '@omnisat/lasereyes-core'

// Initialize client
const stores = createStores()
const config = createConfig({ network: MAINNET })
const client = new LaserEyesClient(stores, config)
client.initialize()

// Get the DataSource Manager
const dataSourceManager = client.getDataSourceManager()

// Use the DataSource Manager
async function getAddressData(address) {
  try {
    // Get balance
    const balance = await dataSourceManager.getBalance(address)
    console.log('Balance:', balance, 'satoshis')
    
    // Get UTXOs
    const utxos = await dataSourceManager.getUtxos(address)
    console.log('UTXOs:', utxos)
    
    // Get inscriptions
    const inscriptions = await dataSourceManager.getInscriptions(address)
    console.log('Inscriptions:', inscriptions)
    
    // Get BRC-20 tokens
    const brc20Tokens = await dataSourceManager.getMetaBalances(address, 'brc20')
    console.log('BRC-20 Tokens:', brc20Tokens)
  } catch (error) {
    console.error('Error fetching address data:', error)
  }
}`}
        fileName="core-datasource-usage.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Provider Capabilities
      </Heading>
      <p className="mb-6">
        Different data providers have different capabilities. The DataSource Manager automatically selects the
        appropriate provider based on the operation you're trying to perform.
      </p>

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
        Custom Data Sources
      </Heading>
      <p className="mb-6">
        You can implement custom data sources to integrate with other Bitcoin data providers or to add specialized
        functionality. Custom data sources must implement the DataSource interface:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { DataSource, NetworkType, UTXO, Transaction, Inscription } from '@omnisat/lasereyes-core'

// Implement the DataSource interface
class CustomDataSource implements DataSource {
  constructor(private apiKey: string, private network: NetworkType) {
    // Initialize your data source
  }

  // Required methods
  async getBalance(address: string): Promise<string> {
    // Implement balance fetching logic
    const response = await fetch(\`https://your-api.com/balance/\${address}?apiKey=\${this.apiKey}\`)
    const data = await response.json()
    return data.balance
  }

  async getUtxos(address: string): Promise<UTXO[]> {
    // Implement UTXO fetching logic
    const response = await fetch(\`https://your-api.com/utxos/\${address}?apiKey=\${this.apiKey}\`)
    const data = await response.json()
    return data.utxos.map(utxo => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      status: utxo.status
    }))
  }

  async getTransaction(txid: string): Promise<Transaction> {
    // Implement transaction fetching logic
    const response = await fetch(\`https://your-api.com/tx/\${txid}?apiKey=\${this.apiKey}\`)
    const data = await response.json()
    return {
      txid: data.txid,
      version: data.version,
      locktime: data.locktime,
      vin: data.vin,
      vout: data.vout,
      // ... other transaction properties
    }
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    // Implement transaction broadcasting logic
    const response = await fetch('https://your-api.com/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.apiKey}\`
      },
      body: JSON.stringify({ txHex })
    })
    const data = await response.json()
    return data.txid
  }

  // Optional methods for Ordinals and inscriptions
  async getInscriptions(address: string): Promise<Inscription[]> {
    // Implement if your data source supports inscriptions
    return []
  }

  // ... implement other methods as needed
}`}
        fileName="custom-datasource.ts"
        copyButton={true}
      />

      <p className="mt-6 mb-6">To register your custom data source with LaserEyes:</p>

      <CodeBlock
        language="typescript"
        code={`import { LaserEyesClient, createStores, createConfig, MAINNET } from '@omnisat/lasereyes-core'
import { CustomDataSource } from './custom-datasource'

// Create config
const config = createConfig({ 
  network: MAINNET,
  // Configure built-in data sources as needed
})

// Create stores and client
const stores = createStores()
const client = new LaserEyesClient(stores, config)

// Initialize the client
client.initialize()

// Get the DataSource Manager
const dataSourceManager = client.getDataSourceManager()

// Register your custom data source
const customDataSource = new CustomDataSource('your-api-key', MAINNET)
dataSourceManager.registerDataSource('custom', customDataSource)

// Now you can use your custom data source through the DataSource Manager
// The manager will automatically include it in provider selection`}
        fileName="register-custom-datasource.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">Here are some best practices for working with the DataSource system:</p>

      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Use multiple data providers</strong> for redundancy and reliability. If one provider fails, LaserEyes
          will automatically fall back to others.
        </li>
        <li>
          <strong>Register for your own API keys</strong> with data providers for production applications. The
          development keys included with LaserEyes are rate-limited.
        </li>
        <li>
          <strong>Consider your application's needs</strong> when selecting data providers. Some providers are better
          suited for certain types of operations.
        </li>
        <li>
          <strong>Implement error handling</strong> for operations that interact with the blockchain, as network issues
          or provider outages can occur.
        </li>
        <li>
          <strong>Cache frequently accessed data</strong> to reduce API calls and improve performance.
        </li>
        <li>
          <strong>Monitor your API usage</strong> to avoid hitting rate limits, especially in production.
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">Now that you understand the DataSource system, you can explore related topics:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/transaction-types" className="text-primary hover:underline">
            Transaction Types
          </Link>{" "}
          - Learn about the different types of transactions supported by LaserEyes
        </li>
        <li>
          <Link href="/docs/maestro" className="text-primary hover:underline">
            Maestro Integration
          </Link>{" "}
          - Dive deeper into the Maestro data provider
        </li>
        <li>
          <Link href="/docs/sandshrew" className="text-primary hover:underline">
            Sandshrew Integration
          </Link>{" "}
          - Learn more about the Sandshrew data provider
        </li>
        <li>
          <Link href="/docs/mempool-space" className="text-primary hover:underline">
            Mempool.space Integration
          </Link>{" "}
          - Explore the Mempool.space data provider
        </li>
        <li>
          <Link href="/docs/custom-datasource" className="text-primary hover:underline">
            Custom DataSource Implementation
          </Link>{" "}
          - Learn how to implement your own data source
        </li>
      </ul>
    </>
  )
}

