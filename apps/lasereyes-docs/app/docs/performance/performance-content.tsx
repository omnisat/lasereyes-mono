"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function PerformanceContent() {
  return (
    <>
      <Heading level="h1">Performance Optimization</Heading>
      <p className="text-lg mb-4">
        Optimizing the performance of your LaserEyes integration is crucial for providing a smooth user experience. This
        page covers strategies and best practices for improving performance.
      </p>

      <Heading level="h2">Performance Considerations</Heading>
      <p className="mb-6">
        When working with Bitcoin wallets and blockchain data, several factors can affect performance:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Network Latency</strong>: API calls to data providers can take time
        </li>
        <li>
          <strong>Wallet Interactions</strong>: Wallet operations like signing can be slow
        </li>
        <li>
          <strong>Data Volume</strong>: Large amounts of data (e.g., many UTXOs or inscriptions) can be slow to process
        </li>
        <li>
          <strong>UI Rendering</strong>: Rendering large lists or complex data can impact performance
        </li>
        <li>
          <strong>Rate Limits</strong>: Data provider rate limits can throttle your application
        </li>
      </ul>

      <Heading level="h2">Caching Strategies</Heading>
      <p className="mb-6">Implementing effective caching is one of the most important performance optimizations:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>In-Memory Caching</strong>: Cache frequently accessed data in memory
        </li>
        <li>
          <strong>Local Storage</strong>: Use browser local storage for persistent caching
        </li>
        <li>
          <strong>IndexedDB</strong>: Store larger datasets in IndexedDB
        </li>
        <li>
          <strong>Service Workers</strong>: Use service workers for network request caching
        </li>
        <li>
          <strong>Time-Based Expiration</strong>: Set appropriate cache expiration times
        </li>
      </ul>

      <p className="mb-6">LaserEyes includes built-in caching that you can configure:</p>
      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
  network: MAINNET,
  // Configure caching options
  cacheOptions: {
    ttl: 60000, // Cache time-to-live in milliseconds (1 minute)
    maxSize: 100, // Maximum number of items to cache
  }
})`}
        fileName="cache-config.ts"
        copyButton={true}
      />

      <p className="mb-6">You can also implement your own caching layer:</p>
      <CodeBlock
        language="typescript"
        code={`// Simple in-memory cache implementation
class Cache<T> {
  private cache: Map<string, { value: T; expires: number }> = new Map()

  constructor(private ttl: number = 60000) {}

  set(key: string, value: T): void {
    const expires = Date.now() + this.ttl
    this.cache.set(key, { value, expires })
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) {
      return undefined
    }
    
    // Check if the item has expired
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return undefined
    }
    
    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Usage example
const balanceCache = new Cache<string>(300000) // 5 minutes TTL

async function getBalanceWithCache(address: string): Promise<string> {
  const cacheKey = \`balance:\${address}\`

  // Check if we have a cached value
  if (balanceCache.has(cacheKey)) {
    return balanceCache.get(cacheKey)!
  }

  // If not, fetch from the data source
  const balance = await dataSourceManager.getBalance(address)

  // Cache the result
  balanceCache.set(cacheKey, balance)

  return balance
}`}
        fileName="custom-cache.ts"
        copyButton={true}
      />

      <Heading level="h2">Optimizing Data Fetching</Heading>
      <p className="mb-6">Efficient data fetching is crucial for performance:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Fetch Only What You Need</strong>: Request only the data you actually need
        </li>
        <li>
          <strong>Pagination</strong>: Use pagination for large datasets
        </li>
        <li>
          <strong>Parallel Requests</strong>: Fetch independent data in parallel
        </li>
        <li>
          <strong>Debouncing</strong>: Debounce user input to reduce API calls
        </li>
        <li>
          <strong>Prefetching</strong>: Prefetch data that users are likely to need
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'

// Debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function OptimizedSearch() {
  const { client } = useLaserEyes()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchInscriptions()
    } else {
      setResults([])
    }
  }, [debouncedSearchTerm])

  const searchInscriptions = async () => {
    setLoading(true)
    
    try {
      const dataSourceManager = client.getDataSourceManager()
      
      // Use a more specific API call if available
      const inscriptions = await dataSourceManager.searchInscriptions(debouncedSearchTerm, {
        limit: 10, // Pagination
        offset: 0,
      })
      
      setResults(inscriptions)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search inscriptions..."
      />
      
      {loading && <p>Loading...</p>}
      
      {results.length > 0 && (
        <ul>
          {results.map((inscription) => (
            <li key={inscription.id}>{inscription.id}</li>
          ))}
        </ul>
      )}
    </div>
  )
}`}
        fileName="optimized-data-fetching.tsx"
        copyButton={true}
      />

      <Heading level="h2">Optimizing UI Rendering</Heading>
      <p className="mb-6">Efficient UI rendering is important for a smooth user experience:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Virtualized Lists</strong>: Use virtualization for long lists
        </li>
        <li>
          <strong>Lazy Loading</strong>: Load components and data only when needed
        </li>
        <li>
          <strong>Memoization</strong>: Memoize expensive calculations and components
        </li>
        <li>
          <strong>Code Splitting</strong>: Split your code into smaller chunks
        </li>
        <li>
          <strong>Optimized Images</strong>: Use optimized images and lazy loading
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualizedInscriptionsList() {
  const { getInscriptions, connected } = useLaserEyes()
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch inscriptions when connected
  useEffect(() => {
    if (connected) {
      fetchInscriptions()
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

  // Create a reference to the scrollable element
  const parentRef = useRef(null)

  // Set up the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: inscriptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  })

  // Memoize the inscription items to prevent unnecessary re-renders
  const inscriptionItems = useMemo(() => {
    return rowVirtualizer.getVirtualItems().map((virtualItem) => {
      const inscription = inscriptions[virtualItem.index]
      
      return (
        <div
          key={inscription.id}
          className="border rounded p-2"
          style={{
            height: \`\${virtualItem.size}px\`,
            transform: \`translateY(\${virtualItem.start}px)\`,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }}
        >
          <div className="flex items-center">
            {inscription.contentType?.startsWith('image/') ? (
              <img
                src={inscription.content || "/placeholder.svg"}
                alt={\`Inscription #\${inscription.number}\`}
                className="w-16 h-16 object-contain"
                loading="lazy" // Lazy load images
              />
            ) : (
              <div className="w-16 h-16 bg-muted flex items-center justify-center">
                <span className="text-xs">{inscription.contentType}</span>
              </div>
            )}
            <div className="ml-4">
              <p className="font-medium">#{inscription.number}</p>
              <p className="text-xs text-muted-foreground">{inscription.id}</p>
            </div>
          </div>
        </div>
      )
    })
  }, [rowVirtualizer.getVirtualItems(), inscriptions])

  return (
    <div>
      <h2>Your Inscriptions</h2>
      
      {loading ? (
        <p>Loading inscriptions...</p>
      ) : inscriptions.length > 0 ? (
        <div
          ref={parentRef}
          className="h-[500px] overflow-auto relative"
          style={{ width: '100%' }}
        >
          <div
            style={{
              height: \`\${rowVirtualizer.getTotalSize()}px\`,
              width: '100%',
              position: 'relative',
            }}
          >
            {inscriptionItems}
          </div>
        </div>
      ) : (
        <p>No inscriptions found</p>
      )}
    </div>
  )
}`}
        fileName="virtualized-list.tsx"
        copyButton={true}
      />

      <Heading level="h2">Optimizing Wallet Interactions</Heading>
      <p className="mb-6">Wallet interactions can be slow, so it's important to optimize them:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Minimize Wallet Calls</strong>: Reduce the number of calls to the wallet
        </li>
        <li>
          <strong>Batch Operations</strong>: Combine multiple operations when possible
        </li>
        <li>
          <strong>Provide Feedback</strong>: Show loading indicators during wallet operations
        </li>
        <li>
          <strong>Cache Wallet Data</strong>: Cache wallet data like address and balance
        </li>
        <li>
          <strong>Optimize PSBT Construction</strong>: Construct PSBTs efficiently
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`import { useLaserEyes } from '@kevinoyl/lasereyes-react'
import { useState, useEffect } from 'react'

function OptimizedWalletInteraction() {
  const { 
    connect, 
    disconnect, 
    connected, 
    address, 
    balance, 
    getInscriptions,
    getMetaBalances
  } = useLaserEyes()

  const [walletData, setWalletData] = useState({
    address: '',
    balance: '0',
    inscriptions: [],
    tokens: []
  })

  const [loading, setLoading] = useState(false)

  // Fetch all wallet data at once when connected
  useEffect(() => {
    if (connected) {
      fetchWalletData()
    } else {
      setWalletData({
        address: '',
        balance: '0',
        inscriptions: [],
        tokens: []
      })
    }
  }, [connected])

  const fetchWalletData = async () => {
    setLoading(true)
    
    try {
      // Fetch all data in parallel
      const [inscriptions, tokens] = await Promise.all([
        getInscriptions(),
        getMetaBalances('brc20')
      ])
      
      // Use the values from the hook for address and balance
      // since they're already available
      setWalletData({
        address,
        balance,
        inscriptions: inscriptions || [],
        tokens: tokens || []
      })
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    
    try {
      await connect('UNISAT')
      // No need to fetch data here, the useEffect will handle it
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!connected ? (
        <button onClick={handleConnect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <div className="flex justify-between items-center">
            <h2>Wallet Connected</h2>
            <button onClick={disconnect}>Disconnect</button>
          </div>
          
          {loading ? (
            <p>Loading wallet data...</p>
          ) : (
            <div>
              <p>Address: {walletData.address}</p>
              <p>Balance: {parseInt(walletData.balance) / 100000000} BTC</p>
              <p>Inscriptions: {walletData.inscriptions.length}</p>
              <p>BRC-20 Tokens: {walletData.tokens.length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}`}
        fileName="optimized-wallet-interaction.tsx"
        copyButton={true}
      />

      <Heading level="h2">Data Provider Selection</Heading>
      <p className="mb-6">Choosing the right data provider can significantly impact performance:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Use Multiple Providers</strong>: Configure multiple providers for redundancy and performance
        </li>
        <li>
          <strong>Choose Providers by Feature</strong>: Use different providers for different features
        </li>
        <li>
          <strong>Consider Geographic Location</strong>: Choose providers with servers close to your users
        </li>
        <li>
          <strong>Monitor Performance</strong>: Track provider performance and adjust as needed
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`const config = createConfig({
  network: MAINNET,
  dataSources: {
    // Use Maestro for Ordinals and tokens
    maestro: {
      apiKey: process.env.MAESTRO_API_KEY,
    },
    // Use Mempool.space for basic Bitcoin operations
    mempool: {
      url: 'https://mempool.space/api',
    },
    // Use Sandshrew as a fallback
    sandshrew: {
      apiKey: process.env.SANDSHREW_API_KEY,
    }
  }
})`}
        fileName="provider-selection.ts"
        copyButton={true}
      />

      <Heading level="h2">Performance Monitoring</Heading>
      <p className="mb-6">Monitor your application's performance to identify bottlenecks:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Track API Call Times</strong>: Measure how long API calls take
        </li>
        <li>
          <strong>Monitor Wallet Operation Times</strong>: Track wallet operation performance
        </li>
        <li>
          <strong>Use Performance Metrics</strong>: Track metrics like First Contentful Paint (FCP) and Time to
          Interactive (TTI)
        </li>
        <li>
          <strong>Implement Logging</strong>: Log performance data for analysis
        </li>
        <li>
          <strong>Use Performance Monitoring Tools</strong>: Tools like Lighthouse, WebPageTest, or commercial
          monitoring services
        </li>
      </ul>

      <CodeBlock
        language="typescript"
        code={`// Simple performance monitoring wrapper
function withPerformanceTracking<T>(
  fn: (...args: any[]) => Promise<T>,
  name: string
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
    const startTime = performance.now()
    
    try {
      const result = await fn(...args)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Log or send to monitoring service
      console.log(\`\${name} took \${duration.toFixed(2)}ms\`)
      
      // You could send this to your analytics or monitoring service
      // analytics.trackPerformance(name, duration)
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Log error with duration
      console.error(\`\${name} failed after \${duration.toFixed(2)}ms\`, error)
      
      throw error
    }
  }
}

// Usage example
const getBalanceWithTracking = withPerformanceTracking(
  dataSourceManager.getBalance.bind(dataSourceManager),
  'getBalance'
)

// Now use the wrapped function
const balance = await getBalanceWithTracking('bc1q...')`}
        fileName="performance-monitoring.ts"
        copyButton={true}
      />

      <Heading level="h2">Performance Checklist</Heading>
      <p className="mb-6">Use this checklist to ensure your LaserEyes integration is optimized for performance:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Optimization</th>
              <th className="border p-2 text-left">Implementation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2" rowSpan={5}>
                Caching
              </td>
              <td className="border p-2">Configure LaserEyes caching</td>
              <td className="border p-2">Set appropriate TTL and cache size</td>
            </tr>
            <tr>
              <td className="border p-2">Implement in-memory caching</td>
              <td className="border p-2">Cache frequently accessed data</td>
            </tr>
            <tr>
              <td className="border p-2">Use local storage</td>
              <td className="border p-2">Cache data between sessions</td>
            </tr>
            <tr>
              <td className="border p-2">Set cache expiration</td>
              <td className="border p-2">Use appropriate TTL for different data types</td>
            </tr>
            <tr>
              <td className="border p-2">Implement cache invalidation</td>
              <td className="border p-2">Clear cache when data changes</td>
            </tr>
            <tr>
              <td className="border p-2" rowSpan={5}>
                Data Fetching
              </td>
              <td className="border p-2">Fetch only what you need</td>
              <td className="border p-2">Request minimal data</td>
            </tr>
            <tr>
              <td className="border p-2">Use pagination</td>
              <td className="border p-2">Paginate large datasets</td>
            </tr>
            <tr>
              <td className="border p-2">Fetch in parallel</td>
              <td className="border p-2">Use Promise.all for independent data</td>
            </tr>
            <tr>
              <td className="border p-2">Debounce user input</td>
              <td className="border p-2">Reduce API calls from user input</td>
            </tr>
            <tr>
              <td className="border p-2">Prefetch data</td>
              <td className="border p-2">Prefetch likely-to-be-needed data</td>
            </tr>
            <tr>
              <td className="border p-2" rowSpan={5}>
                UI Rendering
              </td>
              <td className="border p-2">Use virtualized lists</td>
              <td className="border p-2">Render only visible items</td>
            </tr>
            <tr>
              <td className="border p-2">Implement lazy loading</td>
              <td className="border p-2">Load components when needed</td>
            </tr>
            <tr>
              <td className="border p-2">Memoize components</td>
              <td className="border p-2">Prevent unnecessary re-renders</td>
            </tr>
            <tr>
              <td className="border p-2">Use code splitting</td>
              <td className="border p-2">Split code into smaller chunks</td>
            </tr>
            <tr>
              <td className="border p-2">Optimize images</td>
              <td className="border p-2">Use optimized images and lazy loading</td>
            </tr>
            <tr>
              <td className="border p-2" rowSpan={4}>
                Wallet Interactions
              </td>
              <td className="border p-2">Minimize wallet calls</td>
              <td className="border p-2">Reduce calls to the wallet</td>
            </tr>
            <tr>
              <td className="border p-2">Batch operations</td>
              <td className="border p-2">Combine operations when possible</td>
            </tr>
            <tr>
              <td className="border p-2">Provide feedback</td>
              <td className="border p-2">Show loading indicators</td>
            </tr>
            <tr>
              <td className="border p-2">Cache wallet data</td>
              <td className="border p-2">Cache address and balance</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level="h2">Next Steps</Heading>
      <p className="mb-6">
        Now that you understand performance optimization for LaserEyes, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/error-handling" className="text-primary hover:underline">
            Error Handling
          </Link>{" "}
          - Learn how to handle errors effectively
        </li>
        <li>
          <Link href="/docs/security" className="text-primary hover:underline">
            Security Considerations
          </Link>{" "}
          - Understand security best practices
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

