"use client"

import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Heading } from "@/components/heading"

export default function MempoolSpacePage() {
  return (
    <div className="space-y-6">
      <Heading>Mempool.space Data Source</Heading>

      <ClientPageWrapper>
        <MempoolSpaceContent />
      </ClientPageWrapper>
    </div>
  )
}

// Client component with all the content
function MempoolSpaceContent() {
  return (
    <div className="space-y-6">
      <p>
        The Mempool.space data source provides access to Bitcoin network data through the Mempool.space API. This data
        source is useful for tracking transactions, blocks, and other Bitcoin network information.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Features</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Transaction tracking and status updates</li>
        <li>Block information and confirmations</li>
        <li>Fee estimation</li>
        <li>Address balance and transaction history</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Configuration</h2>
      <p>To use the Mempool.space data source, you need to configure it in your LaserEyes provider:</p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MempoolSpaceDataSource } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{
        dataSources: [
          new MempoolSpaceDataSource({
            network: 'mainnet', // or 'testnet'
            apiUrl: 'https://mempool.space/api', // optional, defaults to mempool.space
          })
        ]
      }}
    >
      {/* Your app content */}
    </LaserEyesProvider>
  )
}`}</code>
      </pre>

      <h2 className="text-2xl font-bold mt-8 mb-4">API Reference</h2>
      <p>The Mempool.space data source implements the following methods:</p>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left">Method</th>
            <th className="border p-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">
              <code>getTransaction</code>
            </td>
            <td className="border p-2">Fetches transaction details by txid</td>
          </tr>
          <tr>
            <td className="border p-2">
              <code>getTransactionStatus</code>
            </td>
            <td className="border p-2">Gets the current status of a transaction</td>
          </tr>
          <tr>
            <td className="border p-2">
              <code>getAddressInfo</code>
            </td>
            <td className="border p-2">Retrieves information about a Bitcoin address</td>
          </tr>
          <tr>
            <td className="border p-2">
              <code>estimateFee</code>
            </td>
            <td className="border p-2">Estimates the fee for a transaction</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-2xl font-bold mt-8 mb-4">Example Usage</h2>
      <p>Here's an example of how to use the Mempool.space data source to track a transaction:</p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useEffect, useState } from 'react'

function TransactionTracker({ txid }) {
  const { client } = useLaserEyes()
  const [txInfo, setTxInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTransaction() {
      try {
        setLoading(true)
        const transaction = await client.getTransaction(txid)
        setTxInfo(transaction)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [txid, client])

  if (loading) return <div>Loading transaction...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h3>Transaction: {txid}</h3>
      <p>Status: {txInfo.status}</p>
      <p>Confirmations: {txInfo.confirmations}</p>
      <p>Fee: {txInfo.fee} sats</p>
    </div>
  )
}`}</code>
      </pre>

      <h2 className="text-2xl font-bold mt-8 mb-4">Rate Limiting</h2>
      <p>
        Be aware that the public Mempool.space API has rate limits. For production applications with high traffic,
        consider:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Implementing proper caching strategies</li>
        <li>Running your own Mempool.space instance</li>
        <li>Using multiple data sources for redundancy</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Advanced Configuration</h2>
      <p>For advanced use cases, you can customize the Mempool.space data source:</p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`new MempoolSpaceDataSource({
  network: 'mainnet',
  apiUrl: 'https://your-custom-mempool-instance.com/api',
  apiKey: 'your-api-key', // if you have one
  timeout: 10000, // request timeout in ms
  retries: 3, // number of retry attempts
  cacheTime: 60000, // cache time in ms
})`}</code>
      </pre>
    </div>
  )
}

