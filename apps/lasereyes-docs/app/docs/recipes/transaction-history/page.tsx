"use client"

import { Heading } from "@/components/heading"
import { CodeBlock } from "@/components/code-block"
import Image from "next/image"

export default function TransactionHistoryRecipe() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Heading level={1} className="text-4xl font-bold mb-6">
        📜 Transaction History Recipe
      </Heading>

      <p className="text-lg mb-6">
        Build a complete transaction history viewer that would make block explorers jealous. Perfect for wallets,
        portfolio trackers, or just showing off your Bitcoin street cred.
      </p>

      <div className="flex justify-center mb-8">
        <Image
          src="/placeholder.svg?height=300&width=600"
          alt="Transaction History Preview"
          width={600}
          height={300}
          className="rounded-lg border"
        />
      </div>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        What We're Building
      </Heading>

      <p className="mb-4">A transaction history component that:</p>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Displays transactions for a Bitcoin address</li>
        <li>Shows transaction details including amount, date, and confirmation status</li>
        <li>Supports pagination for addresses with many transactions</li>
        <li>Includes filtering options (sent, received, all)</li>
        <li>Provides links to block explorers for more details</li>
      </ul>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        The Complete Solution
      </Heading>

      <CodeBlock
        code={`// components/TransactionHistory.tsx
import { useState, useEffect } from 'react';
import { useLaserEyes, useAddressHistory } from 'laser-eyes';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

// Types for our component
type TransactionType = 'all' | 'sent' | 'received';

interface TransactionHistoryProps {
  address: string;
  pageSize?: number;
}

export function TransactionHistory({ 
  address, 
  pageSize = 10 
}: TransactionHistoryProps) {
  const { network } = useLaserEyes();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<TransactionType>('all');
  
  // Fetch transaction history with pagination
  const { 
    transactions, 
    isLoading, 
    error, 
    totalTransactions 
  } = useAddressHistory(address, {
    page,
    limit: pageSize,
    type: filter !== 'all' ? filter : undefined
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(totalTransactions / pageSize);
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // Format satoshis with commas
  const formatSats = (sats: number) => {
    return sats.toLocaleString();
  };
  
  // Get block explorer URL based on network and txid
  const getExplorerUrl = (txid: string) => {
    const baseUrl = network === 'mainnet' 
      ? 'https://mempool.space/tx/' 
      : 'https://mempool.space/testnet/tx/';
    return \`\${baseUrl}\${txid}\`;
  };
  
  // Handle page navigation
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold">Transaction History</h3>
        
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as TransactionType);
              setPage(1); // Reset to first page on filter change
            }}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 text-center">
          Error loading transactions: {error.message}
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No transactions found for this address.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((tx) => (
                  <tr key={tx.txid} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {tx.type === 'received' ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span>{tx.type === 'received' ? 'Received' : 'Sent'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={tx.type === 'received' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'received' ? '+' : '-'}{formatSats(tx.value)} sats
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {tx.timestamp ? formatDate(tx.timestamp) : 'Pending'}
                    </td>
                    <td className="px-4 py-3">
                      {tx.confirmations > 0 ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {tx.confirmations} confirmation{tx.confirmations !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Unconfirmed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a 
                        href={getExplorerUrl(tx.txid)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                      >
                        <span className="text-sm">View</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination controls */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalTransactions)} of {totalTransactions} transactions
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="p-1 rounded border disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button
                onClick={nextPage}
                disabled={page >= totalPages}
                className="p-1 rounded border disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}`}
        language="tsx"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        How to Use It
      </Heading>

      <p className="mb-4">Add the component to your page:</p>

      <CodeBlock
        code={`import { LaserEyesProvider } from 'laser-eyes';
import { TransactionHistory } from '../components/TransactionHistory';

export default function WalletPage() {
  // This could come from user input, URL params, or your app state
  const bitcoinAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  
  return (
    <LaserEyesProvider>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Wallet Transactions</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Address</h2>
          <div className="p-3 bg-gray-100 rounded font-mono text-sm break-all">
            {bitcoinAddress}
          </div>
        </div>
        
        <TransactionHistory 
          address={bitcoinAddress} 
          pageSize={15} 
        />
      </div>
    </LaserEyesProvider>
  );
}`}
        language="tsx"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Customization Ideas
      </Heading>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          <strong>CSV Export:</strong> Add a button to export transactions as CSV
        </li>
        <li>
          <strong>Date Filtering:</strong> Allow users to filter by date range
        </li>
        <li>
          <strong>Transaction Search:</strong> Add a search box to find specific transactions
        </li>
        <li>
          <strong>Transaction Categories:</strong> Add the ability to categorize and tag transactions
        </li>
        <li>
          <strong>Fiat Conversion:</strong> Show transaction values in USD or other fiat currencies
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Performance Tips
      </Heading>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Always use pagination for addresses with many transactions</li>
        <li>Consider implementing virtual scrolling for very large transaction lists</li>
        <li>Cache transaction data to reduce API calls</li>
        <li>Use skeleton loaders for better UX during loading states</li>
      </ul>

      <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg mt-8">
        <p className="font-semibold">💡 Pro Tip:</p>
        <p>
          For wallets with multiple addresses (like HD wallets), you can create a tabbed interface to switch between
          addresses or aggregate all transactions into a single view.
        </p>
      </div>
    </div>
  )
}

