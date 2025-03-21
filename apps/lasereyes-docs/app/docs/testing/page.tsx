"use client"

import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import Link from "next/link"

export default function TestingPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Testing</h1>
      <p className="text-lg mb-4">
        Testing your LaserEyes integration is crucial for ensuring reliability and correctness. This page covers
        strategies and best practices for testing LaserEyes applications.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Testing Challenges</h2>
      <p className="mb-6">Testing Bitcoin wallet applications presents unique challenges:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Wallet Dependencies</strong>: Tests need to interact with wallet extensions
        </li>
        <li>
          <strong>Blockchain Interactions</strong>: Tests may need to interact with the blockchain
        </li>
        <li>
          <strong>Network Variability</strong>: Blockchain networks can have variable performance
        </li>
        <li>
          <strong>Test Environment</strong>: Setting up a test environment can be complex
        </li>
        <li>
          <strong>Real Funds</strong>: Testing with real funds is risky
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Testing Approaches</h2>
      <p className="mb-6">To address these challenges, we recommend a multi-layered testing approach:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Unit Testing</strong>: Test individual functions and components in isolation
        </li>
        <li>
          <strong>Integration Testing</strong>: Test interactions between components
        </li>
        <li>
          <strong>Mocking</strong>: Mock wallet and blockchain interactions
        </li>
        <li>
          <strong>Testnet Testing</strong>: Use Bitcoin Testnet for end-to-end tests
        </li>
        <li>
          <strong>Manual Testing</strong>: Perform manual tests for critical flows
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Unit Testing</h2>
      <p className="mb-6">Unit tests focus on testing individual functions and components in isolation:</p>
      <CodeBlock
        language="typescript"
        code={`// Example unit test for a utility function
import { formatBitcoinAmount } from '../utils/formatters'

describe('formatBitcoinAmount', () => {
  test('formats satoshis as BTC with 8 decimal places', () => {
    expect(formatBitcoinAmount('1000000')).toBe('0.01000000')
    expect(formatBitcoinAmount('123456789')).toBe('1.23456789')
    expect(formatBitcoinAmount('0')).toBe('0.00000000')
  })
  
  test('handles string and number inputs', () => {
    expect(formatBitcoinAmount(1000000)).toBe('0.01000000')
    expect(formatBitcoinAmount('1000000')).toBe('0.01000000')
  })
  
  test('handles invalid inputs', () => {
    expect(formatBitcoinAmount('')).toBe('0.00000000')
    expect(formatBitcoinAmount('invalid')).toBe('0.00000000')
    expect(formatBitcoinAmount(null)).toBe('0.00000000')
    expect(formatBitcoinAmount(undefined)).toBe('0.00000000')
  })
})`}
        fileName="format-bitcoin-amount.test.ts"
        copyButton={true}
      />

      <p className="mt-6 mb-6">For React components, you can use testing libraries like React Testing Library:</p>
      <CodeBlock
        language="typescript"
        code={`// Example unit test for a React component
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BitcoinAddressInput } from '../components/BitcoinAddressInput'

describe('BitcoinAddressInput', () => {
  test('renders input field', () => {
    render(<BitcoinAddressInput value="" onChange={() => {}} />)
    
    const input = screen.getByPlaceholderText('Enter Bitcoin address')
    expect(input).toBeInTheDocument()
  })
  
  test('calls onChange when input changes', async () => {
    const handleChange = jest.fn()
    render(<BitcoinAddressInput value="" onChange={handleChange} />)
    
    const input = screen.getByPlaceholderText('Enter Bitcoin address')
    await userEvent.type(input, 'bc1q...')
    
    expect(handleChange).toHaveBeenCalled()
  })
  
  test('shows error for invalid address', () => {
    render(<BitcoinAddressInput value="invalid" onChange={() => {}} />)
    
    const errorMessage = screen.getByText('Invalid Bitcoin address')
    expect(errorMessage).toBeInTheDocument()
  })
})`}
        fileName="bitcoin-address-input.test.tsx"
        copyButton={true}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4">Mocking LaserEyes</h2>
      <p className="mb-6">
        To test components that use LaserEyes, you'll need to mock the LaserEyes hooks and providers:
      </p>
      <CodeBlock
        language="typescript"
        code={`// Create a mock for useLaserEyes hook
jest.mock('@omnisat/lasereyes-react', () => ({
  useLaserEyes: () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
    address: '',
    balance: '0',
    sendBTC: jest.fn(),
    getInscriptions: jest.fn(),
    getMetaBalances: jest.fn(),
    // Add other methods and properties as needed
  }),
  LaserEyesProvider: ({ children }) => children,
}))

// Example test for a component that uses useLaserEyes
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { WalletConnect } from '../components/WalletConnect'

describe('WalletConnect', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })
  
  test('renders connect button when not connected', () => {
    // Override the mock for this test
    const mockUseLaserEyes = useLaserEyes as jest.Mock
    mockUseLaserEyes.mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: false,
      address: '',
      balance: '0',
    })
    
    render(<WalletConnect />)
    
    const connectButton = screen.getByText('Connect Wallet')
    expect(connectButton).toBeInTheDocument()
  })
  
  test('renders address and disconnect button when connected', () => {
    // Override the mock for this test
    const mockUseLaserEyes = useLaserEyes as jest.Mock
    mockUseLaserEyes.mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      address: 'bc1qtest...',
      balance: '1000000',
    })
    
    render(<WalletConnect />)
    
    const addressElement = screen.getByText(/bc1qtest.../)
    const disconnectButton = screen.getByText('Disconnect')
    
    expect(addressElement).toBeInTheDocument()
    expect(disconnectButton).toBeInTheDocument()
  })
  
  test('calls connect when connect button is clicked', async () => {
    const mockConnect = jest.fn()
    
    // Override the mock for this test
    const mockUseLaserEyes = useLaserEyes as jest.Mock
    mockUseLaserEyes.mockReturnValue({
      connect: mockConnect,
      disconnect: jest.fn(),
      connected: false,
      address: '',
      balance: '0',
    })
    
    render(<WalletConnect />)
    
    const connectButton = screen.getByText('Connect Wallet')
    await userEvent.click(connectButton)
    
    expect(mockConnect).toHaveBeenCalled()
  })
})`}
        fileName="wallet-connect.test.tsx"
        copyButton={true}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4">Integration Testing</h2>
      <p className="mb-6">Integration tests focus on testing interactions between components:</p>
      <CodeBlock
        language="typescript"
        code={`// Example integration test for a wallet flow
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { WalletPage } from '../pages/WalletPage'

// Mock the LaserEyesClient
jest.mock('@omnisat/lasereyes-core', () => {
  const originalModule = jest.requireActual('@omnisat/lasereyes-core')
  
  return {
    ...originalModule,
    LaserEyesClient: jest.fn().mockImplementation(() => ({
      initialize: jest.fn(),
      connect: jest.fn().mockResolvedValue({ address: 'bc1qtest...', publicKey: 'test' }),
      disconnect: jest.fn().mockResolvedValue(undefined),
      getBalance: jest.fn().mockResolvedValue('1000000'),
      getInscriptions: jest.fn().mockResolvedValue([]),
      sendBTC: jest.fn().mockResolvedValue('txid123'),
      // Add other methods as needed
    })),
  }
})

// Create a wrapper with the LaserEyesProvider
const renderWithProvider = (ui) => {
  return render(
    <LaserEyesProvider config={{ network: 'testnet' }}>
      {ui}
    </LaserEyesProvider>
  )
}

describe('WalletPage Integration', () => {
  test('complete wallet flow: connect, view balance, send transaction', async () => {
    renderWithProvider(<WalletPage />)
    
    // Step 1: Connect wallet
    const connectButton = screen.getByText('Connect Wallet')
    await userEvent.click(connectButton)
    
    // Wait for connection to complete
    await waitFor(() => {
      expect(screen.getByText(/bc1qtest.../)).toBeInTheDocument()
    })
    
    // Step 2: Check balance
    expect(screen.getByText('0.01000000 BTC')).toBeInTheDocument()
    
    // Step 3: Fill send form
    const recipientInput = screen.getByLabelText('Recipient')
    const amountInput = screen.getByLabelText('Amount')
    const sendButton = screen.getByText('Send BTC')
    
    await userEvent.type(recipientInput, 'bc1qrecipient...')
    await userEvent.type(amountInput, '0.005')
    await userEvent.click(sendButton)
    
    // Step 4: Verify transaction success
    await waitFor(() => {
      expect(screen.getByText(/Transaction sent/)).toBeInTheDocument()
      expect(screen.getByText(/txid123/)).toBeInTheDocument()
    })
  })
})`}
        fileName="wallet-page-integration.test.tsx"
        copyButton={true}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4">Testing with Testnet</h2>
      <p className="mb-6">For end-to-end testing, you can use Bitcoin Testnet:</p>
      <CodeBlock
        language="typescript"
        code={`// Configure LaserEyes to use Testnet for testing
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { TESTNET } from '@omnisat/lasereyes-core'
import { render } from '@testing-library/react'
import { App } from '../App'

// Create a wrapper with the LaserEyesProvider configured for Testnet
const renderWithTestnet = (ui) => {
  return render(
    <LaserEyesProvider
      config={{ 
        network: TESTNET,
        dataSources: {
          // Use test API keys or public Testnet APIs
          maestro: {
            apiKey: process.env.TEST_MAESTRO_API_KEY,
          },
          mempool: {
            url: 'https://mempool.space/testnet/api',
          }
        }
      }}
    >
      {ui}
    </LaserEyesProvider>
  )
}

// Now you can use this in your tests
test('end-to-end test with Testnet', async () => {
  renderWithTestnet(<App />)
  
  // Your test code here
  // Note: This will require a wallet with Testnet support
  // and Testnet coins for full end-to-end testing
})`}
        fileName="testnet-testing.tsx"
        copyButton={true}
      />

      <WarningBox title="Testnet Testing Considerations" className="mt-6 mb-6">
        When testing with Testnet, keep in mind:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>You'll need a wallet that supports Testnet</li>
          <li>You'll need Testnet coins (available from faucets)</li>
          <li>Testnet can be unstable at times</li>
          <li>These tests are more like integration tests than unit tests</li>
        </ul>
      </WarningBox>

      <h2 className="text-2xl font-bold mt-8 mb-4">Mocking Data Providers</h2>
      <p className="mb-6">For testing data provider interactions, you can mock the DataSourceManager:</p>
      <CodeBlock
        language="typescript"
        code={`// Mock the DataSourceManager
jest.mock('@omnisat/lasereyes-core', () => {
  const originalModule = jest.requireActual('@omnisat/lasereyes-core')
  
  return {
    ...originalModule,
    DataSourceManager: jest.fn().mockImplementation(() => ({
      getBalance: jest.fn().mockResolvedValue('1000000'),
      getUtxos: jest.fn().mockResolvedValue([
        {
          txid: 'txid1',
          vout: 0,
          value: '500000',
          status: { confirmed: true }
        },
        {
          txid: 'txid2',
          vout: 1,
          value: '500000',
          status: { confirmed: true }
        }
      ]),
      getInscriptions: jest.fn().mockResolvedValue([
        {
          id: 'inscription1',
          number: 1,
          contentType: 'image/png',
          content: 'data:image/png;base64,...'
        }
      ]),
      getMetaBalances: jest.fn().mockImplementation((type) => {
        if (type === 'brc20') {
          return Promise.resolve([
            { ticker: 'ORDI', balance: '100' },
            { ticker: 'SATS', balance: '200' }
          ])
        } else if (type === 'runes') {
          return Promise.resolve([
            { id: 'rune1', symbol: 'RUNE1', balance: '100' }
          ])
        }
        return Promise.resolve([])
      }),
      // Add other methods as needed
    })),
  }
})`}
        fileName="mock-data-provider.ts"
        copyButton={true}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4">Testing Error Handling</h2>
      <p className="mb-6">It's important to test how your application handles errors:</p>
      <CodeBlock
        language="typescript"
        code={`// Example test for error handling
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { SendBTCForm } from '../components/SendBTCForm'

// Mock the useLaserEyes hook
jest.mock('@omnisat/lasereyes-react', () => ({
  useLaserEyes: jest.fn(),
}))

describe('SendBTCForm Error Handling', () => {
  test('displays error when transaction fails', async () => {
    // Mock the sendBTC function to throw an error
    const mockSendBTC = jest.fn().mockRejectedValue({
      code: 'INSUFFICIENT_FUNDS',
      message: 'Insufficient funds for this transaction'
    })
    
    // Set up the mock return value
    const mockUseLaserEyes = useLaserEyes as jest.Mock
    mockUseLaserEyes.mockReturnValue({
      connected: true,
      address: 'bc1qtest...',
      balance: '1000',
      sendBTC: mockSendBTC,
    })
    
    render(<SendBTCForm />)
    
    // Fill the form
    const recipientInput = screen.getByLabelText('Recipient')
    const amountInput = screen.getByLabelText('Amount')
    const sendButton = screen.getByText('Send')
    
    await userEvent.type(recipientInput, 'bc1qrecipient...')
    await userEvent.type(amountInput, '0.005')
    await userEvent.click(sendButton)
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Insufficient funds for this transaction/)).toBeInTheDocument()
    })
  })
  
  test('displays error for invalid address', async () => {
    // Mock the sendBTC function to throw an error
    const mockSendBTC = jest.fn().mockRejectedValue({
      code: 'INVALID_ADDRESS',
      message: 'Invalid Bitcoin address'
    })
    
    // Set up the mock return value
    const mockUseLaserEyes = useLaserEyes as jest.Mock
    mockUseLaserEyes.mockReturnValue({
      connected: true,
      address: 'bc1qtest...',
      balance: '1000000',
      sendBTC: mockSendBTC,
    })
    
    render(<SendBTCForm />)
    
    // Fill the form with an invalid address
    const recipientInput = screen.getByLabelText('Recipient')
    const amountInput = screen.getByLabelText('Amount')
    const sendButton = screen.getByText('Send')
    
    await userEvent.type(recipientInput, 'invalid')
    await userEvent.type(amountInput, '0.005')
    await userEvent.click(sendButton)
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid Bitcoin address/)).toBeInTheDocument()
    })
  })
})`}
        fileName="error-handling.test.tsx"
        copyButton={true}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4">Testing Best Practices</h2>
      <p className="mb-6">Follow these best practices for testing LaserEyes applications:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Test in Isolation</strong>: Use mocks to isolate components and functions
        </li>
        <li>
          <strong>Test User Flows</strong>: Focus on testing complete user flows
        </li>
        <li>
          <strong>Test Error Handling</strong>: Ensure your application handles errors gracefully
        </li>
        <li>
          <strong>Use Test Doubles</strong>: Create test doubles (mocks, stubs, fakes) for external dependencies
        </li>
        <li>
          <strong>Test Edge Cases</strong>: Test boundary conditions and edge cases
        </li>
        <li>
          <strong>Keep Tests Fast</strong>: Optimize tests for speed to encourage frequent testing
        </li>
        <li>
          <strong>Use CI/CD</strong>: Integrate tests into your CI/CD pipeline
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Testing Tools</h2>
      <p className="mb-6">Here are some recommended tools for testing LaserEyes applications:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Tool</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Jest</td>
              <td className="border p-2">Test Runner</td>
              <td className="border p-2">Running unit and integration tests</td>
            </tr>
            <tr>
              <td className="border p-2">React Testing Library</td>
              <td className="border p-2">Component Testing</td>
              <td className="border p-2">Testing React components</td>
            </tr>
            <tr>
              <td className="border p-2">Mock Service Worker</td>
              <td className="border p-2">API Mocking</td>
              <td className="border p-2">Mocking API responses</td>
            </tr>
            <tr>
              <td className="border p-2">Cypress</td>
              <td className="border p-2">End-to-End Testing</td>
              <td className="border p-2">Testing complete user flows</td>
            </tr>
            <tr>
              <td className="border p-2">Playwright</td>
              <td className="border p-2">End-to-End Testing</td>
              <td className="border p-2">Testing across multiple browsers</td>
            </tr>
            <tr>
              <td className="border p-2">Storybook</td>
              <td className="border p-2">Component Development</td>
              <td className="border p-2">Developing and testing components in isolation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Next Steps</h2>
      <p className="mb-6">Now that you understand testing strategies for LaserEyes, you can explore related topics:</p>
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
          <Link href="/docs/performance" className="text-primary hover:underline">
            Performance Optimization
          </Link>{" "}
          - Optimize your application's performance
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

