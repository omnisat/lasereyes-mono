"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function MaestroContent() {
  return (
    <>
      <p className="text-lg mb-4">
        Maestro is a powerful Bitcoin API that provides comprehensive support for Bitcoin, Ordinals, inscriptions, and
        more. LaserEyes integrates seamlessly with Maestro to provide high-performance access to blockchain data.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Overview
      </Heading>
      <p className="mb-6">Maestro offers a suite of APIs for Bitcoin developers, including:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Bitcoin blockchain data (transactions, blocks, addresses)</li>
        <li>Ordinals and inscriptions</li>
        <li>BRC-20 tokens</li>
        <li>Runes</li>
        <li>Mempool monitoring</li>
        <li>Fee estimation</li>
        <li>Transaction broadcasting</li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Configuration
      </Heading>
      <p className="mb-6">To use Maestro with LaserEyes, you need to configure it in your LaserEyes setup:</p>
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
          maestro: {
            apiKey: 'your-maestro-api-key', // Optional for development
          }
        }
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="maestro-config.tsx"
        copyButton={true}
      />

      <WarningBox title="API Key Requirements" className="mt-6 mb-6">
        While LaserEyes includes development API keys for testing, you should register for your own API key at{" "}
        <a href="https://www.gomaestro.org/" target="_blank" rel="noreferrer" className="text-primary underline">
          gomaestro.org
        </a>{" "}
        for production use to avoid rate limiting issues.
      </WarningBox>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Supported Features
      </Heading>
      <p className="mb-6">
        Maestro is the most comprehensive data provider integrated with LaserEyes, supporting all major features:
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
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2">One of the few providers with Runes support</td>
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
      <p className="mb-6">Here's how to use Maestro-specific features with LaserEyes:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'

function BitcoinData() {
  const { client } = useLaserEyes()

  const fetchDataWithMaestro = async () => {
    // Get the DataSource Manager
    const dataSourceManager = client.getDataSourceManager()
    
    // Use Maestro specifically for these operations
    const balance = await dataSourceManager.getBalance('bc1q...', { provider: 'maestro' })
    const inscriptions = await dataSourceManager.getInscriptions('bc1q...', { provider: 'maestro' })
    const brc20Tokens = await dataSourceManager.getMetaBalances('bc1q...', 'brc20', { provider: 'maestro' })
    const runes = await dataSourceManager.getMetaBalances('bc1q...', 'runes', { provider: 'maestro' })
    
    console.log('Balance:', balance)
    console.log('Inscriptions:', inscriptions)
    console.log('BRC-20 Tokens:', brc20Tokens)
    console.log('Runes:', runes)
  }

  return (
    <button onClick={fetchDataWithMaestro}>Fetch Data with Maestro</button>
  )
}`}
        fileName="maestro-usage.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Advanced Configuration
      </Heading>
      <p className="mb-6">Maestro offers additional configuration options for advanced use cases:</p>
      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
  network: MAINNET,
  dataSources: {
    maestro: {
      apiKey: 'your-maestro-api-key',
      // Optional: Override the base URL (rarely needed)
      baseUrl: 'https://api.gomaestro.org/v1',
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
        fileName="advanced-maestro-config.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Rate Limits and Quotas
      </Heading>
      <p className="mb-6">Maestro has different rate limits and quotas depending on your subscription plan:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Free Tier:</strong> Limited to 10 requests per second and 10,000 requests per day
        </li>
        <li>
          <strong>Developer Tier:</strong> Higher limits suitable for most applications
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
      <p className="mb-6">Here are some best practices for using Maestro with LaserEyes:</p>
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
          <strong>Monitor your usage</strong> through the Maestro dashboard
        </li>
        <li>
          <strong>Consider using multiple data providers</strong> for redundancy
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">Now that you understand how to use Maestro with LaserEyes, you can explore related topics:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/sandshrew" className="text-primary hover:underline">
            Sandshrew Integration
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

