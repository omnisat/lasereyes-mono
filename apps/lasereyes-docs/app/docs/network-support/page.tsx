"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function NetworkSupportPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Network Support
      </Heading>
      <p className="text-lg mb-4">
        LaserEyes supports multiple Bitcoin networks, allowing you to develop and test your applications in different
        environments. This page explains the supported networks and how to configure LaserEyes to use them.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Bitcoin Networks Overview
      </Heading>
      <p className="mb-6">
        Bitcoin has several networks that serve different purposes. Each network has its own blockchain, rules, and
        characteristics:
      </p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Mainnet
          </Heading>
          <p className="text-muted-foreground">
            The primary Bitcoin network where real BTC transactions occur. This is the production environment for
            Bitcoin applications.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Testnet
          </Heading>
          <p className="text-muted-foreground">
            A testing environment that mimics Mainnet but uses worthless test coins. Ideal for development and testing
            without risking real funds.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Signet
          </Heading>
          <p className="text-muted-foreground">
            A more controlled test network where blocks are signed by a central authority. Provides a more stable
            testing environment than Testnet.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Regtest
          </Heading>
          <p className="text-muted-foreground">
            A local testing environment where developers can create blocks on demand. Perfect for isolated testing and
            development.
          </p>
        </div>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Supported Networks in LaserEyes
      </Heading>
      <p className="mb-6">LaserEyes provides built-in support for the following Bitcoin networks:</p>

      <CodeBlock
        language="typescript"
        code={`import { 
  MAINNET,  // Bitcoin Mainnet
  TESTNET,  // Bitcoin Testnet
  SIGNET,   // Bitcoin Signet
  TESTNET4  // Bitcoin Testnet4 (experimental)
} from '@omnisat/lasereyes-core'`}
        fileName="networks.ts"
        copyButton={true}
      />

      <p className="mt-4 mb-6">
        Each network constant contains the necessary configuration for that network, including:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Network name and identifier</li>
        <li>Default API endpoints for data providers</li>
        <li>Network-specific parameters</li>
        <li>Address format and validation rules</li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Network Configuration
      </Heading>
      <p className="mb-6">
        To specify which network your application should use, provide the network constant in the LaserEyes
        configuration:
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        React Setup
      </Heading>
      <CodeBlock
        language="tsx"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { TESTNET } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ 
        network: TESTNET,  // Use Bitcoin Testnet
        // Other configuration options...
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="testnet-config.tsx"
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
  SIGNET
} from '@omnisat/lasereyes-core'

// Create stores and config with Signet network
const stores = createStores()
const config = createConfig({ 
  network: SIGNET,  // Use Bitcoin Signet
  // Other configuration options...
})

