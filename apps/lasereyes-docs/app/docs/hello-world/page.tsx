"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function HelloWorldPage() {
  return (
    <>
      <Heading level={1}>Hello World Example</Heading>
      <p className="text-lg mb-4">
        Let's build a simple application with LaserEyes to connect a wallet, display the balance, and send a
        transaction.
      </p>

      <Heading level={2}>Complete Example</Heading>
      <p className="mb-6">This example demonstrates a basic React application that:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Connects to a Bitcoin wallet</li>
        <li>Displays the wallet address and balance</li>
        <li>Allows sending BTC to another address</li>
      </ul>

      <CodeBlock
        language="tsx"
        code={`import { useState } from 'react'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { 
  MAINNET, 
  UNISAT, 
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE
} from '@omnisat/lasereyes-core'

// Main App Component
export default function App() {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-8">LaserEyes Hello World</h1>
        <WalletDemo />
      </div>
    </LaserEyesProvider>
  )
}

// Wallet Demo Component
function WalletDemo() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address, 
    balance, 
    sendBTC 
  } = useLaserEyes()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txId, setTxId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Connect wallet function
  const connectWallet = async (provider) => {
    setError('')
    setLoading(true)
    try {
      await connect(provider)
    } catch (error) {
      setError(error.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  // Send BTC function
  const handleSendBTC = async () => {
    if (!recipient || !amount) {
      setError('Please enter recipient address and amount')
      return
    }
    
    setError('')
    setTxId('')
    setLoading(true)
    
    try {
      // Convert amount to satoshis (1 BTC = 100,000,000 satoshis)
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      
      // Send transaction
      const result = await sendBTC(recipient, satoshis)
      setTxId(result)
    } catch (error) {
      setError(error.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  // Get balance in BTC
  const formatBalance = () => {
    if (!balance) return '0'
    // Convert from satoshis to BTC
    return (Number(balance) / 100000000).toFixed(8)
  }

  return (
    <div className="w-full max-w-md p-6 bg-card border rounded-lg shadow-lg">
      {!connected ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => connectWallet(UNISAT)}
              className="p-2 bg-primary text-primary-foreground rounded"
              disabled={loading}
            >
              UniSat
            </button>
            <button 
              onClick={() => connectWallet(XVERSE)}
              className="p-2 bg-primary text-primary-foreground rounded"
              disabled={loading}
            >
              Xverse
            </button>
            <button 
              onClick={() => connectWallet(OYL)}
              className="p-2 bg-primary text-primary-foreground rounded"
              disabled={loading}
            >
              OYL
            </button>
            <button 
              onClick={() => connectWallet(LEATHER)}
              className="p-2 bg-primary text-primary-foreground rounded"
              disabled={loading}
            >
              Leather
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Wallet Connected</h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Address:</p>
              <p className="font-mono text-xs break-all bg-muted p-2 rounded">{address}</p>
              <p className="text-sm text-muted-foreground mt-4">Balance:</p>
              <p className="text-2xl font-bold">{formatBalance()} BTC</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Send Bitcoin</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-2 bg-muted border rounded"
                  placeholder="bc1q..."
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Amount (BTC)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 bg-muted border rounded"
                  placeholder="0.0001"
                  step="0.00000001"
                  min="0"
                />
              </div>
              <button
                onClick={handleSendBTC}
                className="w-full p-2 bg-primary text-primary-foreground rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Send BTC'}
              </button>
              {txId && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Transaction ID:</p>
                  <p className="font-mono text-xs break-all bg-muted p-2 rounded">{txId}</p>
                </div>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>
          
          <button
            onClick={disconnect}
            className="w-full p-2 bg-secondary text-secondary-foreground rounded"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}`}
        fileName="hello-world.tsx"
        copyButton={true}
      />

      <Heading level={2}>Step-by-Step Explanation</Heading>

      <Heading level={3}>1. Setting up the Provider</Heading>
      <p className="mb-4">
        First, we wrap our application with the <code>LaserEyesProvider</code> component:
      </p>
      <CodeBlock
        language="tsx"
        code={`<LaserEyesProvider config={{ network: MAINNET }}>
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 className="text-2xl font-bold mb-8">LaserEyes Hello World</h1>
    <WalletDemo />
  </div>
</LaserEyesProvider>`}
        copyButton={true}
      />

      <Heading level={3}>2. Connecting to a Wallet</Heading>
      <p className="mb-4">
        We use the <code>useLaserEyes</code> hook to access the methods directly:
      </p>
      <CodeBlock
        language="tsx"
        code={`const { connect } = useLaserEyes()

// Connect wallet function
const connectWallet = async (provider) => {
  setError('')
  setLoading(true)
  try {
    await connect(provider)
  } catch (error) {
    setError(error.message || 'Failed to connect wallet')
  } finally {
    setLoading(false)
  }
}`}
        copyButton={true}
      />

      <Heading level={3}>3. Reading Wallet Balance</Heading>
      <p className="mb-4">The wallet balance is available directly from the hook:</p>
      <CodeBlock
        language="tsx"
        code={`const { balance } = useLaserEyes()

// Get balance in BTC
const formatBalance = () => {
  if (!balance) return '0'
  // Convert from satoshis to BTC
  return (Number(balance) / 100000000).toFixed(8)
}`}
        copyButton={true}
      />

      <Heading level={3}>4. Sending a Transaction</Heading>
      <p className="mb-4">
        We can send BTC using the <code>sendBTC</code> method directly from the hook:
      </p>
      <CodeBlock
        language="tsx"
        code={`const { sendBTC } = useLaserEyes()

// Send BTC function
const handleSendBTC = async () => {
  if (!recipient || !amount) {
    setError('Please enter recipient address and amount')
    return
  }
  
  setError('')
  setTxId('')
  setLoading(true)
  
  try {
    // Convert amount to satoshis (1 BTC = 100,000,000 satoshis)
    const satoshis = Math.floor(parseFloat(amount) * 100000000)
    
    // Send transaction
    const result = await sendBTC(recipient, satoshis)
    setTxId(result)
  } catch (error) {
    setError(error.message || 'Transaction failed')
  } finally {
    setLoading(false)
  }
}`}
        copyButton={true}
      />

      <WarningBox title="Testing Transactions" className="mt-6 mb-6">
        When testing transactions, it's recommended to use a testnet network to avoid using real BTC. You can configure
        LaserEyes to use testnet by setting <code>network: TESTNET</code> in the provider config.
      </WarningBox>

      <Heading level={2}>Working with Inscriptions</Heading>
      <p className="mb-6">
        LaserEyes also supports working with Bitcoin Ordinals and inscriptions. Here's a simple example of how to list
        inscriptions:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useState, useEffect } from 'react'
