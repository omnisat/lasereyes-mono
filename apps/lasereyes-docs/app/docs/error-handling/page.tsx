"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function ErrorHandlingPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Error Handling
      </Heading>
      <p className="text-lg mb-4">
        Proper error handling is essential when working with Bitcoin wallets and blockchain data. This page explains how
        to handle errors in LaserEyes and provides best practices for creating a robust user experience.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Common Error Types
      </Heading>
      <p className="mb-6">LaserEyes can throw various types of errors, which can be categorized as follows:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Error Category</th>
              <th className="border p-2 text-left">Error Codes</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Wallet Connection Errors</td>
              <td className="border p-2">
                <code>WALLET_NOT_FOUND</code>
                <br />
                <code>USER_REJECTED</code>
                <br />
                <code>NETWORK_MISMATCH</code>
              </td>
              <td className="border p-2">Errors related to connecting to a wallet</td>
            </tr>
            <tr>
              <td className="border p-2">Transaction Errors</td>
              <td className="border p-2">
                <code>INSUFFICIENT_FUNDS</code>
                <br />
                <code>INVALID_ADDRESS</code>
                <br />
                <code>TRANSACTION_FAILED</code>
              </td>
              <td className="border p-2">Errors related to creating or sending transactions</td>
            </tr>
            <tr>
              <td className="border p-2">Data Provider Errors</td>
              <td className="border p-2">
                <code>PROVIDER_ERROR</code>
                <br />
                <code>RATE_LIMIT_EXCEEDED</code>
                <br />
                <code>NETWORK_ERROR</code>
              </td>
              <td className="border p-2">Errors related to fetching data from providers</td>
            </tr>
            <tr>
              <td className="border p-2">Validation Errors</td>
              <td className="border p-2">
                <code>INVALID_PARAMETER</code>
                <br />
                <code>INVALID_FORMAT</code>
              </td>
              <td className="border p-2">Errors related to invalid input parameters</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Basic Error Handling
      </Heading>
      <p className="mb-6">
        The simplest way to handle errors is to use try-catch blocks around LaserEyes method calls:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function WalletConnect() {
  const { connect } = useLaserEyes()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setError(null)
    setLoading(true)
    
    try {
      await connect('UNISAT')
      // Connection successful
    } catch (err) {
      // Handle the error
      setError(err.message || 'Failed to connect wallet')
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
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}
    </div>
  )
}`}
        fileName="basic-error-handling.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Error Code Handling
      </Heading>
      <p className="mb-6">For more specific error handling, you can check the error code:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function WalletConnect() {
  const { connect } = useLaserEyes()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setError(null)
    setLoading(true)
    
    try {
      await connect('UNISAT')
      // Connection successful
    } catch (err) {
      // Handle specific error types
      if (err.code === 'WALLET_NOT_FOUND') {
        setError('UniSat wallet extension not found. Please install it first.')
      } else if (err.code === 'USER_REJECTED') {
        setError('Connection rejected by user.')
      } else if (err.code === 'NETWORK_MISMATCH') {
        setError('Wallet is on a different network. Please switch to the correct network.')
      } else {
        setError(err.message || 'Failed to connect wallet')
      }
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
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}
    </div>
  )
}`}
        fileName="error-code-handling.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Transaction Error Handling
      </Heading>
      <p className="mb-6">When sending transactions, it's important to handle various error scenarios:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function SendBTC() {
  const { sendBTC } = useLaserEyes()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [txid, setTxid] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!recipient || !amount) {
      setError('Please enter recipient address and amount')
      return
    }
    
    setError(null)
    setTxid(null)
    setLoading(true)
    
    try {
      // Convert amount to satoshis
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      
      // Send transaction
      const result = await sendBTC(recipient, satoshis)
      setTxid(result)
    } catch (err) {
      // Handle specific error types
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for this transaction.')
      } else if (err.code === 'INVALID_ADDRESS') {
        setError('Invalid Bitcoin address. Please check and try again.')
      } else if (err.code === 'USER_REJECTED') {
        setError('Transaction rejected by user.')
      } else if (err.code === 'TRANSACTION_FAILED') {
        setError(\`Transaction failed: \${err.message}\`)
      } else {
        setError(err.message || 'Transaction failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Form inputs */}
      <div>
        <label>Recipient:</label>
        <input 
          type="text" 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
        />
      </div>
      <div>
        <label>Amount (BTC):</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          step="0.00000001" 
        />
      </div>
      
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send BTC'}
      </button>
      
      {error && (
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}
      
      {txid && (
        <div className="text-green-500 mt-2">
          Transaction sent! TXID: {txid}
        </div>
      )}
    </div>
  )
}`}
        fileName="transaction-error-handling.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Data Provider Error Handling
      </Heading>
      <p className="mb-6">When fetching data from providers, you should handle network errors and rate limits:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState, useEffect } from 'react'

