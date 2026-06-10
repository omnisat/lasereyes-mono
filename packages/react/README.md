# @omnisat/lasereyes-react

React bindings for [`@omnisat/lasereyes-core`](../core) — a provider, typed
hooks, and wallet icon components for integrating Bitcoin wallets into React
apps. The hooks are query-backed: reads cache and auto-revalidate, and writes
refresh the relevant reads for you.

> **Status: pre-1.0.** APIs may change on any minor release until 1.0.

## Installation

```bash
npm install @omnisat/lasereyes-react @omnisat/lasereyes-core @omnisat/lasereyes-client
# or: pnpm add / yarn add / bun add
```

This package re-exports the full `@omnisat/lasereyes-core` surface, so you can
import config helpers, constants, and types straight from
`@omnisat/lasereyes-react`.

## Setup

Build a config once (outside React, so its identity is stable), then wrap your
app with `LaserEyesProvider`. The provider owns the `initialize`/`dispose`
lifecycle — don't call `initialize` yourself.

```tsx
import { MAINNET, TESTNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { createLaserEyesConfig } from '@omnisat/lasereyes-core'
import { unisat } from '@omnisat/lasereyes-core/connectors/unisat'
import { leather } from '@omnisat/lasereyes-core/connectors/leather'
import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'

const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET],
  connectors: [unisat(), leather()],
  backends: { mainnet: mempool(), testnet: mempool() },
})

loadUnisatWalletAdapter() // load the adapters you support

export function App() {
  return (
    <LaserEyesProvider config={config}>
      <WalletUI />
    </LaserEyesProvider>
  )
}
```

## Hooks

### Connection & account

```tsx
import {
  useConnect,
  useConnectors,
  useDisconnect,
  useAccount,
  useStatus,
  useNetwork,
} from '@omnisat/lasereyes-react'

function WalletUI() {
  const status = useStatus()
  const account = useAccount()
  const connectors = useConnectors()
  const { connect, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { network, chains, switchNetwork } = useNetwork()

  if (account.status === 'connected') {
    // Connected branch: addresses and connector are non-null without a check.
    return (
      <div>
        <p>Payment: {account.paymentAddress}</p>
        <p>Ordinals: {account.ordinalsAddress}</p>
        <p>Network: {network}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map(c => (
        <button key={c.id} disabled={!c.isReady() || isPending} onClick={() => connect(c.id)}>
          Connect {c.name}
        </button>
      ))}
      {error && <p>Connect failed: {error.message}</p>}
    </div>
  )
}
```

`useAccount()` returns a discriminated union on `status`: when
`status === 'connected'`, `paymentAddress`, `publicKey`, and `connector` are
guaranteed present.

### Reads (cached, auto-revalidating)

```tsx
import { useBalance, useUtxos, useFeeRates, useTransaction } from '@omnisat/lasereyes-react'

function Reads({ address }: { address: string }) {
  const { data: balance, status } = useBalance(address)
  const utxos = useUtxos(address)       // paginated: utxos.items, utxos.fetchNextPage()
  const fees = useFeeRates()            // fees.data?.fastFee

  if (status === 'loading') return <p>Loading…</p>
  return <p>{balance} sats</p>
}
```

Read hooks accept an options bag — e.g. `useBalance(address, { chainId, enabled })`
— to scope to a network or pause fetching.

### Writes (revalidate affected reads)

```tsx
import { useSendBitcoin, useSignMessage, useSignPsbt } from '@omnisat/lasereyes-react'

function Send() {
  const send = useSendBitcoin()

  return (
    <button
      disabled={send.isLoading}
      onClick={() => send.sendBitcoin({ to: 'bc1q…', amount: 10_000 })}
    >
      Send · {send.status} {send.txId}
    </button>
  )
}
```

Other write hooks: `useSignMessage`, `useSignPsbt`, `useBroadcastPsbt`,
`useBroadcastTransaction`. After a successful send, balance and UTXO reads
revalidate automatically.

### Full hook list

`useConnect` · `useDisconnect` · `useConnectors` · `useConnector` · `useAccount`
· `useStatus` · `useNetwork` · `useConfig` · `useBalance` · `useUtxos` ·
`useFeeRates` · `useTransaction` · `useSendBitcoin` · `useSignMessage` ·
`useSignPsbt` · `useBroadcastPsbt` · `useBroadcastTransaction`

## Typed config (optional)

Register your config's type once and the context-driven hooks narrow `network` /
`chainId` to your configured chains — no need to pass `{ config }` on every call.

```ts
declare module '@omnisat/lasereyes-react' {
  interface Register {
    config: typeof config
  }
}
```

## Wallet icons

SVG wallet icons are exported as React components:

```tsx
import { UnisatLogo, WalletIcon, UNISAT, XVERSE } from '@omnisat/lasereyes-react'

// A specific logo
<UnisatLogo size={42} />

// Or resolve by wallet name
{[UNISAT, XVERSE].map(name => (
  <WalletIcon key={name} walletName={name} size={42} />
))}
```

## Next.js

Hooks and the provider carry the `'use client'` directive, so they work in the
App Router. Keep the `createLaserEyesConfig(...)` call in a client module.

## License

MIT