import { useLaserEyes } from '@omnisat/lasereyes-react'

function InscriptionsList() {
  const { connected, getInscriptions } = useLaserEyes()
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch inscriptions when wallet is connected
  useEffect(() => {
    if (connected) {
      fetchInscriptions()
    } else {
      setInscriptions([])
    }
  }, [connected])

  const fetchInscriptions = async () => {
    setLoading(true)
    try {
      const result = await getInscriptions()
      setInscriptions(result || [])
    } catch (error) {
      console.error('Failed to fetch inscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return <p>Connect your wallet to view inscriptions</p>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Inscriptions</h2>
      {loading ? (
        <p>Loading inscriptions...</p>
      ) : inscriptions.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {inscriptions.map((inscription) => (
            <div key={inscription.id} className="border rounded p-2">
              <div className="aspect-square bg-muted rounded overflow-hidden">
                {inscription.contentType.startsWith('image/') ? (
                  <img 
                    src={inscription.content || "/placeholder.svg"} 
                    alt={\`Inscription #\${inscription.number}\`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-xs text-center p-2">
                      {inscription.contentType}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs mt-2 truncate">ID: {inscription.id}</p>
              <p className="text-xs"># {inscription.number}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No inscriptions found</p>
      )}
    </div>
  )
}`}
        fileName="inscriptions-list.tsx"
        copyButton={true}
      />

      <Heading level={2}>Next Steps</Heading>
      <p className="mb-6">
        Now that you've built your first application with LaserEyes, you can explore more advanced features:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/wallet-connection" className="text-primary hover:underline">
            Wallet Connection
          </Link>{" "}
          - Learn more about connecting to different wallets
        </li>
        <li>
          <Link href="/docs/basic-transactions" className="text-primary hover:underline">
            Basic Transactions
          </Link>{" "}
          - Explore more transaction types
        </li>
        <li>
          <Link href="/docs/inscriptions" className="text-primary hover:underline">
            Working with Inscriptions
          </Link>{" "}
          - Learn how to create and transfer inscriptions
        </li>
        <li>
          <Link href="/docs/brc20" className="text-primary hover:underline">
            BRC-20 Operations
          </Link>{" "}
          - Work with BRC-20 tokens
        </li>
      </ul>
    </>
  )
}

