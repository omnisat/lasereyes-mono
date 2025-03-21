"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function SandshrewIntegrationPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Sandshrew Integration
      </Heading>
      <p className="text-lg mb-4">
        Sandshrew is a fast and reliable Bitcoin data indexing service with excellent developer experience and
        comprehensive support for Ordinals and BRC-20 tokens. LaserEyes integrates with Sandshrew to provide efficient
        access to Bitcoin blockchain data.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Overview
      </Heading>
      <p className="mb-6">Sandshrew provides a range of APIs for Bitcoin developers, including:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Bitcoin blockchain data (transactions, blocks, addresses)</li>
        <li>Ordinals and inscriptions</li>
        <li>BRC-20 tokens</li>
        <li>UTXO management</li>
        <li>Transaction broadcasting</li>
        <li>Fee estimation</li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Configuration
      </Heading>
      <p className="mb-6">To use Sandshrew with LaserEyes, you need to configure it in your LaserEyes setup:</p>
      <CodeBlock
        language="typescript"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: MAINNET,
        dataSources: {
          sandshrew: {
            url: 'https://api.sandshrew.io', // Optional, defaults to this
            apiKey: 'your-sandshrew-api-key', // Optional for development
          }
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="sandshrew-config.tsx"
        copyButton={true}
      />

      <WarningBox title="API Key Requirements" className="mt-6 mb-6">
        While LaserEyes includes development API keys for testing, you should register for your own API key at{" "}
        <a href="https://sandshrew.io/" target="_blank" rel="noreferrer" className="text-primary underline">
          sandshrew.io
        </a>{" "}
        for production use to avoid rate limiting issues.
      </WarningBox>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Supported Features
      </Heading>
      <p className="mb-6">Sandshrew provides strong support for most Bitcoin operations:</p>
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
              <td className="border p-2">Ordinals & Inscriptions</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">Comprehensive inscription indexing and content retrieval</td>
            </tr>
            <tr>
              <td className="border p-2">BRC-20 Tokens</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">Full token indexing, balances, and transfers</td>
            </tr>
            <tr>
              <td className="border p-2">Runes</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2">Not currently supported</td>
            </tr>
            <tr>
              <td className="border p-2">Testnet Support</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">Supports both Mainnet and Testnet</td>
            </tr>
            <tr>
              <td className="border p-2">Signet Support</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2">Not currently supported</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Example Usage
      </Heading>
      <p className="mb-6">Here's how to use Sandshrew-specific features with LaserEyes:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'

function BitcoinData() {
  const { client } = useLaserEyes()
  
  const fetchDataWithSandshrew = async () => {
    // Get the DataSource Manager
    const dataSourceManager = client.getDataSourceManager()
    
    // Use Sandshrew specifically for these operations
    const balance = await dataSourceManager.getBalance('bc1q...', { provider: 'sandshrew' })
    const inscriptions = await dataSourceManager.getInscriptions('bc1q...', { provider: 'sandshrew' })
    const brc20Tokens = await dataSourceManager.getMetaBalances('bc1q...', 'brc20', { provider: 'sandshrew' })
    
    console.log('Balance:', balance)
    console.log('Inscriptions:', inscriptions)
    console.log('BRC-20 Tokens:', brc20Tokens)
  }
  
  return (
    <button onClick={fetchDataWithSandshrew}>Fetch Data with Sandshrew</button>
  )
}`}
        fileName="sandshrew-usage.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Advanced Configuration
      </Heading>
      <p className="mb-6">Sandshrew offers additional configuration options for advanced use cases:</p>
      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
  network: MAINNET,
  dataSources: {
    sandshrew: {
      apiKey: 'your-sandshrew-api-key',
      // Optional: Override the base URL
      url: 'https://api.sandshrew.io',
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
        fileName="advanced-sandshrew-config.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Performance Considerations
      </Heading>
      <p className="mb-6">
        Sandshrew is known for its performance and reliability. Here are some key performance characteristics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Fast Response Times:</strong> Typically under 200ms for most API calls
        </li>
        <li>
          <strong>High Availability:</strong> 99.9% uptime guarantee on paid plans
        </li>
        <li>
          <strong>Global CDN:</strong> Data is served from edge locations for low latency
        </li>
        <li>
          <strong>Efficient Indexing:</strong> Optimized for quick retrieval of inscription and BRC-20 data
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Rate Limits and Quotas
      </Heading>
      <p className="mb-6">Sandshrew has different rate limits and quotas depending on your subscription plan:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Free Tier:</strong> Limited to 5 requests per second and 5,000 requests per day
        </li>
        <li>
          <strong>Pro Tier:</strong> Higher limits suitable for most applications
        </li>
        <li>
          <strong>Enterprise Tier:</strong> Custom limits based on your needs
        </li>
      </ul>
      <p className="mb-6">
        LaserEyes includes built-in rate limiting and retry logic to help manage these limits, but you should be aware
        of them when designing your application.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">Here are some best practices for using Sandshrew with LaserEyes:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Use caching</strong> to reduce API calls for frequently accessed data
        </li>
        <li>
          <strong>Implement error handling</strong> for rate limit errors (HTTP 429)
        </li>
        <li>
          <strong>Use batch operations</strong> when possible to reduce the number of API calls
        </li>
        <li>
          <strong>Monitor your usage</strong> through the Sandshrew dashboard
        </li>
        <li>
          <strong>Consider using multiple data providers</strong> for redundancy
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand how to use Sandshrew with LaserEyes, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/maestro" className="text-primary hover:underline">
            Maestro Integration
          </Link>{" "}
          - Learn about another data provider option
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

