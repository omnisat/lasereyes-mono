import { Heading } from "@/components/heading"
import { CodeBlock } from "@/components/code-block"
import Link from "next/link"

export default function ExamplesPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Heading level={1} className="text-4xl font-bold mb-6">
        🔥 LaserEyes Examples 🔥
      </Heading>

      <p className="text-lg mb-6">
        Welcome to the examples section! Here you'll find practical, real-world examples of LaserEyes in action. Think
        of this as your cookbook for Bitcoin superpowers - no cape required.
      </p>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Available Examples
      </Heading>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/docs/examples/wallet-integration"
          className="block p-4 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold">💰 Wallet Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect wallets faster than you can say "not your keys, not your coins"
          </p>
        </Link>

        <Link
          href="/docs/examples/transaction-tracking"
          className="block p-4 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold">🔍 Transaction Tracking</h3>
          <p className="text-sm text-muted-foreground">Track transactions like a blockchain bloodhound</p>
        </Link>

        <Link
          href="/docs/examples/balance-dashboard"
          className="block p-4 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold">📊 Balance Dashboard</h3>
          <p className="text-sm text-muted-foreground">Build a dashboard that would make Satoshi proud</p>
        </Link>

        <Link
          href="/docs/examples/mempool-explorer"
          className="block p-4 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold">🏊‍♂️ Mempool Explorer</h3>
          <p className="text-sm text-muted-foreground">Dive into the mempool without getting wet</p>
        </Link>
      </div>

      <Heading level={2} className="text-2xl font-semibold mt-12 mb-4">
        Quick Example: Hello Bitcoin
      </Heading>

      <p className="mb-4">Here's a simple example to get you started - the "Hello World" of LaserEyes:</p>

      <CodeBlock
        code={`import { useLaserEyes } from 'laser-eyes';

export function BitcoinGreeter() {
  const { network, blockHeight } = useLaserEyes();
  
  return (
    <div>
      <h1>Hello, Bitcoin!</h1>
      <p>Connected to: {network}</p>
      <p>Current block height: {blockHeight}</p>
    </div>
  );
}`}
        language="tsx"
      />

      <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg mt-8">
        <p className="font-semibold">⚡ Pro Tip:</p>
        <p>All examples can be copied directly into your project. Just make sure you've installed LaserEyes first!</p>
      </div>
    </div>
  )
}

