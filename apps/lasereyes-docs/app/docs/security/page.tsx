"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function SecurityPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Security Considerations
      </Heading>
      <p className="text-lg mb-4">
        Security is paramount when working with Bitcoin wallets and transactions. This page outlines important security
        considerations and best practices for using LaserEyes in your applications.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Key Security Principles
      </Heading>
      <p className="mb-6">
        When building Bitcoin applications with LaserEyes, keep these key security principles in mind:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Least Privilege</strong>: Only request the permissions and access you need
        </li>
        <li>
          <strong>Defense in Depth</strong>: Implement multiple layers of security controls
        </li>
        <li>
          <strong>Secure by Default</strong>: Start with secure configurations and practices
        </li>
        <li>
          <strong>User Consent</strong>: Always obtain explicit user consent for sensitive operations
        </li>
        <li>
          <strong>Transparency</strong>: Be clear about what your application is doing
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Wallet Connection Security
      </Heading>
      <p className="mb-6">Connecting to a user's wallet is a sensitive operation that requires careful handling:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Connect only when necessary</strong>: Don't request wallet connection until it's needed
        </li>
        <li>
          <strong>Explain why you need access</strong>: Clearly communicate why your app needs wallet access
        </li>
        <li>
          <strong>Respect user rejection</strong>: If a user rejects the connection request, don't repeatedly prompt
          them
        </li>
        <li>
          <strong>Disconnect when done</strong>: Disconnect from the wallet when no longer needed
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`// Good practice: Connect only when necessary
function SendBitcoinButton() {
  const { connect, connected } = useLaserEyes()
  
  const handleClick = async () => {
    // Only connect if not already connected
    if (!connected) {
      // Explain why you need access
      const userConfirmed = window.confirm(
        'This action requires connecting to your Bitcoin wallet to send a transaction. Do you want to connect?'
      )
      
      if (!userConfirmed) {
        // Respect user rejection
        return
      }
      
      try {
        await connect('UNISAT')
      } catch (error) {
        console.error('Connection failed:', error)
        return
      }
    }
    
    // Proceed with the transaction
    // ...
  }
  
  return <button onClick={handleClick}>Send Bitcoin</button>
}`}
        fileName="secure-connection.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Transaction Security
      </Heading>
      <p className="mb-6">Transactions involve moving funds, so they require extra security precautions:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Validate inputs</strong>: Always validate addresses, amounts, and other transaction parameters
        </li>
        <li>
          <strong>Confirm transactions</strong>: Show transaction details and ask for confirmation before sending
        </li>
        <li>
          <strong>Prevent double submissions</strong>: Disable submit buttons during transaction processing
        </li>
        <li>
          <strong>Verify transaction success</strong>: Check that transactions are confirmed on the blockchain
        </li>
        <li>
          <strong>Implement spending limits</strong>: Consider adding spending limits for additional security
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function SecureTransactionForm() {
  const { sendBTC, address } = useLaserEyes()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txid, setTxid] = useState<string | null>(null)
  
  // Validate Bitcoin address
  const isValidAddress = (addr: string) => {
    // Basic validation - in production, use a proper Bitcoin address validator
    return addr.startsWith('bc1') || addr.startsWith('1') || addr.startsWith('3')
  }
  
  // Validate amount
  const isValidAmount = (amt: string) => {
    const num = parseFloat(amt)
    return !isNaN(num) && num > 0 && num <= 100 // Example spending limit of 100 BTC
  }
  
  const handleSubmit = () => {
    // Reset states
    setError(null)
    setTxid(null)
    
    // Validate inputs
    if (!isValidAddress(recipient)) {
      setError('Invalid Bitcoin address')
      return
    }
    
    if (!isValidAmount(amount)) {
      setError('Invalid amount')
      return
    }
    
    // Show confirmation dialog
    setConfirming(true)
  }
  
  const handleConfirm = async () => {
    setConfirming(false)
    setSending(true)
    
    try {
      // Convert amount to satoshis
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      
      // Send transaction
      const result = await sendBTC(recipient, satoshis)
      setTxid(result)
      
      // Reset form
      setRecipient('')
      setAmount('')
    } catch (error) {
      setError(error.message || 'Transaction failed')
    } finally {
      setSending(false)
    }
  }
  
  const handleCancel = () => {
    setConfirming(false)
  }
  
  return (
    <div>
      <h2>Send Bitcoin</h2>
      
      <div>
        <label>From:</label>
        <div>{address || 'Not connected'}</div>
      </div>
      
      <div>
        <label>To:</label>
        <input 
          type="text" 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
          disabled={confirming || sending}
        />
      </div>
      
      <div>
        <label>Amount (BTC):</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          step="0.00000001" 
          disabled={confirming || sending}
        />
      </div>
      
      {!confirming && !sending && (
        <button onClick={handleSubmit}>Send</button>
      )}
      
      {confirming && (
        <div>
          <h3>Confirm Transaction</h3>
          <p>You are about to send {amount} BTC to {recipient}</p>
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
      
      {sending && <p>Sending transaction...</p>}
      
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {txid && (
        <p className="text-green-500">
          Transaction sent! TXID: {txid}
        </p>
      )}
    </div>
  )
}`}
        fileName="secure-transaction.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        API Key Security
      </Heading>
      <p className="mb-6">LaserEyes uses API keys for data providers like Maestro and Sandshrew. Protect these keys:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Never expose API keys in client-side code</strong>: Use environment variables and server-side code
        </li>
        <li>
          <strong>Use appropriate scopes</strong>: Limit API key permissions to only what's needed
        </li>
        <li>
          <strong>Rotate keys regularly</strong>: Change API keys periodically
        </li>
        <li>
          <strong>Monitor usage</strong>: Watch for unusual activity that might indicate a compromised key
        </li>
      </ul>

      <WarningBox title="API Key Security Warning" className="mt-6 mb-6">
        Never include API keys directly in your client-side code. Always use environment variables and server-side code
        to protect sensitive credentials.
      </WarningBox>

      <CodeBlock
        language="typescript"
        code={`// BAD PRACTICE - DO NOT DO THIS
const config = {
  network: MAINNET,
  dataSources: {
    maestro: {
      apiKey: 'your-actual-api-key-here', // NEVER do this in client-side code
    }
  }
}

// GOOD PRACTICE - Use environment variables
// In Next.js, create a server component or API route
// pages/api/bitcoin-data.js
import { createConfig, MAINNET } from '@omnisat/lasereyes-core'

export default async function handler(req, res) {
  const config = createConfig({
    network: MAINNET,
    dataSources: {
      maestro: {
        apiKey: process.env.MAESTRO_API_KEY, // Safely use environment variable
      }
    }
  })
  
  // Use the config to fetch data server-side
  // ...
  
  res.status(200).json({ data })
}`}
        fileName="api-key-security.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Frontend Security
      </Heading>
      <p className="mb-6">Secure your frontend application to protect users:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Use HTTPS</strong>: Always serve your application over HTTPS
        </li>
        <li>
          <strong>Implement CSP</strong>: Use Content Security Policy to prevent XSS attacks
        </li>
        <li>
          <strong>Sanitize user inputs</strong>: Validate and sanitize all user inputs
        </li>
        <li>
          <strong>Prevent clickjacking</strong>: Use appropriate headers to prevent clickjacking
        </li>
        <li>
          <strong>Keep dependencies updated</strong>: Regularly update dependencies to patch security vulnerabilities
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Phishing Protection
      </Heading>
      <p className="mb-6">Help users avoid phishing attacks:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Use a consistent domain</strong>: Maintain a consistent domain for your application
        </li>
        <li>
          <strong>Educate users</strong>: Explain how to verify they're on the correct site
        </li>
        <li>
          <strong>Be transparent</strong>: Clearly explain what actions your app will take
        </li>
        <li>
          <strong>Use recognizable branding</strong>: Maintain consistent branding to help users identify your app
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Security Checklist
      </Heading>
      <p className="mb-6">Use this checklist to ensure your LaserEyes integration is secure:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Security Measure</th>
              <th className="border p-2 text-left">Implementation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2" rowSpan={4}>
                Wallet Connection
              </td>
              <td className="border p-2">Connect only when necessary</td>
              <td className="border p-2">Only request wallet connection when needed for a specific action</td>
            </tr>
            <tr>
              <td className="border p-2">Explain why you need access</td>
              <td className="border p-2">Provide clear messaging about why wallet access is needed</td>
            </tr>
            <tr>
              <td className="border p-2">Respect user rejection</td>
              <td className="border p-2">Don't repeatedly prompt for connection if rejected</td>
            </tr>
            <tr>
              <td className="border p-2">Disconnect when done</td>
              <td className="border p-2">Provide a disconnect option and disconnect when appropriate</td>
            </tr>
            <tr>
              <td className="border p-2" rowSpan={5}>
                Transactions
              </td>
              <td className="border p-2">Validate inputs</td>
              <td className="border p-2">Validate addresses, amounts, and other parameters</td>
            </tr>
            <tr>
              <td className="border p-2">Confirm transactions</td>
              <td className="border p-2">Show transaction details and ask for confirmation</td>
            </tr>
            <tr>
              <td className="border p-2">Prevent double submissions</td>
              <td className="border p-2">Disable submit buttons during processing</td>
            </tr>
            <tr>
              <td className="border p-2">Verify transaction success</td>
              <td className="border p-2">Check that transactions are confirmed</td>
            </tr>
            <tr>
              <td className="border p-2">Implement spending limits</td>
              <td className="border p-2">Add reasonable spending limits</td>
            </tr>
            <tr>
              <td className="border p-2" rowSpan={4}>
                API Keys
              </td>
              <td className="border p-2">Never expose in client-side code</td>
              <td className="border p-2">Use environment variables and server-side code</td>
            </tr>
            <tr>
              <td className="border p-2">Use appropriate scopes</td>
              <td className="border p-2">Limit API key permissions</td>
            </tr>
            <tr>
              <td className="border p-2">Rotate keys regularly</td>
              <td className="border p-2">Change API keys periodically</td>
            </tr>
            <tr>
              <td className="border p-2">Monitor usage</td>
              <td className="border p-2">Watch for unusual activity</td>
            </tr>
            <tr>
              <td className="border p-2" rowSpan={5}>
                Frontend
              </td>
              <td className="border p-2">Use HTTPS</td>
              <td className="border p-2">Serve application over HTTPS</td>
            </tr>
            <tr>
              <td className="border p-2">Implement CSP</td>
              <td className="border p-2">Use Content Security Policy</td>
            </tr>
            <tr>
              <td className="border p-2">Sanitize user inputs</td>
              <td className="border p-2">Validate and sanitize all inputs</td>
            </tr>
            <tr>
              <td className="border p-2">Prevent clickjacking</td>
              <td className="border p-2">Use appropriate headers</td>
            </tr>
            <tr>
              <td className="border p-2">Keep dependencies updated</td>
              <td className="border p-2">Regularly update dependencies</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand security considerations for LaserEyes, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/error-handling" className="text-primary hover:underline">
            Error Handling
          </Link>{" "}
          - Learn how to handle errors securely
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
          <Link href="/docs/best-practices" className="text-primary hover:underline">
            Best Practices
          </Link>{" "}
          - General best practices for LaserEyes
        </li>
      </ul>
    </>
  )
}

