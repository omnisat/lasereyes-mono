"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function TransactionTypesPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Transaction Types
      </Heading>
      <p className="text-lg mb-4">
        LaserEyes supports various Bitcoin transaction types, from standard BTC transfers to Ordinals, BRC-20 tokens,
        and Runes. This page explains the different transaction types and how to work with them.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Overview of Bitcoin Transaction Types
      </Heading>
      <p className="mb-6">
        Bitcoin's transaction model has evolved beyond simple value transfers to support various asset types and
        protocols. LaserEyes provides a unified interface for working with these different transaction types.
      </p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Standard BTC Transactions
          </Heading>
          <p className="text-muted-foreground">
            Basic Bitcoin transactions that transfer BTC from one address to another. These use the standard UTXO model.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Ordinal Inscriptions
          </Heading>
          <p className="text-muted-foreground">
            Transactions that inscribe data directly onto satoshis, creating unique digital artifacts on the Bitcoin
            blockchain.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            BRC-20 Tokens
          </Heading>
          <p className="text-muted-foreground">
            A token standard built on Ordinals that enables fungible tokens on Bitcoin, similar to ERC-20 on Ethereum.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            Runes
          </Heading>
          <p className="text-muted-foreground">
            A newer token protocol for Bitcoin that uses OP_RETURN outputs to define and transfer fungible tokens.
          </p>
        </div>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Standard BTC Transactions
      </Heading>
      <p className="mb-6">
        Standard BTC transactions are the most basic type of Bitcoin transaction, transferring BTC from one address to
        another.
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Sending BTC
      </Heading>
      <p className="mb-4">LaserEyes provides a simple interface for sending BTC:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function SendBTC() {
  const { sendBTC, connected, address } = useLaserEyes()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txid, setTxid] = useState('')
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!connected || !recipient || !amount) return
    
    try {
      // Convert amount to satoshis (1 BTC = 100,000,000 satoshis)
      const satoshis = Math.floor(parseFloat(amount) * 100000000)
      
      // Send the transaction
      const result = await sendBTC(recipient, satoshis)
      setTxid(result)
      setError('')
    } catch (error) {
      setError(error.message || 'Transaction failed')
    }
  }

  return (
    <div>
      <h2>Send BTC</h2>
      <div>
        <label>Recipient Address:</label>
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
      <button onClick={handleSend} disabled={!connected}>Send</button>
      
      {txid && <p>Transaction sent! TXID: {txid}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}`}
        fileName="send-btc.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Advanced BTC Transactions
      </Heading>
      <p className="mb-4">
        For more complex BTC transactions, LaserEyes provides lower-level methods to work with PSBTs (Partially Signed
        Bitcoin Transactions):
      </p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'

function AdvancedTransaction() {
  const { signPsbt, pushPsbt, getUtxos, connected } = useLaserEyes()

  const createAndSendTransaction = async () => {
    if (!connected) return
    
    try {
      // 1. Get UTXOs for the current address
      const utxos = await getUtxos()
      
      // 2. Create a PSBT (using a library like bitcoinjs-lib)
      // This is a simplified example - you'd need to properly construct the PSBT
      const psbt = createPsbt(utxos, recipient, amount, change)
      
      // 3. Sign the PSBT with the connected wallet
      const signedPsbtHex = await signPsbt(psbt.toHex())
      
      // 4. Broadcast the signed transaction
      const txid = await pushPsbt(signedPsbtHex)
      
      console.log('Transaction sent:', txid)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  // Helper function to create a PSBT (simplified)
  function createPsbt(utxos, recipient, amount, change) {
    // In a real application, you would use bitcoinjs-lib or another library
    // to properly construct the PSBT with inputs, outputs, etc.
    // This is just a placeholder for demonstration purposes
    return {
      toHex: () => "dummy_psbt_hex_string"
    }
  }

  return (
    <div>
      <h2>Advanced Transaction</h2>
      <button onClick={createAndSendTransaction} disabled={!connected}>
        Create and Send Transaction
      </button>
    </div>
  )
}`}
        fileName="advanced-transaction.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Ordinal Inscriptions
      </Heading>
      <p className="mb-6">
        Ordinal inscriptions allow you to inscribe data directly onto satoshis, creating unique digital artifacts on the
        Bitcoin blockchain.
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Creating Inscriptions
      </Heading>
      <p className="mb-4">LaserEyes provides methods to create new inscriptions:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function CreateInscription() {
  const { inscribe, connected } = useLaserEyes()
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('text/plain')
  const [txid, setTxid] = useState('')
  const [error, setError] = useState('')

  const handleInscribe = async () => {
    if (!connected || !content) return
    
    try {
      // Convert content to base64
      const contentBase64 = Buffer.from(content).toString('base64')
      
      // Create the inscription
      const result = await inscribe(contentBase64, contentType)
      setTxid(result)
      setError('')
    } catch (error) {
      setError(error.message || 'Inscription failed')
    }
  }

  return (
    <div>
      <h2>Create Inscription</h2>
      <div>
        <label>Content Type:</label>
        <select 
          value={contentType} 
          onChange={(e) => setContentType(e.target.value)}
        >
          <option value="text/plain">Text</option>
          <option value="text/html">HTML</option>
          <option value="image/png">PNG Image (base64)</option>
          <option value="image/jpeg">JPEG Image (base64)</option>
          <option value="application/json">JSON</option>
        </select>
      </div>
      <div>
        <label>Content:</label>
        <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          rows={5}
        />
      </div>
      <button onClick={handleInscribe} disabled={!connected}>
        Create Inscription
      </button>
      
      {txid && <p>Inscription created! TXID: {txid}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}`}
        fileName="create-inscription.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Transferring Inscriptions
      </Heading>
      <p className="mb-4">You can transfer inscriptions to another address:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState, useEffect } from 'react'

function TransferInscription() {
  const { getInscriptions, sendInscriptions, connected } = useLaserEyes()
  const [inscriptions, setInscriptions] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [recipient, setRecipient] = useState('')
  const [txid, setTxid] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load inscriptions when connected
  useEffect(() => {
    if (connected) {
      loadInscriptions()
    } else {
      setInscriptions([])
    }
  }, [connected])

  const loadInscriptions = async () => {
    try {
      setLoading(true)
      const result = await getInscriptions()
      setInscriptions(result || [])
    } catch (error) {
      console.error('Failed to load inscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleInscription = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleTransfer = async () => {
    if (!connected || selectedIds.length === 0 || !recipient) return
    
    try {
      setLoading(true)
      const result = await sendInscriptions(selectedIds, recipient)
      setTxid(result)
      setError('')
      
      // Reset selection
      setSelectedIds([])
      
      // Reload inscriptions after a short delay
      setTimeout(loadInscriptions, 2000)
    } catch (error) {
      setError(error.message || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Transfer Inscriptions</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : inscriptions.length > 0 ? (
        <div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {inscriptions.map(insc => (
              <div 
                key={insc.id} 
                className={\`border p-2 cursor-pointer \${
                  selectedIds.includes(insc.id) ? 'border-primary' : ''
                }\`}
                onClick={() => toggleInscription(insc.id)}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {insc.contentType?.startsWith('image/') ? (
                    <img 
                      src={insc.content || "/placeholder.svg"}
                      alt={\`Inscription #\${insc.number}\`}
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <span className="text-xs">{insc.contentType}</span>
                  )}
                </div>
                <p className="text-xs mt-1 truncate">#{insc.number}</p>
              </div>
            ))}
          </div>
          
          <div>
            <label>Recipient Address:</label>
            <input 
              type="text" 
              value={recipient} 
              onChange={(e) => setRecipient(e.target.value)} 
            />
          </div>
          
          <button 
            onClick={handleTransfer}
            disabled={selectedIds.length === 0 || !recipient || loading}
          >
            Transfer {selectedIds.length} Inscription(s)
          </button>
        </div>
      ) : (
        <p>No inscriptions found</p>
      )}
      
      {txid && <p>Inscriptions transferred! TXID: {txid}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}`}
        fileName="transfer-inscription.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        BRC-20 Tokens
      </Heading>
      <p className="mb-6">
        BRC-20 is a token standard built on Ordinals that enables fungible tokens on Bitcoin, similar to ERC-20 on
        Ethereum.
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Working with BRC-20 Tokens
      </Heading>
      <p className="mb-4">LaserEyes provides methods to interact with BRC-20 tokens:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState, useEffect } from 'react'

