"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { WarningBox } from "@/components/warning-box"
import { Heading } from "@/components/heading"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, Bug, Beaker, FlaskConical, Microscope, Workflow, Blocks, Gauge } from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

function TestingContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Testing Challenges</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Bug}
            title="Wallet Dependencies"
            description="Tests need to interact with wallet extensions and handle complex wallet state management."
          />
          <FeatureCard
            icon={Blocks}
            title="Blockchain Interactions"
            description="Tests may need to interact with the blockchain and handle network variability."
          />
          <FeatureCard
            icon={Gauge}
            title="Network Variability"
            description="Blockchain networks can have variable performance and response times."
          />
          <FeatureCard
            icon={FlaskConical}
            title="Test Environment"
            description="Setting up a proper test environment requires careful configuration and mocking."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Testing Approaches</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-green-500">Unit Testing</Badge>
              <h3 className="text-lg font-semibold">Component Testing</h3>
              <p className="mt-2 text-sm text-muted-foreground">Test individual functions and components in isolation</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-blue-500">Integration</Badge>
              <h3 className="text-lg font-semibold">Integration Testing</h3>
              <p className="mt-2 text-sm text-muted-foreground">Test interactions between components</p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-6">
              <Badge variant="default" className="mb-2 bg-orange-500">E2E</Badge>
              <h3 className="text-lg font-semibold">End-to-End Testing</h3>
              <p className="mt-2 text-sm text-muted-foreground">Test complete user flows on testnet</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Unit Testing</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Example Unit Test</h2>
          </CardHeader>
          <CardContent className="p-6">
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
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Mocking LaserEyes</h2>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Mock Setup</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`// Create a mock for useLaserEyes hook
jest.mock('@kevinoyl/lasereyes-react', () => ({
  useLaserEyes: () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
    address: '',
    balance: '0',
    sendBTC: jest.fn(),
    getInscriptions: jest.fn(),
    getMetaBalances: jest.fn(),
  }),
  LaserEyesProvider: ({ children }) => children,
}))`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Component Test</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`describe('WalletConnect', () => {
  test('renders connect button when not connected', () => {
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
})`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Testing with Testnet</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <WarningBox title="Testnet Testing Considerations" className="mb-6">
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You'll need a wallet that supports Testnet</li>
                <li>You'll need Testnet coins (available from faucets)</li>
                <li>Testnet can be unstable at times</li>
                <li>These tests are more like integration tests than unit tests</li>
              </ul>
            </WarningBox>
            <CodeBlock
              language="typescript"
              code={`// Configure LaserEyes to use Testnet for testing
import { LaserEyesProvider } from '@kevinoyl/lasereyes-react'
import { TESTNET } from '@kevinoyl/lasereyes-core'

const renderWithTestnet = (ui) => {
  return render(
    <LaserEyesProvider
      config={{ 
        network: TESTNET,
        dataSources: {
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
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Testing Tools</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={TestTube}
            title="Jest"
            description="Popular testing framework for running unit and integration tests with excellent mocking capabilities."
          />
          <FeatureCard
            icon={Beaker}
            title="React Testing Library"
            description="Testing utilities that encourage good testing practices by working with actual DOM nodes."
          />
          <FeatureCard
            icon={Microscope}
            title="Mock Service Worker"
            description="API mocking library that lets you capture and mock network requests."
          />
          <FeatureCard
            icon={Workflow}
            title="Cypress"
            description="End-to-end testing framework that makes it easy to set up, write, and debug tests."
          />
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/docs/error-handling" className="block">
                <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
                    <p className="text-sm text-muted-foreground">Learn how to handle errors effectively in your tests</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/docs/best-practices" className="block">
                <Card className="h-full transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
                    <p className="text-sm text-muted-foreground">Discover testing best practices for LaserEyes applications</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function TestingPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Testing</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Testing LaserEyes Apps
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Learn how to effectively test your LaserEyes applications with comprehensive testing strategies and best practices.
        </p>
      </div>

      <ClientPageWrapper>
        <TestingContent />
      </ClientPageWrapper>
    </div>
  )
}

