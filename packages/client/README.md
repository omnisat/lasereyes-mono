# @omnisat/lasereyes-client

A modern, composable Bitcoin data client for runes, BRC-20, alkanes, and
inscriptions — built around small, tree-shakeable action groups you compose onto
a client. Framework-agnostic; pairs with `@omnisat/lasereyes-core` for wallet
integration and `@omnisat/lasereyes-react` for React bindings.

> **Status: pre-1.0.** APIs may change on any minor release until 1.0.

## Installation

```bash
npm install @omnisat/lasereyes-client
# or: pnpm add / yarn add / bun add
```

Peer-ish deps `@scure/btc-signer` and `@scure/base` are used for PSBT and
address operations.

## Mental model

- **Actions = data operations** — methods that talk to the blockchain (reads
  and, for wallet clients, writes).
- **Utils = pure functions** — PSBT builders, address helpers, conversions. No
  I/O.
- **Account = data container** — addresses and public keys, no signing logic.
- **Signer = signing capability** — optional, injected into a wallet client.
- **Backend = data source** — a per-network capability bundle (mempool,
  sandshrew, maestro, or your own).
- **Client = orchestrator** — `createClient(...).extend(actions)`; each
  `extend` adds a typed action group, and the type system tracks which
  capabilities the backend must provide.

## Base client (read-only)

```ts
import { createClient, publicActions, combineBackends, MAINNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { sandshrew } from '@omnisat/lasereyes-client/backends/sandshrew'

// Backend factories resolve against a network. Here: sandshrew primary (full
// protocol coverage), mempool fallback for base BTC reads.
const backend = combineBackends(sandshrew({ apiKey: '…' }), mempool())(MAINNET)

const client = createClient({ network: MAINNET, backend }).extend(publicActions())

const balance = await client.getAddressBalance('bc1q…')
const utxos = await client.getAddressUtxos('bc1q…')
```

> A single backend works too: `const backend = mempool()(MAINNET)`.

## Wallet client (account-aware)

```ts
import { MAINNET } from '@omnisat/lasereyes-client'
import {
  createWalletClient,
  createWalletAccount,
  walletBtcActions,
} from '@omnisat/lasereyes-client/wallet'

const account = createWalletAccount({
  addresses: [
    { address: 'bc1q…', purpose: 'payment', type: AddressType.P2WPKH },
    { address: 'bc1p…', purpose: 'ordinals', type: AddressType.P2TR },
  ],
  publicKeys: { payment: '02…', ordinals: '03…', taproot: '03…' },
})

const wallet = createWalletClient({ network: MAINNET, backend, account, signer })
  .extend(walletBtcActions())

await wallet.sendBtc({ to: 'bc1q…', amount: 10_000 })
await wallet.signPsbt(psbtHex, { finalize: true })
```

## Utilities (pure, no I/O)

```ts
import { getAddressType } from '@omnisat/lasereyes-client/utils'

const type = getAddressType('bc1q…')
```

## Subpath exports

| Subpath                          | Contents                                              |
| -------------------------------- | ----------------------------------------------------- |
| `.`                              | Base client, `publicActions`, chains, errors, types   |
| `./wallet`                       | Wallet client, accounts, `walletBtcActions`           |
| `./utils`                        | Pure helpers (address utils, conversions)             |
| `./backends`                     | Backend primitives + vendor capability factories      |
| `./backends/mempool`             | mempool.space backend                                 |
| `./backends/sandshrew`           | Sandshrew backend                                     |
| `./backends/maestro`             | Maestro backend                                       |

## Networks

mainnet, testnet, testnet4, signet, regtest, fractal-mainnet, fractal-testnet,
oylnet, localnet — see `NETWORKS` / `defineChain`.

## Not yet exported

Protocol action groups for **runes, brc20, inscriptions, and alkanes** are
designed and scaffolded under `src/actions/<proto>` but deferred from the public
API pending implementation of their write paths. See
[`FUTURE-IMPROVEMENTS.md`](./FUTURE-IMPROVEMENTS.md) for the re-introduction plan
(runes first). The protocol **domain types** and **capability interfaces** are
exported from the main entry today (they're needed to type backends).

## Type-inference contract

`src/__tests__/type-inference.test-d.ts` is the binding type-level contract for
this package. Any change to a public type or signature must come with a matching
update there. See the repo-root `MENTAL-MODEL.md` §8.