function BRC20Tokens() {
  const { getMetaBalances, send, connected } = useLaserEyes()
  const [tokens, setTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txid, setTxid] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load tokens when connected
  useEffect(() => {
    if (connected) {
      loadTokens()
    } else {
      setTokens([])
    }
  }, [connected])

  const loadTokens = async () => {
    try {
      setLoading(true)
      const result = await getMetaBalances('brc20')
      setTokens(result || [])
    } catch (error) {
      console.error('Failed to load BRC-20 tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!connected || !selectedToken || !recipient || !amount) return
    
    try {
      setLoading(true)
      
      // Send the BRC-20 token
      const result = await send('brc20', {
        ticker: selectedToken.ticker,
        amount: Number.parseFloat(amount),
        toAddress: recipient,
      })
      
      setTxid(result)
      setError('')
      
      // Reset form
      setAmount('')
      setRecipient('')
      
      // Reload tokens after a short delay
      setTimeout(loadTokens, 2000)
    } catch (error) {
      setError(error.message || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>BRC-20 Tokens</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : tokens.length > 0 ? (
        <div>
          <div className="mb-4">
            <label>Select Token:</label>
            <select
              value={selectedToken?.ticker || ''}
              onChange={(e) => {
                const token = tokens.find(t => t.ticker === e.target.value)
                setSelectedToken(token)
              }}
            >
              <option value="">-- Select Token --</option>
              {tokens.map(token => (
                <option key={token.ticker} value={token.ticker}>
                  {token.ticker} ({token.balance})
                </option>
              ))}
            </select>
          </div>
          
          {selectedToken && (
            <div>
              <p>Available Balance: {selectedToken.balance} {selectedToken.ticker}</p>
              
              <div>
                <label>Recipient Address:</label>
                <input 
                  type="text" 
                  value={recipient} 
                  onChange={(e) => setRecipient(e.target.value)} 
                />
              </div>
              
              <div>
                <label>Amount:</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  max={selectedToken.balance}
                  step="0.00000001"
                />
              </div>
              
              <button 
                onClick={handleSend}
                disabled={!recipient || !amount || loading}
              >
                Send {selectedToken.ticker}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>No BRC-20 tokens found</p>
      )}
      
      {txid && <p>Token sent! TXID: {txid}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}`}
        fileName="brc20-tokens.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Runes
      </Heading>
      <p className="mb-6">
        Runes are a newer token protocol for Bitcoin that uses OP_RETURN outputs to define and transfer fungible tokens.
      </p>

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Working with Runes
      </Heading>
      <p className="mb-4">LaserEyes provides methods to interact with Runes:</p>
      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState, useEffect } from 'react'

function RunesTokens() {
  const { getMetaBalances, send, connected } = useLaserEyes()
  const [runes, setRunes] = useState([])
  const [selectedRune, setSelectedRune] = useState(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txid, setTxid] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load runes when connected
  useEffect(() => {
    if (connected) {
      loadRunes()
    } else {
      setRunes([])
    }
  }, [connected])

  const loadRunes = async () => {
    try {
      setLoading(true)
      const result = await getMetaBalances('runes')
      setRunes(result || [])
    } catch (error) {
      console.error('Failed to load Runes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!connected || !selectedRune || !recipient || !amount) return
    
    try {
      setLoading(true)
      
      // Send the Rune
      const result = await send('runes', {
        runeId: selectedRune.id,
        amount: Number.parseFloat(amount),
        toAddress: recipient,
      })
      
      setTxid(result)
      setError('')
      
      // Reset form
      setAmount('')
      setRecipient('')
      
      // Reload runes after a short delay
      setTimeout(loadRunes, 2000)
    } catch (error) {
      setError(error.message || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Runes</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : runes.length > 0 ? (
        <div>
          <div className="mb-4">
            <label>Select Rune:</label>
            <select
              value={selectedRune?.id || ''}
              onChange={(e) => {
                const rune = runes.find(r => r.id === e.target.value)
                setSelectedRune(rune)
              }}
            >
              <option value="">-- Select Rune --</option>
              {runes.map(rune => (
                <option key={rune.id} value={rune.id}>
                  {rune.symbol} ({rune.balance})
                </option>
              ))}
            </select>
          </div>
          
          {selectedRune && (
            <div>
              <p>Available Balance: {selectedRune.balance} {selectedRune.symbol}</p>
              
              <div>
                <label>Recipient Address:</label>
                <input 
                  type="text" 
                  value={recipient} 
                  onChange={(e) => setRecipient(e.target.value)} 
                />
              </div>
              
              <div>
                <label>Amount:</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  max={selectedRune.balance}
                  step="0.00000001"
                />
              </div>
              
              <button 
                onClick={handleSend}
                disabled={!recipient || !amount || loading}
              >
                Send {selectedRune.symbol}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>No Runes found</p>
      )}
      
      {txid && <p>Rune sent! TXID: {txid}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}`}
        fileName="runes-tokens.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Transaction Fees
      </Heading>
      <p className="mb-6">
        Bitcoin transactions require fees to be included in blocks. LaserEyes provides methods to estimate and set
        appropriate fees:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState } from 'react'

function FeeEstimation() {
  const { estimateFee, sendBTC, connected } = useLaserEyes()
  const [feeRate, setFeeRate] = useState(0)
  const [customFeeRate, setCustomFeeRate] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  // Get fee estimate for different confirmation targets
  const getFeeEstimate = async (blocks) => {
    try {
      setLoading(true)
      const rate = await estimateFee(blocks)
      setFeeRate(rate)
    } catch (error) {
      console.error('Failed to estimate fee:', error)
    } finally {
      setLoading(false)
    }
  }

  // Send transaction with custom fee rate
  const handleSendWithCustomFee = async () => {
    if (!connected || !recipient || !amount || !customFeeRate) return
    
    try {
      setLoading(true)
      
      // Convert amount to satoshis
      const satoshis = Math.floor(Number.parseFloat(amount) * 100000000)
      
      // Send with custom fee rate (in sat/vB)
      const txid = await sendBTC(recipient, satoshis, {
        feeRate: Number.parseInt(customFeeRate),
      })
      
      console.log('Transaction sent with custom fee:', txid)
    } catch (error) {
      console.error('Transaction failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Fee Estimation</h2>
      
      <div className="mb-4">
        <button onClick={() => getFeeEstimate(1)} disabled={loading}>
          Estimate for Next Block
        </button>
        <button onClick={() => getFeeEstimate(3)} disabled={loading}>
          Estimate for 3 Blocks
        </button>
        <button onClick={() => getFeeEstimate(6)} disabled={loading}>
          Estimate for 6 Blocks
        </button>
      </div>
      
      {feeRate > 0 && <p>Estimated Fee Rate: {feeRate} sat/vB</p>}
      
      <div className="mt-6">
        <h3>Send with Custom Fee</h3>
        
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
        
        <div>
          <label>Custom Fee Rate (sat/vB):</label>
          <input 
            type="number" 
            value={customFeeRate} 
            onChange={(e) => setCustomFeeRate(e.target.value)} 
            min="1" 
          />
        </div>
        
        <button 
          onClick={handleSendWithCustomFee}
          disabled={!connected || !recipient || !amount || !customFeeRate || loading}
        >
          Send with Custom Fee
        </button>
      </div>
    </div>
  )
}`}
        fileName="fee-estimation.tsx"
        copyButton={true}
      />

      <WarningBox title="Fee Considerations" className="mt-6 mb-6">
        Setting appropriate fees is crucial for Bitcoin transactions. Too low, and your transaction may be stuck
        unconfirmed for a long time. Too high, and you'll overpay. Always use fee estimation or stay informed about
        current network conditions.
      </WarningBox>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">Here are some best practices for working with Bitcoin transactions:</p>

      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Always test on Testnet first</strong>, especially for new transaction types or complex operations.
        </li>
        <li>
          <strong>Implement proper error handling</strong> for all transaction operations, as network issues or wallet
          rejections can occur.
        </li>
        <li>
          <strong>Use appropriate fee rates</strong> based on the urgency of your transaction and current network
          conditions.
        </li>
        <li>
          <strong>Verify transaction details</strong> before signing, especially for large amounts or important
          operations.
        </li>
        <li>
          <strong>Consider transaction size</strong> when working with inscriptions or complex transactions, as they may
          require higher fees.
        </li>
        <li>
          <strong>Implement confirmation tracking</strong> for important transactions to ensure they are properly
          confirmed.
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand the different transaction types supported by LaserEyes, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/inscriptions" className="text-primary hover:underline">
            Working with Inscriptions
          </Link>{" "}
          - Dive deeper into creating and managing Ordinal inscriptions
        </li>
        <li>
          <Link href="/docs/brc20" className="text-primary hover:underline">
            BRC-20 Operations
          </Link>{" "}
          - Learn more about working with BRC-20 tokens
        </li>
        <li>
          <Link href="/docs/runes" className="text-primary hover:underline">
            Working with Runes
          </Link>{" "}
          - Explore the Runes protocol in more detail
        </li>
        <li>
          <Link href="/docs/error-handling" className="text-primary hover:underline">
            Error Handling
          </Link>{" "}
          - Best practices for handling transaction errors
        </li>
        <li>
          <Link href="/docs/security" className="text-primary hover:underline">
            Security Considerations
          </Link>{" "}
          - Learn about security best practices for Bitcoin transactions
        </li>
      </ul>
    </>
  )
}

