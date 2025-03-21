"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function CustomDataSourcePage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Custom DataSource Implementation
      </Heading>
      <p className="text-lg mb-4">
        LaserEyes allows you to implement custom data sources to integrate with other Bitcoin data providers or to add
        specialized functionality. This page explains how to create and register your own data source.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Overview
      </Heading>
      <p className="mb-6">You might want to implement a custom data source for several reasons:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Integrating with a Bitcoin data provider not supported by LaserEyes</li>
        <li>Connecting to your own Bitcoin node or indexer</li>
        <li>Adding specialized functionality for your application</li>
        <li>Implementing custom caching or data transformation logic</li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        The DataSource Interface
      </Heading>
      <p className="mb-6">
        To implement a custom data source, you need to create a class that implements the <code>DataSource</code>{" "}
        interface:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { 
  DataSource, 
  NetworkType, 
  UTXO, 
  Transaction, 
  Inscription 
} from '@omnisat/lasereyes-core'

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

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Required Methods
      </Heading>
      <p className="mb-6">At a minimum, your custom data source should implement these core methods:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Method</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Return Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>getBalance</code>
              </td>
              <td className="border p-2">Get the balance of an address in satoshis</td>
              <td className="border p-2">
                <code>Promise&lt;string&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>getUtxos</code>
              </td>
              <td className="border p-2">Get the UTXOs for an address</td>
              <td className="border p-2">
                <code>Promise&lt;UTXO[]&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>getTransaction</code>
              </td>
              <td className="border p-2">Get transaction details by TXID</td>
              <td className="border p-2">
                <code>Promise&lt;Transaction&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>broadcastTransaction</code>
              </td>
              <td className="border p-2">Broadcast a signed transaction</td>
              <td className="border p-2">
                <code>Promise&lt;string&gt;</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Optional Methods
      </Heading>
      <p className="mb-6">Depending on your data source's capabilities, you can implement additional methods:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Method</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Return Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>getInscriptions</code>
              </td>
              <td className="border p-2">Get inscriptions for an address</td>
              <td className="border p-2">
                <code>Promise&lt;Inscription[]&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>getInscriptionContent</code>
              </td>
              <td className="border p-2">Get the content of an inscription</td>
              <td className="border p-2">
                <code>Promise&lt;string&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>getInscriptionById</code>
              </td>
              <td className="border p-2">Get inscription details by ID</td>
              <td className="border p-2">
                <code>Promise&lt;Inscription&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>getMetaBalances</code>
              </td>
              <td className="border p-2">Get token balances (BRC-20, Runes)</td>
              <td className="border p-2">
                <code>Promise&lt;any[]&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>estimateFee</code>
              </td>
              <td className="border p-2">Estimate transaction fee rate</td>
              <td className="border p-2">
                <code>Promise&lt;number&gt;</code>
              </td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>getBlockHeight</code>
              </td>
              <td className="border p-2">Get current block height</td>
              <td className="border p-2">
                <code>Promise&lt;number&gt;</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Registering Your Custom Data Source
      </Heading>
      <p className="mb-6">
        Once you've implemented your custom data source, you need to register it with the DataSourceManager:
      </p>
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
        Using Your Custom Data Source
      </Heading>
      <p className="mb-6">After registering your custom data source, you can use it like any other data source:</p>
      <CodeBlock
        language="typescript"
        code={`// Use your custom data source specifically
const balance = await dataSourceManager.getBalance('bc1q...', { provider: 'custom' })
const utxos = await dataSourceManager.getUtxos('bc1q...', { provider: 'custom' })

// Or let the DataSourceManager choose the best provider
// (which may include your custom data source)
const balance = await dataSourceManager.getBalance('bc1q...')
const utxos = await dataSourceManager.getUtxos('bc1q...')`}
        fileName="using-custom-datasource.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Example: Bitcoin Core RPC Data Source
      </Heading>
      <p className="mb-6">Here's an example of a custom data source that connects to a Bitcoin Core node via RPC:</p>
      <CodeBlock
        language="typescript"
        code={`import { DataSource, NetworkType, UTXO, Transaction } from '@omnisat/lasereyes-core'

class BitcoinCoreDataSource implements DataSource {
  private rpcUrl: string
  private auth: string

  constructor(
    private network: NetworkType,
    options: {
      host?: string
      port?: number
      username: string
      password: string
      protocol?: 'http' | 'https'
    }
  ) {
    const { host = 'localhost', port = 8332, username, password, protocol = 'http' } = options
    this.rpcUrl = \`\${protocol}://\${host}:\${port}\`
    this.auth = \`Basic \${Buffer.from(\`\${username}:\${password}\`).toString('base64')}\`
  }

  private async rpcCall(method: string, params: any[] = []): Promise<any> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.auth
      },
      body: JSON.stringify({
        jsonrpc: '1.0',
        id: 'lasereyes',
        method,
        params
      })
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(\`RPC Error: \${data.error.message}\`)
    }

    return data.result
  }

  async getBalance(address: string): Promise<string> {
    // First, get the UTXOs for the address
    const utxos = await this.getUtxos(address)
    
    // Sum the values of all UTXOs
    const balance = utxos.reduce((sum, utxo) => sum + BigInt(utxo.value), BigInt(0))
    
    return balance.toString()
  }

  async getUtxos(address: string): Promise<UTXO[]> {
    // Bitcoin Core doesn't have a direct method to get UTXOs by address
    // We need to use scantxoutset to find UTXOs for an address
    const result = await this.rpcCall('scantxoutset', ['start', [\`addr(\${address})\`]])
    
    return result.unspents.map((utxo: any) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.amount.toString(),
      status: { confirmed: true }
    }))
  }

  async getTransaction(txid: string): Promise<Transaction> {
    // Get raw transaction
    const txHex = await this.rpcCall('getrawtransaction', [txid])
    
    // Decode raw transaction
    const tx = await this.rpcCall('decoderawtransaction', [txHex])
    
    return {
      txid: tx.txid,
      version: tx.version,
      locktime: tx.locktime,
      vin: tx.vin,
      vout: tx.vout,
      size: tx.size,
      weight: tx.weight,
      fee: '0', // Bitcoin Core doesn't provide fee in decoded tx
      status: { confirmed: true }
    }
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    return await this.rpcCall('sendrawtransaction', [txHex])
  }

  async estimateFee(targetBlocks: number = 6): Promise<number> {
    // estimatesmartfee returns BTC/kB, convert to sat/vB
    const result = await this.rpcCall('estimatesmartfee', [targetBlocks])
    
    if (result.errors || !result.feerate) {
      throw new Error('Fee estimation failed')
    }
    
    // Convert BTC/kB to sat/vB
    return Math.round(result.feerate * 100000)
  }

  async getBlockHeight(): Promise<number> {
    return await this.rpcCall('getblockcount')
  }

  // Other methods would return empty results or throw "Not implemented"
  // since Bitcoin Core doesn't support Ordinals or tokens natively
}`}
        fileName="bitcoin-core-datasource.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">Here are some best practices for implementing custom data sources:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Implement error handling</strong> for API calls and provide meaningful error messages
        </li>
        <li>
          <strong>Add logging</strong> to help with debugging
        </li>
        <li>
          <strong>Implement caching</strong> for frequently accessed data
        </li>
        <li>
          <strong>Handle rate limits</strong> with retry logic and backoff strategies
        </li>
        <li>
          <strong>Normalize data</strong> to match the expected formats
        </li>
        <li>
          <strong>Document capabilities</strong> so users know what your data source supports
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand how to implement custom data sources, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/maestro" className="text-primary hover:underline">
            Maestro Integration
          </Link>{" "}
          - Learn about the built-in Maestro data provider
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
          - Learn about the Mempool.space data provider
        </li>
        <li>
          <Link href="/docs/performance" className="text-primary hover:underline">
            Performance Optimization
          </Link>{" "}
          - Learn how to optimize performance with data providers
        </li>
      </ul>
    </>
  )
}