// Initialize the client
const client = new LaserEyesClient(stores, config)
client.initialize()`}
        fileName="signet-config.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Network-Specific Considerations
      </Heading>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Mainnet
      </Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Uses real BTC with actual value</li>
        <li>Transactions require real fees</li>
        <li>All major wallet providers support Mainnet</li>
        <li>Production-ready data providers are required</li>
      </ul>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Testnet
      </Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Uses worthless test coins (tBTC)</li>
        <li>Coins can be obtained from testnet faucets</li>
        <li>Most wallet providers support Testnet, but may require configuration</li>
        <li>Block times and network conditions can be unpredictable</li>
      </ul>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Signet
      </Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>More stable and predictable than Testnet</li>
        <li>Limited wallet support compared to Testnet</li>
        <li>Requires specific data providers that support Signet</li>
        <li>Useful for testing features that require consistent block times</li>
      </ul>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Testnet4
      </Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Experimental testnet with potential future changes</li>
        <li>Limited wallet and data provider support</li>
        <li>Useful for testing upcoming Bitcoin features</li>
        <li>May have different rules than other networks</li>
      </ul>

      <WarningBox title="Wallet Provider Support" className="mt-6 mb-6">
        Not all wallet providers support all networks. Check the wallet provider's documentation to ensure it supports
        the network you intend to use. Most wallets support Mainnet and Testnet, but support for Signet and Testnet4 may
        be limited.
      </WarningBox>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Obtaining Test Coins
      </Heading>
      <p className="mb-6">
        For development and testing on non-Mainnet networks, you'll need test coins. These can be obtained from various
        faucets:
      </p>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <Heading level={3} className="text-xl font-bold mb-2">
          Testnet Faucets
        </Heading>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a
              href="https://coinfaucet.eu/en/btc-testnet/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              coinfaucet.eu
            </a>
          </li>
          <li>
            <a
              href="https://testnet-faucet.mempool.co/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              testnet-faucet.mempool.co
            </a>
          </li>
          <li>
            <a
              href="https://bitcoinfaucet.uo1.net/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              bitcoinfaucet.uo1.net
            </a>
          </li>
        </ul>
      </div>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <Heading level={3} className="text-xl font-bold mb-2">
          Signet Faucets
        </Heading>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a href="https://signet.bc-2.jp/" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              signet.bc-2.jp
            </a>
          </li>
          <li>
            <a
              href="https://signetfaucet.com/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              signetfaucet.com
            </a>
          </li>
        </ul>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Switching Networks
      </Heading>
      <p className="mb-6">
        LaserEyes does not support switching networks at runtime. The network is specified during initialization and
        remains fixed for the lifetime of the client. If you need to switch networks, you must reinitialize the client
        with a new configuration.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Create a new client with a different network
function createClientForNetwork(network) {
  const stores = createStores()
  const config = createConfig({ network })
  const client = new LaserEyesClient(stores, config)
  client.initialize()
  return client
}

// Usage
const mainnetClient = createClientForNetwork(MAINNET)
const testnetClient = createClientForNetwork(TESTNET)`}
        fileName="switch-networks.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        DataSource Providers and Networks
      </Heading>
      <p className="mb-6">
        Different data providers may have varying levels of support for different networks. When configuring LaserEyes,
        ensure that your chosen data providers support the network you're using.
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Data Provider</th>
              <th className="border p-2 text-center">Mainnet</th>
              <th className="border p-2 text-center">Testnet</th>
              <th className="border p-2 text-center">Signet</th>
              <th className="border p-2 text-center">Testnet4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Maestro</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border p-2">Sandshrew</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border p-2">Mempool.space</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
            </tr>
            <tr>
              <td className="border p-2">Esplora</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Testing Recommendations
      </Heading>
      <p className="mb-6">Here are some recommendations for testing your application on different networks:</p>

      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Development</strong>: Use Testnet or Signet during development to avoid using real BTC.
        </li>
        <li>
          <strong>Integration Testing</strong>: Use Testnet for integration testing with real wallet providers.
        </li>
        <li>
          <strong>Unit Testing</strong>: Consider using mocks or a local Regtest environment for unit tests.
        </li>
        <li>
          <strong>Production</strong>: Always thoroughly test on Testnet before deploying to Mainnet.
        </li>
        <li>
          <strong>CI/CD</strong>: Set up automated tests on Testnet in your continuous integration pipeline.
        </li>
      </ul>

      <WarningBox title="Testing on Mainnet" className="mt-6 mb-6">
        When testing on Mainnet, always use small amounts of BTC to minimize risk. Never use production API keys or
        sensitive wallets in development environments.
      </WarningBox>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">Now that you understand the network support in LaserEyes, you can explore related topics:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/datasource-system" className="text-primary hover:underline">
            DataSource System
          </Link>{" "}
          - Learn how LaserEyes interacts with Bitcoin data providers
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
        <li>
          <Link href="/docs/testing" className="text-primary hover:underline">
            Testing
          </Link>{" "}
          - Best practices for testing your LaserEyes integration
        </li>
      </ul>
    </>
  )
}

