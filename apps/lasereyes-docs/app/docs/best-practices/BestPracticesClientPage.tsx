"use client"

import { CodeBlock } from "@/components/code-block"
import { DocNavigation } from "@/components/doc-navigation"
import { WarningBox } from "@/components/warning-box"

export default function BestPracticesClientPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Best Practices</h1>
      <p className="text-lg mb-8">
        This guide outlines recommended practices for building robust Bitcoin applications with LaserEyes. Following
        these guidelines will help you create more reliable, secure, and user-friendly applications.
      </p>

      <div className="space-y-12">
        <section id="architecture">
          <h2 className="text-2xl font-bold mb-4">Architecture Best Practices</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Separation of Concerns</h3>
              <p className="mb-3">Structure your application with clear separation between:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>UI components</li>
                <li>Wallet connection logic</li>
                <li>Transaction building</li>
                <li>Data fetching and caching</li>
              </ul>

              <p className="mt-3">This makes your code more maintainable and easier to test.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">State Management</h3>
              <p className="mb-3">For complex applications:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use a state management solution like Redux, Zustand, or Jotai</li>
                <li>Create dedicated slices for wallet state, transaction history, and user preferences</li>
                <li>Implement selectors for derived state</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Example with Zustand
import create from 'zustand'
import { useLaserEyes } from '@omnisat/lasereyes-react'

const useWalletStore = create((set) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  updateBalance: (balance) => set({ balance }),
  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions] 
  })),
  setLoading: (isLoading) => set({ isLoading }),
}))

// In your component
function WalletDashboard() {
  const { address, getBalance } = useLaserEyes()
  const { balance, updateBalance, setLoading } = useWalletStore()
  
  useEffect(() => {
    if (address) {
      setLoading(true)
      getBalance(address).then(balance => {
        updateBalance(balance)
        setLoading(false)
      })
    }
  }, [address])
  
  // ...
}
              `}
              />
            </div>
          </div>
        </section>

        <section id="performance">
          <h2 className="text-2xl font-bold mb-4">Performance Optimization</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Efficient Data Fetching</h3>
              <p className="mb-3">Optimize your data fetching strategy:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Implement caching for frequently accessed data</li>
                <li>Use pagination for large datasets</li>
                <li>Batch related requests when possible</li>
                <li>Consider using server-side rendering for initial data</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Example using React Query for caching
import { useQuery } from 'react-query'
import { useLaserEyes } from '@omnisat/lasereyes-react'

function UTXOList() {
  const { address, getUTXOs } = useLaserEyes()
  
  const { data: utxos, isLoading, error } = useQuery(
    ['utxos', address],
    () => getUTXOs(address),
    {
      enabled: !!address,
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
    }
  )
  
  // ...
}
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Lazy Loading</h3>
              <p className="mb-3">Implement lazy loading for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Heavy components that aren't immediately visible</li>
                <li>Features that aren't used by all users</li>
                <li>Large libraries and dependencies</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Lazy load transaction history component
import { lazy, Suspense } from 'react'

const TransactionHistory = lazy(() => import('./TransactionHistory'))

function WalletDashboard() {
  const [showHistory, setShowHistory] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowHistory(true)}>
        Show Transaction History
      </button>
      
      {showHistory && (
        <Suspense fallback={<div>Loading history...</div>}>
          <TransactionHistory />
        </Suspense>
      )}
    </div>
  )
}
              `}
              />
            </div>
          </div>
        </section>

        <section id="error-handling">
          <h2 className="text-2xl font-bold mb-4">Error Handling</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Graceful Degradation</h3>
              <p className="mb-3">Design your application to handle failures gracefully:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Implement fallback UI for failed components</li>
                <li>Provide clear error messages to users</li>
                <li>Offer retry options when appropriate</li>
                <li>Cache last known good state</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Error boundary example
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 border border-red-500 rounded">
      <p className="font-bold">Something went wrong:</p>
      <p className="text-sm">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset application state here
      }}
    >
      <WalletDashboard />
    </ErrorBoundary>
  )
}
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Error Tracking</h3>
              <p className="mb-3">Implement robust error tracking:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Log errors with contextual information</li>
                <li>Use error monitoring services (Sentry, LogRocket, etc.)</li>
                <li>Track error rates and patterns</li>
                <li>Set up alerts for critical errors</li>
              </ul>

              <WarningBox title="Privacy Considerations">
                Be careful not to log sensitive user information. Never log private keys, seed phrases, or personal
                data.
              </WarningBox>
            </div>
          </div>
        </section>

        <section id="user-experience">
          <h2 className="text-2xl font-bold mb-4">User Experience</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Progressive Disclosure</h3>
              <p className="mb-3">Implement progressive disclosure of complex features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Start with simple, essential features</li>
                <li>Gradually introduce advanced options</li>
                <li>Provide contextual help and tooltips</li>
                <li>Use wizards for complex workflows</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Feedback and Loading States</h3>
              <p className="mb-3">Always provide clear feedback:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Show loading indicators for asynchronous operations</li>
                <li>Provide progress updates for multi-step processes</li>
                <li>Confirm successful actions</li>
                <li>Explain errors in user-friendly language</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
