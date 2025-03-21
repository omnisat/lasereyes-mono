"use client"

import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Heading } from "@/components/heading"

export default function BasicSetupPage() {
  return (
    <div className="space-y-6">
      <Heading>Basic Setup</Heading>

      <ClientPageWrapper>
        <BasicSetupContent />
      </ClientPageWrapper>
    </div>
  )
}

// Client component with all the content
function BasicSetupContent() {
  return (
    <div className="space-y-6">
      <p>This guide will walk you through the basic setup of LaserEyes in your React application.</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Prerequisites</h2>
      <p>Before you begin, make sure you have:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>A React project (v16.8 or higher)</li>
        <li>Node.js (v14 or higher)</li>
        <li>npm, yarn, or pnpm</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Installation</h2>
      <p>First, install the LaserEyes packages:</p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`npm install @omnisat/lasereyes-core @omnisat/lasereyes-react`}</code>
      </pre>

      <h2 className="text-2xl font-bold mt-8 mb-4">Provider Setup</h2>
      <p>Wrap your application with the LaserEyes provider:</p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{
        network: MAINNET,
        // Other configuration options
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}</code>
      </pre>

      <h2 className="text-2xl font-bold mt-8 mb-4">Configuration Options</h2>
      <p>The LaserEyes provider accepts several configuration options:</p>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left">Option</th>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2 text-left">Default</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">
              <code>network</code>
            </td>
            <td className="border p-2">Bitcoin network to connect to</td>
            <td className="border p-2">
              <code>MAINNET</code>
            </td>
          </tr>
          <tr>
            <td className="border p-2">
              <code>dataSources</code>
            </td>
            <td className="border p-2">Array of data sources to use</td>
            <td className="border p-2">Default data source</td>
          </tr>
          <tr>
            <td className="border p-2">
              <code>walletProviders</code>
            </td>
            <td className="border p-2">Array of wallet providers to support</td>
            <td className="border p-2">All available providers</td>
          </tr>
          <tr>
            <td className="border p-2">
              <code>autoConnect</code>
            </td>
            <td className="border p-2">Whether to auto-connect to the last used wallet</td>
            <td className="border p-2">
              <code>true</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mt-8 mb-4">Using the Hook</h2>
      <p>
        Access LaserEyes functionality in your components using the <code>useLaserEyes</code> hook:
      </p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`import { useLaserEyes } from '@omnisat/lasereyes-react'

function WalletStatus() {
  const { 
    connect, 
    disconnect, 
    address, 
    isConnected, 
    isConnecting 
  } = useLaserEyes()

  if (isConnecting) {
    return <div>Connecting...</div>
  }

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    )
  }

  return (
    <button onClick={connect}>Connect Wallet</button>
  )
}`}</code>
      </pre>

      <h2 className="text-2xl font-bold mt-8 mb-4">Next Steps</h2>
      <p>Now that you have the basic setup complete, you can:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Explore the{" "}
          <a href="/docs/use-laser-eyes" className="text-primary hover:underline">
            useLaserEyes hook
          </a>{" "}
          in depth
        </li>
        <li>
          Learn about{" "}
          <a href="/docs/wallet-providers" className="text-primary hover:underline">
            wallet providers
          </a>
        </li>
        <li>
          Configure{" "}
          <a href="/docs/datasource-system" className="text-primary hover:underline">
            data sources
          </a>{" "}
          for your application
        </li>
        <li>
          Check out the{" "}
          <a href="/docs/examples" className="text-primary hover:underline">
            examples
          </a>{" "}
          for common use cases
        </li>
      </ul>
    </div>
  )
}

