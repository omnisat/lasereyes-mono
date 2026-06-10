# @omnisat/lasereyes-core

Framework-agnostic Bitcoin wallet integration for dApps. Connect to Leather,
OKX, Unisat, Xverse, OYL, Orange, Phantom and more behind one config-driven API,
with reactive state powered by [nanostores](https://github.com/nanostores/nanostores).
Pairs with `@omnisat/lasereyes-client` for blockchain data and
`@omnisat/lasereyes-react` for React bindings.

> **Status: pre-1.0.** APIs may change on any minor release until 1.0.

## Installation

```bash
npm install @omnisat/lasereyes-core @omnisat/lasereyes-client
# or: pnpm add / yarn add / bun add
```

## Mental model

LaserEyes is **config-driven**, not class-driven. You build a config value once,
then call free functions (actions) against it.

- **Config = the value bundle** — chains, connectors, backends, reactive state,
  and persisted storage, built by `createLaserEyesConfig(...)`.
- **Connectors = how a user connects** — one per wallet (`unisat()`, `leather()`,
  …). Registered connectors always surface; others appear via discovery.
- **Adapters = wallet normalizers** — translate a wallet's injected provider into
  a standard shape. Loading an adapter lets a wallet announce itself.
- **Backends = data sources** — per-network read sources (mempool, sandshrew,
  maestro) from `@omnisat/lasereyes-client`.
- **Actions = operations** — free functions like `connect(config, …)` and
  `sendBtc(config, …)`. Reads route through the backend; writes through the
  connected wallet.
- **State = reactive stores** — `config.state.$connection` and
  `config.state.$connectors`, read-only nanostores you can subscribe to.

## Quick start

```ts
import { MAINNET, TESTNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { createLaserEyesConfig } from '@omnisat/lasereyes-core'
import { initialize, connect, getAddressBalance, sendBtc } from '@omnisat/lasereyes-core/actions'
import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
import { unisat } from '@omnisat/lasereyes-core/connectors/unisat'
import { leather } from '@omnisat/lasereyes-core/connectors/leather'

// 1. Build the config once, at module scope.
const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET],
  connectors: [unisat(), leather()],
  backends: {
    mainnet: mempool(),
    testnet: mempool(),
  },
})

// 2. Load the adapters you support, then initialize (wires discovery +
//    auto-reconnect).
loadUnisatWalletAdapter()
initialize(config)

// 3. Connect and operate.
await connect(config, { connectorId: 'unisat' })

const sats = await getAddressBalance(config, 'bc1q…')
const txId = await sendBtc(config, 'bc1q…', 10_000) // 10,000 satoshis
```

### Loading every wallet at once

```ts
import { loadAllWallets } from '@omnisat/lasereyes-core'

loadAllWallets() // convenience: announces every built-in wallet that's installed
```

For the smallest bundle, load only the adapters you need from
`@omnisat/lasereyes-core/adapters/<wallet>`.

## Actions

All actions are free functions imported from `@omnisat/lasereyes-core/actions`
and take the `config` as their first argument.

| Action | Signature | Notes |
| ------ | --------- | ----- |
| `initialize` | `(config)` | Wire discovery + auto-reconnect. Call once. |
| `connect` | `(config, { connectorId })` | Connect a wallet. |
| `disconnect` | `(config)` | Disconnect the active wallet. |
| `switchNetwork` | `(config, networkId)` | Switch the active network. |
| `getAddressBalance` | `(config, address)` | Confirmed balance, in sats. |
| `getAddressUtxos` | `(config, address)` | UTXOs for an address. |
| `getRecommendedFees` | `(config)` | Fee-rate estimates. |
| `getTransaction` | `(config, txId)` | Look up a transaction. |
| `broadcastTransaction` | `(config, txHex)` | Broadcast a raw transaction. |
| `sendBtc` | `(config, to, amount, options?)` | Send BTC; returns txId. |
| `signPsbt` | `(config, psbt, options?)` | Sign a PSBT (`finalize`, `broadcast`, `inputsToSign`). |
| `signMessage` | `(config, message, options?)` | Sign a message. |
| `broadcastPsbt` | `(config, psbt)` | Finalize + broadcast a PSBT; returns txId. |

Reads fall back to the configured backend; if the connected wallet exposes a
native RPC for an operation (e.g. `bitcoin_getBalance`), that path is used first.

## Reactive state

`config.state` exposes read-only nanostores. Subscribe to react to changes:

```ts
config.state.$connection.subscribe(conn => {
  if (conn.status === 'connected') {
    // account + connector are non-null in this branch
    console.log(conn.account.getAddress(), conn.networkId)
  }
})

// Available connectors (updates as wallets announce themselves)
const connectors = config.state.$connectors.get()
```

`$connection` is a discriminated union on `status` — a `status === 'connected'`
check narrows `account` and `connector` to non-null with no cast.

## Supported wallets

Leather, OKX, OP_NET, Orange, OYL, Phantom, UniSat, Wizz, Xverse, Binance,
Keplr, Tokeo.

Each has a connector at `@omnisat/lasereyes-core/connectors/<wallet>` and an
adapter loader at `@omnisat/lasereyes-core/adapters/<wallet>`.

## Supported networks

mainnet, testnet, testnet4, signet, regtest, fractal-mainnet, fractal-testnet,
oylnet, localnet — exported as chain values (`MAINNET`, `TESTNET`, …) from
`@omnisat/lasereyes-client`.

## React

Using React? Reach for [`@omnisat/lasereyes-react`](../react), which wraps this
package with a provider and hooks (`useConnect`, `useAccount`, `useBalance`, …).

## License

MIT