function SendBitcoin() {
  const { sendTransaction } = useLaserEyes()
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [error, setError] = useState(null)
  
  const handleSend = async (amount, recipient) => {
    try {
      setStatus('loading')
      setError(null)
      
      // Show progress for long operations
      const txid = await sendTransaction({
        amount,
        recipient,
        onProgress: (step, total) => {
          console.log(\`Step \${step} of \${total}\`)
        }
      })
      
      setStatus('success')
      return txid
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Failed to send transaction')
    }
  }
  
  return (
    <div>
      {/* Form components */}
      
      {status === 'loading' && <LoadingSpinner />}
      {status === 'success' && <SuccessMessage />}
      {status === 'error' && <ErrorMessage message={error} />}
    </div>
  )
}
              `}
              />
            </div>
          </div>
        </section>

        <section id="security">
          <h2 className="text-2xl font-bold mb-4">Security Best Practices</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Input Validation</h3>
              <p className="mb-3">Always validate user inputs:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Validate Bitcoin addresses before sending</li>
                <li>Check amount ranges and decimal precision</li>
                <li>Sanitize inputs to prevent XSS attacks</li>
                <li>Implement rate limiting for sensitive operations</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Address validation example
import { validateAddress } from '@omnisat/lasereyes'

function SendForm() {
  const [address, setAddress] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  
  const handleAddressChange = (e) => {
    const newAddress = e.target.value
    setAddress(newAddress)
    
    try {
      // Validate the address format and network
      const validation = validateAddress(newAddress, 'mainnet')
      setIsValid(validation.isValid)
      setError(validation.isValid ? '' : validation.error)
    } catch (err) {
      setIsValid(false)
      setError('Invalid address format')
    }
  }
  
  // ...
}
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Transaction Confirmation</h3>
              <p className="mb-3">Always confirm critical actions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Show transaction details before sending</li>
                <li>Display fee estimates clearly</li>
                <li>Require explicit confirmation for large amounts</li>
                <li>Provide clear warnings for irreversible actions</li>
              </ul>

              <WarningBox title="Transaction Security">
                Always show the full recipient address and amount before sending. Never truncate addresses in
                confirmation screens.
              </WarningBox>
            </div>
          </div>
        </section>

        <section id="testing">
          <h2 className="text-2xl font-bold mb-4">Testing Strategy</h2>

          <div className="space-y-4">
            <p>Implement a comprehensive testing strategy:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Unit tests:</strong> Test individual functions and components
              </li>
              <li>
                <strong>Integration tests:</strong> Test interactions between components
              </li>
              <li>
                <strong>E2E tests:</strong> Test complete user flows
              </li>
              <li>
                <strong>Testnet validation:</strong> Test with real wallets on testnet before mainnet
              </li>
              <li>
                <strong>Mock services:</strong> Create mock implementations of LaserEyes services for testing
              </li>
            </ul>

            <CodeBlock
              language="typescript"
              code={`
// Mock LaserEyes provider for testing
import { LaserEyesProvider } from '@omnisat/lasereyes-react'

const mockLaserEyesClient = {
  connect: jest.fn().mockResolvedValue(true),
  getAddress: jest.fn().mockResolvedValue('tb1q...'),
  getBalance: jest.fn().mockResolvedValue(100000),
  sendTransaction: jest.fn().mockResolvedValue('txid123'),
  // ...other methods
}

function TestWrapper({ children }) {
  return (
    <LaserEyesProvider client={mockLaserEyesClient}>
      {children}
    </LaserEyesProvider>
  )
}

// In your test
test('displays wallet balance', async () => {
  render(
    <TestWrapper>
      <WalletBalance />
    </TestWrapper>
  )
  
  expect(await screen.findByText('0.001 BTC')).toBeInTheDocument()
})
              `}
            />
          </div>
        </section>
      </div>

      <DocNavigation
        prev={{ title: "Common Issues", href: "/docs/common-issues" }}
        next={{ title: "Development Setup", href: "/docs/development-setup" }}
      />
    </div>
  )
}

