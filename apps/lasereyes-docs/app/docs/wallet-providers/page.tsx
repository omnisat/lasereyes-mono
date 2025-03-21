"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function WalletProvidersPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        Wallet Providers
      </Heading>
      <p className="text-lg mb-4">
        LaserEyes supports multiple Bitcoin wallet providers through a unified interface. This page documents the
        supported wallet providers and how to work with them.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Supported Wallet Providers
      </Heading>
      <p className="mb-6">LaserEyes provides built-in support for the following Bitcoin wallet providers:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Provider</th>
              <th className="border p-2 text-left">Constant</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Website</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">UniSat</td>
              <td className="border p-2">
                <code>UNISAT</code>
              </td>
              <td className="border p-2">Popular Bitcoin and Ordinals wallet</td>
              <td className="border p-2">
                <a href="https://unisat.io" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  unisat.io
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">Xverse</td>
              <td className="border p-2">
                <code>XVERSE</code>
              </td>
              <td className="border p-2">Stacks and Bitcoin wallet with Ordinals support</td>
              <td className="border p-2">
                <a href="https://xverse.app" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  xverse.app
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">OYL</td>
              <td className="border p-2">
                <code>OYL</code>
              </td>
              <td className="border p-2">Bitcoin wallet focused on Ordinals</td>
              <td className="border p-2">
                <a href="https://oyl.app" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  oyl.app
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">Leather</td>
              <td className="border p-2">
                <code>LEATHER</code>
              </td>
              <td className="border p-2">Stacks and Bitcoin wallet</td>
              <td className="border p-2">
                <a href="https://leather.io" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  leather.io
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">Magic Eden</td>
              <td className="border p-2">
                <code>MAGIC_EDEN</code>
              </td>
              <td className="border p-2">Multi-chain NFT marketplace wallet</td>
              <td className="border p-2">
                <a
                  href="https://magiceden.io"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  magiceden.io
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">OKX</td>
              <td className="border p-2">
                <code>OKX</code>
              </td>
              <td className="border p-2">Multi-chain wallet from OKX exchange</td>
              <td className="border p-2">
                <a
                  href="https://okx.com/web3"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  okx.com/web3
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">Phantom</td>
              <td className="border p-2">
                <code>PHANTOM</code>
              </td>
              <td className="border p-2">Multi-chain wallet with Bitcoin support</td>
              <td className="border p-2">
                <a href="https://phantom.app" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  phantom.app
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">Wizz</td>
              <td className="border p-2">
                <code>WIZZ</code>
              </td>
              <td className="border p-2">Bitcoin and Ordinals wallet</td>
              <td className="border p-2">
                <a href="https://wizz.wallet" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  wizz.wallet
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">Orange</td>
              <td className="border p-2">
                <code>ORANGE</code>
              </td>
              <td className="border p-2">Bitcoin wallet with Ordinals support</td>
              <td className="border p-2">
                <a href="https://orange.xyz" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  orange.xyz
                </a>
              </td>
            </tr>
            <tr>
              <td className="border p-2">OP_NET</td>
              <td className="border p-2">
                <code>OP_NET</code>
              </td>
              <td className="border p-2">Bitcoin wallet focused on OP_NET</td>
              <td className="border p-2">
                <a href="https://op.net" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  op.net
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Using Wallet Providers
      </Heading>
      <p className="mb-6">
        To use a wallet provider, you need to import the provider constant from <code>@omnisat/lasereyes-core</code>:
      </p>
      <CodeBlock
        language="typescript"
        code={`import { 
  UNISAT, 
  XVERSE, 
  OYL, 
  LEATHER, 
  MAGIC_EDEN, 
  OKX, 
  PHANTOM, 
  WIZZ, 
  ORANGE, 
  OP_NET 
} from '@omnisat/lasereyes-core'

// Connect to UniSat wallet
await client.connect(UNISAT)

// Connect to Xverse wallet
await client.connect(XVERSE)

// Connect to OYL wallet
await client.connect(OYL)`}
        fileName="using-providers.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Wallet Adapters
      </Heading>
      <p className="mb-6">
        LaserEyes uses wallet adapters to provide a consistent interface for interacting with different wallet
        providers. Each adapter implements the same interface but handles the specific requirements of its respective
        wallet.
      </p>
      <CodeBlock
        language="typescript"
        code={`// Wallet adapter interface
interface WalletAdapter {
  connect(): Promise<{ address: string; publicKey: string }>
  disconnect(): Promise<void>
  getAddress(): Promise<string>
  getPublicKey(): Promise<string>
  getBalance(): Promise<string>
  signMessage(message: string, address?: string): Promise<string>
  signPsbt(psbtHex: string, options?: SignPsbtOptions): Promise<string>
  pushPsbt(psbtHex: string): Promise<string>
  // Additional methods for specific wallet capabilities
}`}
        fileName="wallet-adapter.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Provider Detection
      </Heading>
      <p className="mb-6">You can check if a wallet provider is available in the browser:</p>
      <CodeBlock
        language="typescript"
        code={`import { isWalletAvailable } from '@omnisat/lasereyes-core'

// Check if UniSat wallet is available
const isUnisatAvailable = isWalletAvailable(UNISAT)

// Check if Xverse wallet is available
const isXverseAvailable = isWalletAvailable(XVERSE)

// Get all available wallet providers
const availableProviders = [
  UNISAT,
  XVERSE,
  OYL,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  PHANTOM,
  WIZZ,
  ORANGE,
  OP_NET
].filter(provider => isWalletAvailable(provider))`}
        fileName="provider-detection.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Provider Capabilities
      </Heading>
      <p className="mb-6">Different wallet providers have different capabilities:</p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Feature</th>
              <th className="border p-2 text-center">UniSat</th>
              <th className="border p-2 text-center">Xverse</th>
              <th className="border p-2 text-center">OYL</th>
              <th className="border p-2 text-center">Others</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Basic Bitcoin Operations</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
            </tr>
            <tr>
              <td className="border p-2">Ordinals & Inscriptions</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">Varies</td>
            </tr>
            <tr>
              <td className="border p-2">BRC-20 Tokens</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">Varies</td>
            </tr>
            <tr>
              <td className="border p-2">Runes</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">❌</td>
              <td className="border p-2 text-center">Varies</td>
            </tr>
            <tr>
              <td className="border p-2">Testnet Support</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">✅</td>
              <td className="border p-2 text-center">Varies</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Custom Wallet Adapters
      </Heading>
      <p className="mb-6">You can implement custom wallet adapters for wallets not supported by LaserEyes:</p>
      <CodeBlock
        language="typescript"
        code={`import { WalletAdapter, registerWalletAdapter } from '@omnisat/lasereyes-core'

// Define a custom wallet provider constant
export const CUSTOM_WALLET = 'custom-wallet'

// Implement the WalletAdapter interface
class CustomWalletAdapter implements WalletAdapter {
  constructor() {
    // Initialize your wallet adapter
  }

  // Implement required methods
  async connect(): Promise<{ address: string; publicKey: string }> {
    // Implement connection logic
    const address = await window.customWallet.getAddress()
    const publicKey = await window.customWallet.getPublicKey()
    return { address, publicKey }
  }

  async disconnect(): Promise<void> {
    // Implement disconnection logic
    await window.customWallet.disconnect()
  }

  // Implement other required methods...
}

// Register your custom wallet adapter
registerWalletAdapter(CUSTOM_WALLET, () => new CustomWalletAdapter())

// Now you can use your custom wallet provider
await client.connect(CUSTOM_WALLET)`}
        fileName="custom-adapter.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Error Handling
      </Heading>
      <p className="mb-6">When working with wallet providers, you should handle various error scenarios:</p>
      <CodeBlock
        language="typescript"
        code={`try {
  await client.connect(UNISAT)
} catch (error) {
  if (error.code === 'WALLET_NOT_FOUND') {
    console.error('UniSat wallet extension not found')
    // Prompt user to install the wallet
    window.open('https://unisat.io/download', '_blank')
  } else if (error.code === 'USER_REJECTED') {
    console.error('User rejected the connection request')
    // Handle user rejection gracefully
  } else if (error.code === 'NETWORK_MISMATCH') {
    console.error('Wallet is on a different network')
    // Prompt user to switch networks
  } else {
    console.error('Connection failed:', error.message)
  }
}`}
        fileName="error-handling.ts"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">Here are some best practices for working with wallet providers:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Check availability</strong> before attempting to connect to a wallet provider
        </li>
        <li>
          <strong>Provide fallback options</strong> if the user's preferred wallet is not available
        </li>
        <li>
          <strong>Handle connection errors</strong> gracefully and provide helpful error messages
        </li>
        <li>
          <strong>Remember the user's preferred wallet</strong> for a better user experience
        </li>
        <li>
          <strong>Test with multiple wallets</strong> to ensure compatibility
        </li>
        <li>
          <strong>Stay updated</strong> with wallet provider changes and updates
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">Now that you understand wallet providers, you can explore related topics:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/laser-eyes-client" className="text-primary hover:underline">
            LaserEyesClient
          </Link>{" "}
          - Learn more about the central client
        </li>
        <li>
          <Link href="/docs/wallet-connection" className="text-primary hover:underline">
            Wallet Connection
          </Link>{" "}
          - Explore wallet connection examples
        </li>
        <li>
          <Link href="/docs/transaction-types" className="text-primary hover:underline">
            Transaction Types
          </Link>{" "}
          - Learn about different transaction types
        </li>
        <li>
          <Link href="/docs/security" className="text-primary hover:underline">
            Security Considerations
          </Link>{" "}
          - Understand security best practices
        </li>
      </ul>
    </>
  )
}

