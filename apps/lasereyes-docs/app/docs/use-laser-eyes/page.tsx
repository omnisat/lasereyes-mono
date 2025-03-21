"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function UseLaserEyesPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        useLaserEyes Hook
      </Heading>
      <p className="text-lg mb-4">
        The <code>useLaserEyes</code> hook is the primary way to interact with LaserEyes in your React components. It
        provides access to wallet connection state, methods for sending transactions, and other Bitcoin-related
        functionality.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Basic Usage
      </Heading>
      <p className="mb-6">
        To use the <code>useLaserEyes</code> hook, your component must be a descendant of a{" "}
        <code>LaserEyesProvider</code>:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { UNISAT } from '@omnisat/lasereyes-core'

function WalletConnect() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address 
  } = useLaserEyes()

  const handleConnect = async () => {
    try {
      await connect(UNISAT)
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  )
}`}
        fileName="wallet-connect.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Available Properties and Methods
      </Heading>
      <p className="mb-6">
        The <code>useLaserEyes</code> hook provides a rich set of properties and methods:
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Connection State
      </Heading>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'

function ConnectionState() {
  const { 
    connected,      // Boolean indicating if a wallet is connected
    connecting,     // Boolean indicating if a connection is in progress
    address,        // Connected wallet address
    publicKey,      // Connected wallet public key
    balance,        // Wallet balance in satoshis
    provider,       // Current wallet provider (e.g., UNISAT, XVERSE)
    network,        // Current network (e.g., MAINNET, TESTNET)
  } = useLaserEyes()

  return (
    <div>
      <h2>Connection State</h2>
      <p>Connected: {connected ? 'Yes' : 'No'}</p>
      <p>Connecting: {connecting ? 'Yes' : 'No'}</p>
      {connected && (
        <>
          <p>Address: {address}</p>
          <p>Public Key: {publicKey}</p>
          <p>Balance: {balance} satoshis</p>
          <p>Provider: {provider}</p>
          <p>Network: {network}</p>
        </>
      )}
    </div>
  )
}`}
        fileName="connection-state.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Connection Methods
      </Heading>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { UNISAT, XVERSE, OYL } from '@omnisat/lasereyes-core'

function ConnectionMethods() {
  const { 
    connect,        // Connect to a wallet
    disconnect,     // Disconnect from the current wallet
    switchProvider, // Switch to a different wallet provider
  } = useLaserEyes()

  return (
    <div>
      <h2>Connect to Wallet</h2>
      <div className="flex gap-2">
        <button onClick={() => connect(UNISAT)}>Connect UniSat</button>
        <button onClick={() => connect(XVERSE)}>Connect Xverse</button>
        <button onClick={() => connect(OYL)}>Connect OYL</button>
      </div>
      
      <h2>Switch Provider</h2>
      <div className="flex gap-2">
        <button onClick={() => switchProvider(UNISAT)}>Switch to UniSat</button>
        <button onClick={() => switchProvider(XVERSE)}>Switch to Xverse</button>
      </div>
      
      <h2>Disconnect</h2>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  )
}`}
        fileName="connection-methods.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Transaction Methods
      </Heading>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function TransactionMethods() {
  const { 
    sendBTC,           // Send BTC to an address
    signMessage,       // Sign a message with the wallet
    signPsbt,          // Sign a PSBT (Partially Signed Bitcoin Transaction)
    pushPsbt,          // Broadcast a signed PSBT
    inscribe,          // Create an inscription
    sendInscriptions,  // Send inscriptions to an address
  } = useLaserEyes()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('Hello, Bitcoin!')
  const [signature, setSignature] = useState('')

  const handleSendBTC = async () => {
    try {
      // Convert amount to satoshis
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      const txid = await sendBTC(recipient, satoshis)
      alert(\`Transaction sent! TXID: \${txid}\`)
    } catch (error) {
      console.error('Failed to send BTC:', error)
    }
  }

  const handleSignMessage = async () => {
    try {
      const sig = await signMessage(message)
      setSignature(sig)
    } catch (error) {
      console.error('Failed to sign message:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Send BTC</h2>
        <input 
          type="text" 
          placeholder="Recipient address" 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Amount (BTC)" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          step="0.00000001" 
        />
        <button onClick={handleSendBTC}>Send BTC</button>
      </div>
      
      <div>
        <h2>Sign Message</h2>
        <input 
          type="text" 
          placeholder="Message to sign" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
        />
        <button onClick={handleSignMessage}>Sign Message</button>
        {signature && (
          <div>
            <p>Signature:</p>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">{signature}</pre>
          </div>
        )}
      </div>
    </div>
  )
}`}
        fileName="transaction-methods.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Data Retrieval Methods
      </Heading>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useEffect, useState } from 'react'

