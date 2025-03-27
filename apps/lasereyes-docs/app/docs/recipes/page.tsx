import { Heading } from "@/components/heading"
import Link from "next/link"

export default function RecipesPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Heading level={1} className="text-4xl font-bold mb-6">
        🍳 LaserEyes Recipes
      </Heading>

      <p className="text-lg mb-6">
        Welcome to the LaserEyes recipe book! Here you'll find complete solutions for common Bitcoin app scenarios.
        These recipes are like TV dinners, but for code - just heat and serve!
      </p>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Available Recipes
      </Heading>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/docs/recipes/bitcoin-donation-page"
          className="block p-6 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold text-xl mb-2">🎁 Bitcoin Donation Page</h3>
          <p className="text-muted-foreground mb-4">Create a donation page that accepts Bitcoin payments</p>
          <span className="text-sm px-2 py-1 bg-green-100 dark:bg-green-900 rounded">Beginner Friendly</span>
        </Link>

        <Link
          href="/docs/recipes/transaction-history"
          className="block p-6 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold text-xl mb-2">📜 Transaction History</h3>
          <p className="text-muted-foreground mb-4">Build a complete transaction history viewer</p>
          <span className="text-sm px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded">Intermediate</span>
        </Link>

        <Link
          href="/docs/recipes/multi-wallet-dashboard"
          className="block p-6 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold text-xl mb-2">🏦 Multi-Wallet Dashboard</h3>
          <p className="text-muted-foreground mb-4">Create a dashboard to monitor multiple Bitcoin wallets</p>
          <span className="text-sm px-2 py-1 bg-red-100 dark:bg-red-900 rounded">Advanced</span>
        </Link>

        <Link
          href="/docs/recipes/lightning-integration"
          className="block p-6 border rounded-lg hover:bg-muted transition-colors"
        >
          <h3 className="font-bold text-xl mb-2">⚡ Lightning Integration</h3>
          <p className="text-muted-foreground mb-4">Add Lightning Network support to your LaserEyes app</p>
          <span className="text-sm px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded">Experimental</span>
        </Link>
      </div>

      <Heading level={2} className="text-2xl font-semibold mt-12 mb-4">
        How to Use These Recipes
      </Heading>

      <p className="mb-4">Each recipe includes:</p>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>A complete working solution for a specific use case</li>
        <li>Step-by-step explanations of how everything works</li>
        <li>Customization options to adapt the recipe to your needs</li>
        <li>Tips for production deployment</li>
      </ul>

      <p className="mb-4">Think of these recipes as starting points - feel free to add your own special sauce!</p>

      <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg mt-8">
        <p className="font-semibold">🔥 Hot Tip:</p>
        <p>
          The best Bitcoin apps are like good pizza - they have a clean UI, deliver value quickly, and don't require a
          PhD to understand. Keep it simple!
        </p>
      </div>
    </div>
  )
}