function InscriptionsList() {
  const { connected, getInscriptions } = useLaserEyes()
  const [inscriptions, setInscriptions] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (connected) {
      fetchInscriptions()
    }
  }, [connected])

  const fetchInscriptions = async () => {
    setError(null)
    setLoading(true)
    
    try {
      const result = await getInscriptions()
      setInscriptions(result || [])
    } catch (err) {
      // Handle specific error types
      if (err.code === 'PROVIDER_ERROR') {
        setError('Data provider error. Please try again later.')
      } else if (err.code === 'RATE_LIMIT_EXCEEDED') {
        setError('Rate limit exceeded. Please try again in a few minutes.')
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(err.message || 'Failed to fetch inscriptions')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Your Inscriptions</h2>
      
      <button onClick={fetchInscriptions} disabled={loading || !connected}>
        {loading ? 'Loading...' : 'Refresh Inscriptions'}
      </button>
      
      {error && (
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}
      
      {!error && inscriptions.length === 0 && !loading && (
        <div className="mt-2">No inscriptions found</div>
      )}
      
      {inscriptions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {inscriptions.map((inscription) => (
            <div key={inscription.id} className="border rounded p-2">
              {/* Inscription display */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}`}
        fileName="data-provider-error-handling.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Creating a Custom Error Handler
      </Heading>
      <p className="mb-6">For more complex applications, you might want to create a custom error handler:</p>
      <CodeBlock
        language="typescript"
        code={`// Define error handler function
function handleLaserEyesError(error: any, context: string = 'operation'): string {
  // Check for specific error codes
  if (error.code === 'WALLET_NOT_FOUND') {
    return 'Wallet extension not found. Please install it first.'
  } else if (error.code === 'USER_REJECTED') {
    return 'Action rejected by user.'
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for this transaction.'
  } else if (error.code === 'INVALID_ADDRESS') {
    return 'Invalid Bitcoin address. Please check and try again.'
  } else if (error.code === 'PROVIDER_ERROR') {
    return 'Data provider error. Please try again later.'
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return 'Rate limit exceeded. Please try again in a few minutes.'
  } else if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection and try again.'
  }
  
  // For unknown errors, include the context
  return \`Failed to \${context}: \${error.message || 'Unknown error'}\`
}

// Usage in components
function WalletComponent() {
  const { connect, sendBTC } = useLaserEyes()
  const [error, setError] = useState<string | null>(null)
  
  const handleConnect = async () => {
    try {
      await connect('UNISAT')
    } catch (err) {
      setError(handleLaserEyesError(err, 'connect wallet'))
    }
  }
  
  const handleSend = async (recipient: string, amount: string) => {
    try {
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      await sendBTC(recipient, satoshis)
    } catch (err) {
      setError(handleLaserEyesError(err, 'send transaction'))
    }
  }
  
  // Component JSX
}`}
        fileName="custom-error-handler.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Error Handling with React Context
      </Heading>
      <p className="mb-6">For larger applications, you might want to create a global error handling context:</p>
      <CodeBlock
        language="typescript"
        code={`// ErrorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

type ErrorContextType = {
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void
  handleLaserEyesError: (error: any, context?: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null)
  
  const clearError = () => setError(null)
  
  const handleLaserEyesError = (error: any, context: string = 'operation') => {
    // Similar to the previous error handler function
    let errorMessage = 'Unknown error'
    
    if (error.code === 'WALLET_NOT_FOUND') {
      errorMessage = 'Wallet extension not found. Please install it first.'
    } else if (error.code === 'USER_REJECTED') {
      errorMessage = 'Action rejected by user.'
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds for this transaction.'
    } else if (error.code === 'INVALID_ADDRESS') {
      errorMessage = 'Invalid Bitcoin address. Please check and try again.'
    } else if (error.code === 'PROVIDER_ERROR') {
      errorMessage = 'Data provider error. Please try again later.'
    } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
      errorMessage = 'Rate limit exceeded. Please try again in a few minutes.'
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Network error. Please check your connection and try again.'
    } else {
      errorMessage = \`Failed to \${context}: \${error.message || 'Unknown error'}\`
    }
    
    setError(errorMessage)
    return errorMessage
  }
  
  return (
    <ErrorContext.Provider value={{ error, setError, clearError, handleLaserEyesError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

// Usage in App
function App() {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      <ErrorProvider>
        <YourApp />
      </ErrorProvider>
    </LaserEyesProvider>
  )
}

// Usage in components
function WalletComponent() {
  const { connect } = useLaserEyes()
  const { error, clearError, handleLaserEyesError } = useError()
  
  const handleConnect = async () => {
    clearError()
    try {
      await connect('UNISAT')
    } catch (err) {
      handleLaserEyesError(err, 'connect wallet')
    }
  }
  
  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet</button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}`}
        fileName="error-context.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Error Recovery Strategies
      </Heading>
      <p className="mb-6">In addition to handling errors, you should implement recovery strategies:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Retry Logic</strong>: For transient errors like network issues, implement retry logic with exponential
          backoff
        </li>
        <li>
          <strong>Fallback Providers</strong>: If one data provider fails, try another
        </li>
        <li>
          <strong>Graceful Degradation</strong>: If advanced features aren't available, fall back to basic functionality
        </li>
        <li>
          <strong>Clear User Guidance</strong>: Provide clear instructions to users on how to resolve issues
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`// Retry logic example
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0
  let delay = initialDelay
  
  while (true) {
    try {
      return await fetchFn()
    } catch (error) {
      // Don't retry if it's not a retryable error
      if (
        error.code === 'USER_REJECTED' ||
        error.code === 'INVALID_ADDRESS' ||
        error.code === 'INSUFFICIENT_FUNDS'
      ) {
        throw error
      }
      
      // If we've reached max retries, throw the error
      if (retries >= maxRetries) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Increase the delay for next retry (exponential backoff)
      delay *= 2
      retries++
    }
  }
}`}
        fileName="retry-logic.ts"
        copyButton={true}
      />

      <WarningBox title="Error Handling in Production" className="mt-6 mb-6">
        In production applications, it's important to implement comprehensive error handling and monitoring. Consider
        using error tracking services like Sentry or LogRocket to capture and analyze errors in your application.
      </WarningBox>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">Now that you understand error handling in LaserEyes, you can explore related topics:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/security" className="text-primary hover:underline">
            Security Considerations
          </Link>{" "}
          - Learn about security best practices
        </li>
        <li>
          <Link href="/docs/performance" className="text-primary hover:underline">
            Performance Optimization
          </Link>{" "}
          - Optimize your application's performance
        </li>
        <li>
          <Link href="/docs/testing" className="text-primary hover:underline">
            Testing
          </Link>{" "}
          - Learn how to test your LaserEyes integration
        </li>
        <li>
          <Link href="/docs/common-issues" className="text-primary hover:underline">
            Common Issues
          </Link>{" "}
          - Troubleshoot common problems
        </li>
      </ul>
    </>
  )
}

