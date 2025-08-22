"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function MempoolSpaceContent() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Mempool.space Integration
      </Heading>
      <p className="text-lg mb-4">
        Mempool.space is an open-source explorer and API for the Bitcoin mempool and network. LaserEyes integrates with
        Mempool.space to provide reliable access to basic Bitcoin blockchain data and real-time mempool information.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Overview
      </Heading>
      <p className="mb-6">Mempool.space provides a range of APIs for Bitcoin developers, including:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Bitcoin blockchain data (transactions, blocks, addresses)</li>
        <li>Mempool statistics and visualization</li>
        <li>Fee estimation</li>
        <li>Transaction broadcasting</li>
        <li>UTXO management</li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Configuration
      </Heading>
      <p className="mb-6">To use Mempool.space with LaserEyes, you need to configure it in your LaserEyes setup:</p>
      <CodeBlock
        language="typescript"
        code={`import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { MAINNET } from '@kevinoyl/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET,
        dataSources: {
          mempool: {
            url: 'https://mempool.space/api', // Optional, defaults to this
          }
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="mempool-config.tsx"
        copyButton={true}
      />

      <p className="mt-6 mb-6">
        Unlike Maestro and Sandshrew, Mempool.space is a free and open-source service that doesn't require an API key.
        However, it has more limited functionality, particularly for Ordinals and tokens.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Supported Features
      </Heading>
      <p className="mb-6">
        Mempool.space provides strong support for basic Bitcoin operations but lacks support for Ordinals and tokens:
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Feature</th>
              <th className="border p-2 text-center">Support</th>
              <th className="border p-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Basic Bitcoin Operations</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">Full support for addresses, transactions, UTXOs</td>
            </tr>
            <tr>
              <td className="border p-2">Mempool Data</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">Excellent support for mempool statistics and visualization</td>
            </tr>
            <tr>
              <td className="border p-2">Fee Estimation</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">Detailed fee estimates for different confirmation targets</td>
            </tr>
            <tr>
              <td className="border p-2">Ordinals & Inscriptions</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2">Not supported</td>
            </tr>
            <tr>
              <td className="border p-2">BRC-20 Tokens</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2">Not supported</td>
            </tr>
            <tr>
              <td className="border p-2">Runes</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2">Not supported</td>
            </tr>
            <tr>
              <td className="border p-2">Testnet Support</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">Supports Mainnet, Testnet, and Signet</td>
            </tr>
            <tr>
              <td className="border p-2">Signet Support</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">One of the few providers with Signet support</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Example Usage
      </Heading>
      <p className="mb-6">Here's how to use Mempool.space-specific features with LaserEyes:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function BitcoinData() {
  const { client } = useLaserEyes()

  const fetchDataWithMempool = async () => {
    // Get the DataSource Manager
    const dataSourceManager = client.getDataSourceManager()
    
    // Use Mempool.space specifically for these operations
    const balance = await dataSourceManager.getBalance('bc1q...', { provider: 'mempool' })
    const utxos = await dataSourceManager.getUtxos('bc1q...', { provider: 'mempool' })
    const feeRate = await dataSourceManager.estimateFee(1, { provider: 'mempool' })
    
    console.log('Balance:', balance)
    console.log('UTXOs:', utxos)
    console.log('Fee Rate:', feeRate, 'sat/vB')
  }

  return (
    <button onClick={fetchDataWithMempool}>Fetch Data with Mempool.space</button>
  )
}`}
        fileName="mempool-usage.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Advanced Configuration
      </Heading>
      <p className="mb-6">Mempool.space offers additional configuration options for advanced use cases:</p>
      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
  network: MAINNET,
  dataSources: {
    mempool: {
      // Optional: Override the base URL
      url: 'https://mempool.space/api',
      // Optional: Use a self-hosted instance
      // url: 'https://your-mempool-instance.com/api',
      // Optional: Configure request timeouts (in milliseconds)
      timeout: 30000,
      // Optional: Configure retry options
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 5000,
      }
    }
  }
})`}
        fileName="advanced-mempool-config.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Self-Hosting
      </Heading>
      <p className="mb-6">
        One of the advantages of Mempool.space is that it's open-source and can be self-hosted. This gives you complete
        control over your Bitcoin data infrastructure and eliminates reliance on third-party services.
      </p>
      <p className="mb-6">
        To use a self-hosted Mempool.space instance with LaserEyes, simply configure the URL to point to your instance:
      </p>
      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
  network: MAINNET,
  dataSources: {
    mempool: {
      url: 'https://your-mempool-instance.com/api',
    }
  }
})`}
        fileName="self-hosted-mempool-config.ts"
        copyButton={true}
      />

      <p className="mb-6">
        For instructions on setting up your own Mempool.space instance, refer to the{" "}
        <a
          href="https://github.com/mempool/mempool"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          official GitHub repository
        </a>
        .
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Rate Limits
      </Heading>
      <p className="mb-6">The public Mempool.space API has rate limits to prevent abuse:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Public API:</strong> Limited to 30 requests per minute per IP address
        </li>
        <li>
          <strong>Self-hosted:</strong> No rate limits (depends on your server capacity)
        </li>
      </ul>
      <p className="mb-6">
        LaserEyes includes built-in rate limiting and retry logic to help manage these limits, but you should be aware
        of them when designing your application.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">Here are some best practices for using Mempool.space with LaserEyes:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Use caching</strong> to reduce API calls for frequently accessed data
        </li>
        <li>
          <strong>Consider self-hosting</strong> for production applications to avoid rate limits
        </li>
        <li>
          <strong>Use multiple data providers</strong> for features not supported by Mempool.space
        </li>
        <li>
          <strong>Implement error handling</strong> for rate limit errors (HTTP 429)
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand how to use Mempool.space with LaserEyes, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/maestro" className="text-primary hover:underline">
            Maestro Integration
          </Link>{" "}
          - Learn about a data provider with Ordinals support
        </li>
        <li>
          <Link href="/docs/sandshrew" className="text-primary hover:underline">
            Sandshrew Integration
          </Link>{" "}
          - Explore another data provider option
        </li>
        <li>
          <Link href="/docs/custom-datasource" className="text-primary hover:underline">
            Custom DataSource Implementation
          </Link>{" "}
          - Create your own data source
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

