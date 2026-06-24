import { Boxes, Cable, Database, Plug, Zap } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Plug,
    title: 'Multi-wallet',
    body: 'Connect Leather, OKX, Orange, OYL, UniSat, Wizz, Phantom, Xverse and more behind one API.',
  },
  {
    icon: Cable,
    title: 'Framework-agnostic core',
    body: 'A config-driven core with free-function actions and reactive nanostores state.',
  },
  {
    icon: Zap,
    title: 'Query-backed React hooks',
    body: 'Reads cache and auto-revalidate; writes refresh the affected reads for you.',
  },
  {
    icon: Database,
    title: 'Composable data client',
    body: 'Pluggable backends (mempool, Sandshrew, Maestro) you can combine or replace.',
  },
];

const packages = [
  {
    name: '@omnisat/lasereyes-core',
    body: 'Framework-agnostic wallet integration: config, connectors, adapters, actions, state.',
    href: '/docs/core/config',
  },
  {
    name: '@omnisat/lasereyes-react',
    body: 'A provider and query-backed hooks for connecting wallets and reading/writing data.',
    href: '/docs/react/connecting-wallets',
  },
  {
    name: '@omnisat/lasereyes-client',
    body: 'A composable Bitcoin data client — balances, UTXOs, fees, transactions, PSBT utils.',
    href: '/docs/client/overview',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-fd-border px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fd-border px-3 py-1 text-sm text-fd-muted-foreground">
            <Boxes className="size-4 text-orange-500" />
            Bitcoin wallet connect for Ordinal web apps
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            <span className="text-orange-500">Laser</span>Eyes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-fd-muted-foreground">
            Connect any Bitcoin wallet, read on-chain data, and sign transactions — with a
            framework-agnostic core and ergonomic React hooks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Read the docs
            </Link>
            <Link
              href="/docs/getting-started/quick-start"
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
            >
              Quick start
            </Link>
            <Link
              href="https://github.com/omnisat/lasereyes-mono"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
            >
              GitHub
            </Link>
          </div>
          <pre className="mx-auto mt-8 w-fit rounded-lg border border-fd-border bg-fd-muted/50 px-4 py-2.5 text-sm">
            <code>npm install @omnisat/lasereyes-core @omnisat/lasereyes-react</code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-fd-border p-6">
              <Icon className="size-6 text-orange-500" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-fd-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="border-t border-fd-border px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold">Packages</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {packages.map(({ name, body, href }) => (
              <Link
                key={name}
                href={href}
                className="group rounded-xl border border-fd-border p-6 transition-colors hover:border-orange-500/40"
              >
                <h3 className="font-mono text-sm font-medium group-hover:text-orange-500">{name}</h3>
                <p className="mt-2 text-sm text-fd-muted-foreground">{body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
