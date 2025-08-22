'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/code-block'
import { FeatureCard } from '@/components/feature-card'
import { DataSourceCard } from '@/components/data-source-card'
import { DataSourcePlayground } from '@/components/data-source-playground'
import { WalletCard } from '@/components/wallet-card'
import { WalletConnectCard } from '@/components/wallet-connect-card'
import { WarningBox } from '@/components/warning-box'
import {
  Bitcoin,
  Wallet,
  Zap,
  Shield,
  Code,
  Layers,
  ArrowRight,
} from 'lucide-react'
// Add the import at the top with other imports
import {
  LaserEyesLogo,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OP_NET,
  ORANGE,
  OYL,
  PHANTOM,
  UNISAT,
  WIZZ,
  XVERSE,
} from '@kevinoyl/lasereyes-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with max width constraint */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-b bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-4 max-w-3xl mx-auto lg:mx-0 px-4 md:px-8 lg:px-12">
                <div className="space-y-2">
                  <div className="flex flex-col items-center lg:items-start pl-0 md:pl-4 lg:pl-6">
                    <LaserEyesLogo width={96} color={'red'} className="mb-4" />
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-center lg:text-left">
                      <span className="gradient-text">
                        Seamless Bitcoin Wallet Integration
                      </span>
                    </h1>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-center lg:text-left">
                    Supercharge your dApp with one powerful library
                  </p>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl text-center lg:text-left">
                    Connect to any Bitcoin wallet, handle transactions, and work
                    with Ordinals & BRC-20 tokens with just a few lines of code.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg">
                    <Link href="/docs/installation">Get Started</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link
                      href="https://github.com/omnisat/lasereyes-mono"
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-[500px]">
                  <WalletConnectCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="w-full py-12 md:py-24 border-b bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Supported By
              </h2>
            </div>
            <div className="mx-auto flex flex-flow flex-wrap  gap-8 items-center justify-center py-8 md:py-12 max-w-4xl">
              <Link
                href="https://www.gomaestro.org/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/maestro-light.svg"
                  alt="Magic Eden"
                  className="h-8 md:h-10 hidden dark:block"
                />
                <img
                  src="/maestro-dark.svg"
                  alt="Magic Eden"
                  className="h-8 md:h-10 dark:hidden"
                />
              </Link>
              <Link
                href="https://oyl.io/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/oyl-light.svg"
                  alt="oyl"
                  className="h-8 md:h-10 hidden dark:block"
                />
                <img
                  src="/oyl-dark.svg"
                  alt="oyl"
                  className="h-8 md:h-10 dark:hidden"
                />
              </Link>
              <Link
                href="https://www.trio.xyz/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/trio-light.svg"
                  alt="trio"
                  className="h-8 md:h-10 hidden dark:block"
                />
                <img
                  src="/trio-dark.svg"
                  alt="trio"
                  className="h-8 md:h-10 dark:hidden"
                />
              </Link>
              <Link
                href="https://layer1.foundation/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/l1f-light.svg"
                  alt="level 1 foundation"
                  className="h-8 md:h-10 hidden dark:block"
                />
                <img
                  src="/l1f-dark.svg"
                  alt="level 1 foundation"
                  className="h-8 md:h-10 dark:hidden"
                />
              </Link>
              <Link
                href="https://www.seizectrl.io/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/ctrl-light.svg"
                  alt="seize ctrl"
                  className="h-10 md:h-16 hidden dark:block"
                />
                <img
                  src="/ctrl-dark.svg"
                  alt="seize ctrl"
                  className="h-10 md:h-16 dark:hidden"
                />
              </Link>
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/utxo-light.svg"
                  alt="UTXO"
                  className="h-10 md:h-16 hidden dark:block"
                />
                <img
                  src="/utxo-dark.svg"
                  alt="UTXO"
                  className="h-10 md:h-16 dark:hidden"
                />
              </Link>
              <Link
                href="https://www.blifeprotocol.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/blife-light.svg"
                  alt="BLife Protocol"
                  className="h-24 md:h-24 hidden dark:block"
                />
                <img
                  src="/blife-dark.svg"
                  alt="BLife Protocol"
                  className="h-24 md:h-24 dark:hidden"
                />
              </Link>
              <Link
                href="https://leather.io"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/leather-light.svg"
                  alt="Leather"
                  className="h-8 md:h-10 hidden dark:block"
                />
                <img
                  src="/leather-dark.svg"
                  alt="Leather"
                  className="h-8 md:h-10 dark:hidden"
                />
              </Link>
              <Link
                href="https://emblem.vision/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
              >
                <img
                  src="/emblem-light.svg"
                  alt="Emblem Vision"
                  className="h-8 md:h-10 hidden dark:block"
                />
                <img
                  src="/emblem-dark.svg"
                  alt="Emblem Vision"
                  className="h-8 md:h-10 dark:hidden"
                />
              </Link>
            </div>
            <div className="flex justify-center mt-8">
              <Button asChild size="lg" className="group">
                <Link
                  href="https://github.com/sponsors/omnisat"
                  target="_blank"
                  rel="noreferrer"
                >
                  Become a Sponsor
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                  Quick Start Guide
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Quick Start
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get up and running with LaserEyes in minutes
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12">
              <div className="space-y-4 min-w-0">
                <h3 className="text-xl font-bold">Installation</h3>
                <CodeBlock
                  language="bash"
                  code={`npm install @kevinoyl/lasereyes-core @kevinoyl/lasereyes-react`}
                  copyButton={true}
                />
                <h3 className="text-xl font-bold mt-8">Basic Setup</h3>
                <CodeBlock
                  language="typescript"
                  code={`import {
  LaserEyesProvider,
  useLaserEyes,
  MAINNET,
  OYL,
} from "@kevinoyl/lasereyes";

function App() {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      <WalletConnect />
    </LaserEyesProvider>
  );
}

function WalletConnect() {
  const { connect, disconnect, connected, address } = useLaserEyes();

  const connectWallet = async () => {
    try {
      await connect(OYL);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
`}
                  fileName="wallet-connect.tsx"
                  copyButton={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create LaserEyes Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                  Scaffold Your Project
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Create LaserEyes App
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get started with a fully configured Bitcoin dApp in seconds
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12">
              <div className="space-y-8 min-w-0">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Create a New Project</h3>
                  <CodeBlock
                    language="bash"
                    code={`npx create-lasereyes`}
                    copyButton={true}
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
                    <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                    <h4 className="mb-2 text-lg font-semibold">Modern Stack</h4>
                    <p className="text-sm text-muted-foreground">
                      Next.js 14+, React 18, TypeScript, and Tailwind CSS
                      pre-configured
                    </p>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
                    <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                    <h4 className="mb-2 text-lg font-semibold">
                      Wallet Integration
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Pre-built wallet connection modal and components ready to
                      use
                    </p>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
                    <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                    <h4 className="mb-2 text-lg font-semibold">
                      Best Practices
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Security, performance, and accessibility best practices
                      included
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Project Structure</h3>
                  <CodeBlock
                    language="bash"
                    code={`my-lasereyes-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout with providers
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   └── wallet/      # Wallet integration components
│   └── lib/
│       └── utils.ts     # Utility functions
└── package.json`}
                    copyButton={true}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/docs/create-lasereyes">
                  Learn more about create-lasereyes
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                Powerful Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight max-w-[800px]">
                Everything you need to build powerful Bitcoin web applications
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                LaserEyes provides a comprehensive toolkit for Bitcoin
                developers
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Multi-Wallet Support"
                description="Connect to multiple Bitcoin wallets with a unified API, including UniSat, Xverse, OYL, and more."
                icon={Wallet}
              />
              <FeatureCard
                title="Ordinals & Inscriptions"
                description="Full support for Bitcoin Ordinals, inscriptions, and BRC-20 tokens with simple, intuitive methods."
                icon={Bitcoin}
              />
              <FeatureCard
                title="DataSource Abstraction"
                description="Switch between different Bitcoin data providers seamlessly with our DataSource system."
                icon={Layers}
              />
              <FeatureCard
                title="TypeScript Support"
                description="First-class TypeScript support with comprehensive type definitions for a better developer experience."
                icon={Code}
              />
              <FeatureCard
                title="Performance Optimized"
                description="Built with performance in mind, ensuring your dApps remain fast and responsive."
                icon={Zap}
              />
              <FeatureCard
                title="Security Focused"
                description="Security best practices baked in, with careful handling of sensitive operations."
                icon={Shield}
              />
            </div>

            <div className="mt-12 flex justify-center">
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/docs/core-api-reference">
                  Explore all features
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Data Source Manager Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                  Data Providers
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Data Source Manager
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LaserEyes integrates with leading Bitcoin data providers
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <DataSourceCard
                name="Maestro"
                description="A powerful Bitcoin API with comprehensive support for Ordinals, inscriptions, and more."
                url="https://www.gomaestro.org/"
              />
              <DataSourceCard
                name="Sandshrew"
                description="Fast and reliable Bitcoin data indexing service with excellent developer experience."
                url="https://sandshrew.io/"
              />
              <DataSourceCard
                name="Mempool.space"
                description="Open-source explorer and API for the Bitcoin mempool and network."
                url="https://mempool.space/"
              />
            </div>
            <div className="mx-auto max-w-5xl space-y-8">
              <WarningBox title="Production API Keys Warning">
                The API keys included with LaserEyes are intended for
                development purposes only. For production applications, please
                register for your own API keys with Maestro and/or Sandshrew to
                ensure reliable service and avoid rate limiting issues.
              </WarningBox>

              <DataSourcePlayground />
            </div>
          </div>
        </div>
      </section>

      {/* Supported Wallets Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                  Wallet Integration
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Supported Wallets
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Connect with all major Bitcoin wallets
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              <WalletCard name="UniSat" provider={UNISAT} />
              <WalletCard name="Xverse" provider={XVERSE} />
              <WalletCard name="OYL" provider={OYL} />
              <WalletCard name="Leather" provider={LEATHER} />
              <WalletCard name="Magic Eden" provider={MAGIC_EDEN} />
              <WalletCard name="OKX" provider={OKX} />
              <WalletCard name="Phantom" provider={PHANTOM} />
              <WalletCard name="Wizz" provider={WIZZ} />
              <WalletCard name="Orange" provider={ORANGE} />
              <WalletCard name="OP_NET" provider={OP_NET} />
            </div>
          </div>
        </div>
      </section>

      {/* Framework Support Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
                  Multi-Framework
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Framework Support
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Use LaserEyes with your favorite frameworks
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 flex flex-col items-center space-y-3">
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                <LaserEyesLogo width={48} color={'blue'} className="mb-1" />
                <h3 className="text-xl font-bold">Core</h3>
                <p className="text-center text-muted-foreground">
                  Framework-agnostic implementation for maximum flexibility
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 flex flex-col items-center space-y-3">
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                <svg
                  viewBox="0 0 24 24"
                  className="h-12 w-12 text-primary"
                  fill="currentColor"
                >
                  <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.93zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.447-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
                </svg>
                <h3 className="text-xl font-bold">React</h3>
                <p className="text-center text-muted-foreground">
                  React hooks and components for seamless integration
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 flex flex-col items-center space-y-3">
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                <svg
                  viewBox="0 0 24 24"
                  className="h-12 w-12 text-primary"
                  fill="currentColor"
                >
                  <path d="M12 1.3l9 5.2v11l-9 5.2-9-5.2v-11l9-5.2M12 0L1.6 6v12L12 24l10.4-6V6L12 0z" />
                  <path
                    d="M12 2.4l8.1 4.7v9.8l-8.1 4.7-8.1-4.7V7.1L12 2.4M12 0L1.6 6v12L12 24l10.4-6V6L12 0z"
                    fill="none"
                  />
                  <path d="M12 4.3L4.4 8.6l7.6 4.2 7.6-4.2L12 4.3z" />
                  <path d="M4.4 15.4l7.6 4.2v-8.5L4.4 7v8.5z" />
                  <path d="M19.6 15.4l-7.6 4.2v-8.5l7.6-4.2v8.5z" />
                  <path d="M4.4 7l7.6 4.2L19.6 7 12 2.8 4.4 7z" fill="none" />
                </svg>
                <h3 className="text-xl font-bold">Angular</h3>
                <p className="text-center text-muted-foreground">
                  Angular services and directives for enterprise apps
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 flex flex-col items-center space-y-3">
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                <svg
                  viewBox="0 0 24 24"
                  className="h-12 w-12 text-primary"
                  fill="currentColor"
                >
                  <path
                    d="M19.197 1.608l.003-.006h-7.46L8.85 6.392l5.4 9.357 7.772-13.526a.795.795 0 0 0-.819-1.21l-2.006.595z"
                    fill="currentColor"
                  />
                  <path
                    d="M3.004 2.616L.19 7.254a.823.823 0 0 0 .376 1.1l12.75 7.352 2.855-4.953-9.68-8.478-3.485.341z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                  <path
                    d="M3.925 2.373L14.07 16.486 8.83 6.39 3.925 2.373z"
                    fill="currentColor"
                    opacity="0.5"
                  />
                </svg>
                <h3 className="text-xl font-bold">Vue</h3>
                <p className="text-center text-muted-foreground">
                  Vue composables and components for reactive applications
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 flex flex-col items-center space-y-3">
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl filter group-hover:bg-primary/20 group-hover:blur-3xl" />
                <div className="h-12 w-12 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">+</span>
                </div>
                <h3 className="text-xl font-bold">Coming Soon</h3>
                <p className="text-center text-muted-foreground">
                  Support for more frameworks on the way
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to build with LaserEyes?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Start integrating Bitcoin wallets into your web applications
                  today
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/docs/installation">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link
                    href="https://github.com/omnisat/lasereyes-mono"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <LaserEyesLogo width={24} color={'yellow'} className="mr-1" />
                <span className="font-bold text-lg">
                  <span className="text-primary">Laser</span>Eyes
                </span>
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} OmniSat. All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Link
                  href="https://github.com/omnisat/lasereyes-mono"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </Link>
                <Link
                  href="https://www.npmjs.com/package/@kevinoyl/lasereyes"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  NPM
                </Link>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