function DataRetrievalMethods() {
  const { 
    getUtxos,           // Get UTXOs for the connected address
    getInscriptions,    // Get inscriptions for the connected address
    getMetaBalances,    // Get token balances (BRC-20, Runes)
    estimateFee,        // Estimate transaction fee
    client,             // Access to the underlying LaserEyes client
  } = useLaserEyes()

  const [utxos, setUtxos] = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [tokens, setTokens] = useState([])
  const [feeRate, setFeeRate] = useState(0)

  const loadData = async () => {
    try {
      // Get UTXOs
      const utxoData = await getUtxos()
      setUtxos(utxoData)
      
      // Get inscriptions
      const inscriptionData = await getInscriptions()
      setInscriptions(inscriptionData)
      
      // Get BRC-20 tokens
      const tokenData = await getMetaBalances('brc20')
      setTokens(tokenData)
      
      // Estimate fee for next block
      const fee = await estimateFee(1)
      setFeeRate(fee)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  // Advanced: Access the DataSource Manager directly
  const useDataSourceManager = async () => {
    const dataSourceManager = client.getDataSourceManager()
    const blockHeight = await dataSourceManager.getBlockHeight()
    console.log('Current block height:', blockHeight)
  }

  return (
    <div className="space-y-6">
      <button onClick={loadData}>Load Data</button>
      
      <div>
        <h2>UTXOs</h2>
        <pre className="bg-muted p-2 rounded text-xs overflow-auto">
          {JSON.stringify(utxos, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2>Inscriptions</h2>
        <p>Count: {inscriptions.length}</p>
      </div>
      
      <div>
        <h2>BRC-20 Tokens</h2>
        <p>Count: {tokens.length}</p>
      </div>
      
      <div>
        <h2>Fee Rate</h2>
        <p>{feeRate} sat/vB</p>
      </div>
    </div>
  )
}`}
        fileName="data-retrieval-methods.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Custom Hooks
      </Heading>
      <p className="mb-6">
        You can build custom hooks on top of <code>useLaserEyes</code> to encapsulate specific functionality:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState, useCallback } from 'react'

// Custom hook for working with BRC-20 tokens
export function useBRC20() {
  const { getMetaBalances, send, connected } = useLaserEyes()
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load tokens
  const loadTokens = useCallback(async () => {
    if (!connected) return
    
    try {
      setLoading(true)
      setError(null)
      const result = await getMetaBalances('brc20')
      setTokens(result || [])
    } catch (err) {
      setError(err.message || 'Failed to load tokens')
    } finally {
      setLoading(false)
    }
  }, [connected, getMetaBalances])

  // Send a token
  const sendToken = useCallback(async (ticker, amount, recipient) => {
    if (!connected) throw new Error('Wallet not connected')
    
    try {
      setLoading(true)
      setError(null)
      
      const txid = await send('brc20', {
        ticker,
        amount: Number(amount),
        toAddress: recipient,
      })
      
      return txid
    } catch (err) {
      setError(err.message || 'Failed to send token')
      throw err
    } finally {
      setLoading(false)
    }
  }, [connected, send])

  return {
    tokens,
    loading,
    error,
    loadTokens,
    sendToken,
  }
}

// Usage in a component
function BRC20TokensComponent() {
  const { tokens, loading, error, loadTokens, sendToken } = useBRC20()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState('')

  // Load tokens on mount
  useEffect(() => {
    loadTokens()
  }, [loadTokens])

  const handleSend = async () => {
    try {
      const txid = await sendToken(selectedToken, amount, recipient)
      alert(\`Token sent! TXID: \${txid}\`)
    } catch (error) {
      console.error('Failed to send token:', error)
    }
  }

  return (
    <div>
      <h2>BRC-20 Tokens</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          {/* Token selection and sending UI */}
        </div>
      )}
    </div>
  )
}`}
        fileName="custom-hooks.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Error Handling
      </Heading>
      <p className="mb-6">
        It's important to handle errors properly when using the <code>useLaserEyes</code> hook:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function ErrorHandlingExample() {
  const { connect, sendBTC } = useLaserEyes()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setLoading(true)
      setError(null)
      await connect('UNISAT')
    } catch (err) {
      // Handle specific error types
      if (err.code === 'WALLET_NOT_FOUND') {
        setError('UniSat wallet extension not found. Please install it first.')
      } else if (err.code === 'USER_REJECTED') {
        setError('Connection rejected by user.')
      } else {
        setError(err.message || 'Failed to connect wallet')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendBTC = async (recipient, amount) => {
    try {
      setLoading(true)
      setError(null)
      
      // Convert amount to satoshis
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      
      const txid = await sendBTC(recipient, satoshis)
      return txid
    } catch (err) {
      // Handle specific error types
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for this transaction.')
      } else if (err.code === 'INVALID_ADDRESS') {
        setError('Invalid Bitcoin address.')
      } else {
        setError(err.message || 'Transaction failed')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleConnect} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}`}
        fileName="error-handling.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        TypeScript Support
      </Heading>
      <p className="mb-6">
        The <code>useLaserEyes</code> hook provides comprehensive TypeScript types:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import type { UTXO, Inscription, BRC20Token, Rune } from '@omnisat/lasereyes-core'

function TypeScriptExample() {
  const { 
    // Connection state with types
    connected,      // boolean
    address,        // string
    balance,        // string (satoshis as string)
    
    // Methods with typed parameters and return values
    connect,        // (provider: string) => Promise<void>
    sendBTC,        // (recipient: string, amount: number, options?: SendOptions) => Promise<string>
    getUtxos,       // () => Promise<UTXO[]>
    getInscriptions,// () => Promise<Inscription[]>
    
    // Typed token operations
    getMetaBalances,// <T extends 'brc20' | 'runes'>(type: T) => Promise<T extends 'brc20' ? BRC20Token[] : Rune[]>
  } = useLaserEyes()

  // Type-safe usage examples
  const handleConnect = async (provider: string) => {
    await connect(provider)
  }

  const fetchAndProcessUtxos = async () => {
    const utxos: UTXO[] = await getUtxos()
    
    // Type-safe access to UTXO properties
    const totalValue = utxos.reduce((sum, utxo) => sum + Number(utxo.value), 0)
    return totalValue
  }

  const fetchTokens = async () => {
    // TypeScript knows this returns BRC20Token[]
    const brc20Tokens = await getMetaBalances('brc20')
    
    // TypeScript knows this returns Rune[]
    const runes = await getMetaBalances('runes')
    
    return { brc20Tokens, runes }
  }

  return <div>TypeScript Example</div>
}`}
        fileName="typescript-example.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">
        Here are some best practices for using the <code>useLaserEyes</code> hook:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Always check connection state</strong> before performing operations that require a connected wallet.
        </li>
        <li>
          <strong>Handle loading states</strong> to provide feedback to users during asynchronous operations.
        </li>
        <li>
          <strong>Implement proper error handling</strong> to gracefully handle failures and provide meaningful error
          messages.
        </li>
        <li>
          <strong>Use memoization</strong> for callback functions to prevent unnecessary re-renders.
        </li>
        <li>
          <strong>Create custom hooks</strong> for specific functionality to keep your components clean and focused.
        </li>
        <li>
          <strong>Leverage TypeScript</strong> for better type safety and developer experience.
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand how to use the <code>useLaserEyes</code> hook, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/laser-eyes-provider" className="text-primary hover:underline">
            LaserEyesProvider
          </Link>{" "}
          - Learn how to configure the LaserEyes provider
        </li>
        <li>
          <Link href="/docs/ui-components" className="text-primary hover:underline">
            UI Components
          </Link>{" "}
          - Explore the ready-to-use UI components provided by LaserEyes
        </li>
        <li>
          <Link href="/docs/transaction-types" className="text-primary hover:underline">
            Transaction Types
          </Link>{" "}
          - Learn about the different types of transactions supported by LaserEyes
        </li>
        <li>
          <Link href="/docs/datasource-system" className="text-primary hover:underline">
            DataSource System
          </Link>{" "}
          - Understand how LaserEyes interacts with Bitcoin data providers
        </li>
      </ul>
    </>
  )
}

