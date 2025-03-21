import { Heading } from "@/components/heading"
import { CodeBlock } from "@/components/code-block"

export default function TransactionTrackingExample() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Heading level={1} className="text-4xl font-bold mb-6">
        🔍 Transaction Tracking Example
      </Heading>

      <p className="text-lg mb-6">
        Track Bitcoin transactions with the precision of a blockchain bloodhound and the patience of a HODLer in a bear
        market.
      </p>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        The Problem
      </Heading>

      <p className="mb-4">
        You want to track the status of Bitcoin transactions in real-time, showing confirmations as they happen.
        Manually polling for updates is tedious and inefficient.
      </p>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        The LaserEyes Solution
      </Heading>

      <p className="mb-4">LaserEyes provides a simple way to track transactions with automatic updates:</p>

      <CodeBlock
        code={`import { useLaserEyes, useTransaction } from 'laser-eyes';

export function TransactionTracker({ txid }) {
  const { network } = useLaserEyes();
  const { 
    transaction, 
    confirmations, 
    status, 
    isLoading, 
    error 
  } = useTransaction(txid);
  
  if (isLoading) {
    return <div>Scanning the blockchain...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        Transaction: {txid.slice(0, 8)}...{txid.slice(-8)}
      </h2>
      
      <div className="space-y-2">
        <p>Network: {network}</p>
        <p>Status: {status}</p>
        <p>Confirmations: {confirmations}</p>
        <p>Amount: {transaction?.value} sats</p>
        <p>
          Time: {transaction?.timestamp 
            ? new Date(transaction.timestamp * 1000).toLocaleString() 
            : 'Pending'}
        </p>
      </div>
      
      {/* Progress bar for confirmations */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full" 
            style={{ width: \`\${Math.min(confirmations / 6 * 100, 100)}%\` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>0</span>
          <span>6+ confirmations</span>
        </div>
      </div>
    </div>
  );
}`}
        language="tsx"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        How It Works
      </Heading>

      <ol className="list-decimal pl-6 space-y-2 mb-6">
        <li>
          The <code>useTransaction</code> hook takes a transaction ID and returns real-time data
        </li>
        <li>LaserEyes automatically polls for updates at an optimal interval</li>
        <li>The UI shows the current status, confirmations, and other transaction details</li>
        <li>A progress bar visualizes the confirmation progress (6+ is typically considered "confirmed")</li>
      </ol>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Advanced: Tracking Multiple Transactions
      </Heading>

      <p className="mb-4">For tracking a list of transactions:</p>

      <CodeBlock
        code={`import { useLaserEyes, useTransactions } from 'laser-eyes';

export function TransactionList({ txids }) {
  const { transactions, isLoading } = useTransactions(txids);
  
  if (isLoading) {
    return <div>Loading transactions...</div>;
  }
  
  return (
    <div className="space-y-4">
      {transactions.map(tx => (
        <div key={tx.txid} className="p-3 border rounded">
          <p className="font-mono text-sm">{tx.txid.slice(0, 8)}...{tx.txid.slice(-8)}</p>
          <p className="text-sm">Status: {tx.status}</p>
          <p className="text-sm">Confirmations: {tx.confirmations}</p>
        </div>
      ))}
    </div>
  );
}`}
        language="tsx"
      />

      <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg mt-8">
        <p className="font-semibold">💡 Fun Fact:</p>
        <p>
          The average Bitcoin transaction takes about 10 minutes to get its first confirmation. That's just enough time
          to make a cup of coffee or explain to your grandma what a blockchain is (results may vary).
        </p>
      </div>
    </div>
  )
}

