import { CodeBlock } from "@/components/code-block"
import { PackageManagerSelector } from "@/components/package-manager-selector"
import { InstallationCommand } from "@/components/installation-command"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function InstallationPage() {
  return (
    <>
      <Heading level={1}>Installation</Heading>
      <p className="text-lg mb-4">
        Getting started with LaserEyes is simple. Follow these steps to install and set up LaserEyes in your project.
      </p>

      <Heading level={2}>Package Structure</Heading>
      <p className="mb-6">
        LaserEyes is divided into multiple packages to provide flexibility and minimize bundle size:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <code>@omnisat/lasereyes-core</code> - The core functionality, framework-agnostic
        </li>
        <li>
          <code>@omnisat/lasereyes-react</code> - React-specific components and hooks
        </li>
      </ul>

      <Heading level={2}>Installation</Heading>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-muted-foreground">Select your package manager:</span>
        <PackageManagerSelector />
      </div>

      <InstallationCommand packages={["@omnisat/lasereyes-core", "@omnisat/lasereyes-react"]} />

      <Heading level={2}>Basic Setup</Heading>
      <p className="mb-6">
        After installing the packages, you need to set up the LaserEyes provider in your application.
      </p>

      <Heading level={3}>React Setup</Heading>
      <CodeBlock
        language="typescript"
        code={`import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { MAINNET } from '@omnisat/lasereyes-core'

function App() {
  return (
    <LaserEyesProvider
      config={{ network: MAINNET }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
        fileName="app.tsx"
        copyButton={true}
        className="w-full max-w-full overflow-x-auto"
      />

      <Heading level={3}>Configuration Options</Heading>
      <p className="mb-4">The LaserEyesProvider accepts a config object with the following options:</p>
      <CodeBlock
        language="typescript"
        code={`type Config = {
  network: NetworkType; // MAINNET, TESTNET, etc.
  dataSources?: {
    mempool?: {
      url: string;
    };
    sandshrew?: {
      url?: string;
      apiKey?: string;
    };
    esplora?: string;
    maestro?: {
      apiKey?: string;
    };
  };
};`}
        fileName="config.ts"
        copyButton={true}
        className="w-full max-w-full overflow-x-auto"
      />

      <Heading level={2}>Next Steps</Heading>
      <p className="mb-6">
        Now that you have installed LaserEyes, you can start using it in your application. Check out the following
        guides to learn more:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/basic-setup" className="text-primary hover:underline">
            Basic Setup
          </Link>{" "}
          - Learn how to set up LaserEyes in your application
        </li>
        <li>
          <Link href="/docs/hello-world" className="text-primary hover:underline">
            Hello World Example
          </Link>{" "}
          - A simple example to get you started
        </li>
        <li>
          <Link href="/docs/wallet-connection" className="text-primary hover:underline">
            Wallet Connection
          </Link>{" "}
          - Learn how to connect to different wallets
        </li>
      </ul>
    </>
  )
}

