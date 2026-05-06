# Mental Model — `major-refactor`

This document captures the architectural intent behind the in-progress refactor on
the `major-refactor` branch. It exists so that, no matter what state the working
tree is in, we can recover the *shape* we're heading toward.

## TL;DR

We are porting **viem + wagmi + EIP-1193 + EIP-6963** to Bitcoin, specialized for
Bitcoin's address/PSBT/BIP-322 semantics.

The shift, in one line:

> **"objects-with-methods that mutate shared state" → "values + free functions
> composed through typed builders"**.

## Where we came from

The committed baseline (HEAD `0397a17`) was a textbook OO god-class architecture.

- **`LaserEyesClient`** (821 lines) eagerly instantiated 14 wallet provider
  classes, owned a `DataSourceManager` singleton, and exposed ~50 methods. Each
  method's pattern was: `lookup provider in $providerMap → try/catch on
  "not implemented" string`.
- **`WalletProvider`** (abstract base) held a backref to its parent
  `LaserEyesClient`, mutated the parent's nanostore, and called the singleton
  `DataSourceManager`. Tri-directional coupling: provider ↔ client ↔ data
  sources.
- **`DataSourceManager`** (635 lines, singleton) eagerly built mempool +
  sandshrew + maestro. Internal "find a source that implements this" fallback.
  `updateNetwork()` mutated internal state.
- **State** was a single flat `MapStore<LaserEyesStoreType>` with 11 fields:
  `provider`, `address`, `paymentAddress`, `publicKey`, `paymentPublicKey`,
  `balance`, `accounts`, `connected`, `isConnecting`, `isInitializing`,
  `hasProvider`.
- **Discovery** used a `MutationObserver` DOM-shake hack to detect when wallet
  injections appeared on `window`.
- **API style**: positional/options overloads, `error.message.includes('not
  implemented')` for capability discrimination, no type-level capabilities.

## Where we're going

Three independent axes, composed at runtime:

```
Chain          (value)        — the network identity
Transport      (capabilities) — how to talk to the chain (the data sources)
Wallet         (lifecycle)    — Connector → Adapter → BitcoinProvider
                                          → Account + Signer

Client       = Chain × Transport
WalletClient = Client × Account × Signer
Action       = (Client, args) → Promise<T>
Config       = Chain[] × Connector[] × Transport[][]   ← the wagmi-shaped registry
```

Every public symbol falls into exactly one of:
**chain, transport, connector, adapter, account, signer, client, action, config**.

No "manager". No "module". No "client god-class". That is the test for whether
something belongs in the public API.

## Inspirations, mapped

### viem — the typed client + actions layer

| viem | LaserEyes |
|---|---|
| `createClient({ transport, chain }).extend(actions)` | `createClient({ network, dataSource }).extend(actions)` |
| `createWalletClient({ account, transport })` | `createWalletClient({ account, dataSource, network })` |
| `publicActions()`, `walletActions()` factories | `publicActions()` / `walletBtcActions()`, `signingActions(signer)` |
| `fallback([alchemy(), infura()])` (transport-level) | `mergeDataSources(primary, secondary)` |
| `Client<Transport, Chain, Account, RpcSchema, Extended>` accumulating via `.extend()` | `Client<Config, dsMethods, clientActions>` accumulating via `.extend()` |
| `LocalAccount` / `JsonRpcAccount` | `WalletAccount` / `ReadOnlyAccount` |

### wagmi — the connector + config + state layer

| wagmi | LaserEyes |
|---|---|
| `createConfig({ chains, connectors, transports })` | `createLaserEyesConfig({ chains, connectors, transports })` |
| `Connector` interface | `Connector` interface (near-identical) |
| `CreateConnectorFn = (config) => Connector` | `CreateConnectorFn = (config) => Connector` |
| Reconnect-on-mount via storage | `autoReconnect` |
| `useConnectors()` listing announced wallets | `$connectors` MapStore |

### EIP-1193 — the provider standard

| EIP-1193 | LaserEyes |
|---|---|
| `provider.request({ method, params })` | `BitcoinProvider.request(method, params?)` (positional, see [Decisions](#decisions)) |
| `ProviderRpcError` | `ProviderRpcError` (same shape) |
| Events `accountsChanged`, `chainChanged`, `connect`, `disconnect` | Events `accountsChanged`, `networkChanged`, `connect`, `disconnect` |
| `eth_*` methods | `bitcoin_*` methods |

### EIP-6963 — the discovery protocol

| EIP-6963 | LaserEyes |
|---|---|
| `eip6963:announceProvider` / `eip6963:requestProvider` events | `bitcoin:announceProvider` / `bitcoin:requestProvider` events |
| `EIP6963ProviderInfo { uuid, name, icon, rdns } + provider` | `WalletAnnouncement { uuid, name, icon, rdns, provider }` |

### nanostores — the state model

Atom-per-concern instead of one bag. Subscribers select one atom rather than
slicing a record. Five atoms in core: `$status`, `$account`, `$networkId`,
`$connector`, `$connectors`.

## Bitcoin-specific concessions

Things that aren't 1:1 with the EVM playbook because Bitcoin needs them:

1. **`AddressPurpose`** — Bitcoin wallets typically expose 2–3 addresses at once
   (payment / ordinals / taproot), each with its own derivation. `Account`
   exposes `getAddress(purpose)`, not just `getAddress()`.
2. **Adapters as a separate tier from connectors.** EVM doesn't need this — every
   EVM wallet is already EIP-1193. Bitcoin wallets aren't, yet, so we have a
   translation tier. Adapters are explicitly framed as deletable once wallets
   adopt the spec.
3. **Capability merge in `mergeDataSources`.** viem's `fallback` is *availability
   merge* (same RPC schema, different endpoints). Ours is *capability merge*:
   mempool can't return runes data, sandshrew can — so the merged data source
   exposes the union of method sets, with primary winning on overlap.
4. **PSBT-centric signing**, not transaction-centric. Signers return
   `{ psbtHex, psbtBase64, txId?, txHex? }`, not just a signature.
5. **BIP-322 vs ECDSA** for `signMessage`, surfaced via `protocol` option.
6. **Network IDs**, not chain IDs. We support `mainnet`, `testnet`, `testnet4`,
   `signet`, `fractal-mainnet`, `fractal-testnet`, `regtest`, plus
   `(string & {})` extension. There is no integer chain ID.

## Target package shapes

### `@omnisat/lasereyes-client` — typed primitives, no state, no wallet I/O

Concerns: chains, transports (data sources), accounts, signers, clients,
actions. Knows nothing about wallets, connectors, or global state.

```
src/
  data-source/
    create.ts          createChainDataSource
    merge.ts           mergeDataSources / fallback
  client/
    public.ts          createClient
    wallet.ts          createWalletClient
  account/
    wallet.ts          createWalletAccount
    readonly.ts        createReadOnlyAccount
    types.ts           Account, WalletAccount, AddressInfo, AddressPurpose
  signer/
    types.ts           Signer, SignedPsbt, SignPsbtOptions, SignMessageOptions
    from-provider.ts   providerSigner(provider)        ← the bridge to core
  actions/
    public/            getBalance, getUtxos, getTransaction, getFees,
                       broadcastTransaction, waitForTransaction
    wallet/            sendBtc, getBalance, getUtxos
    signing/           signPsbt, signMessage, broadcastPsbt
    runes/   brc20/   alkanes/   inscriptions/
  vendors/
    mempool/           baseCapabilities + createDataSource
    sandshrew/         baseCapabilities + ord + runes + brc20 + alkanes + inscriptions
    maestro/           baseCapabilities + brc20 + inscriptions + runes
  chains/              MAINNET, TESTNET, TESTNET4, SIGNET, FRACTAL_*, REGTEST,
                       defineChain()
  utils/               psbt-builders, address utils, conversions
  errors/              LaserEyesClientError, NetworkMismatchError, etc.
```

**Contract:** every action in `actions/` is `(client, ...args) => Promise<T>`.
Actions declare their requirements via generic constraints
(`dsMethods extends Pick<BaseCapability, 'btcGetBalance'>`,
`clientActions extends { signPsbt: ... }`). Call sites that don't `.extend()`
the right factories won't compile.

### `@omnisat/lasereyes-core` — stateful orchestrator (the wagmi layer)

Concerns: config, connectors, adapters, discovery, persistence, lifecycle
state. Composes a `WalletClient` on demand from the active connector + the
chain's configured transports.

```
src/
  config.ts            createLaserEyesConfig({
                         chains, connectors,
                         transports: { [chainId]: ChainDataSource[] },
                         storage, autoReconnect
                       })
  state.ts             $status, $account, $networkId, $connector, $connectors
                       (atoms only — no methods)
  wallet-client.ts     getWalletClient(config, opts?)   ← the keystone
  provider/
    types.ts           BitcoinProvider, ProviderRpcError, BitcoinRpcMethod,
                       ProviderCapabilities
  adapters/
    base.ts            BaseAdapter
    unisat.ts, xverse.ts, leather.ts, okx.ts, oyl.ts, magic-eden.ts, ...
  connectors/
    create.ts          createConnector(fn)     ← wagmi-style factory
    types.ts           Connector, ConnectorConfig
    injected.ts        injected({ target })    ← generalizes "window-based" wallets
    unisat.ts          unisat() = injected({...})
    xverse.ts          xverse() = injected({...})
  detection/
    announcements.ts   announceWallet, listenForWalletAnnouncements
    discovery.ts       discoverConnectors() — merges explicit + announced,
                       deduplicates by rdns
  actions/
    connect.ts         connect(config, { connector })
    disconnect.ts      disconnect(config)
    switchNetwork.ts   switchNetwork(config, networkId)
    getBalance.ts      provider-first read with client fallback
    sendBitcoin.ts     connector-only write
    signPsbt.ts        connector-only write
    signMessage.ts     connector-only write
  storage/
    create.ts          createStorage({ key, ... })   ← replaces inline localStorage
```

**Contract:** core never reaches into client internals. Every core wallet
write is `getWalletClient(config).<action>(...)`. Every core wallet read is
"try `connector.request(...)` first, fall back to a `Client` built from the
chain's transports."

## The keystone: `getWalletClient`

The whole architecture hinges on one function:

```ts
// packages/core/src/wallet-client.ts
export async function getWalletClient(
  config: LaserEyesConfig,
  options?: { chainId?: NetworkId }
): Promise<WalletClient<...>> {
  const connector = config.state.$connector.get()
  if (!connector) throw new Error('not connected')

  const account    = await connector.getAccount()
  const chainId    = options?.chainId ?? config.state.$networkId.get()
  const chain      = config.chains.find(c => c.id === chainId)
  const dataSource = config.transports[chainId].reduceRight(
    (acc, t) => mergeDataSources(t, acc)
  )
  const signer     = providerSigner(connector.getProvider())

  return createWalletClient({ network: chain, dataSource, account })
    .extend(walletBtcActions())
    .extend(signingActions(signer))
}
```

Once this exists, **every core wallet write reduces to a one-liner**, and the
dual signing model (client's `Signer`-based vs core's direct
`adapter.request`) collapses into one. Provider-first reads remain a separate
optimization: they can short-circuit before constructing the wallet client.

## Decisions

These are choices we're locking in to remove ambiguity:

1. **`request()` is positional**: `request(method: string, params?: object)`,
   matching EIP-1193's `request({ method, params })` re-cast for ergonomics
   in the Bitcoin context. All adapters and all call sites adopt this form.
2. **`Account` is the canonical account shape everywhere.** `$account` becomes
   `Atom<Account | undefined>`. `AddressInfo[]` is purely an internal detail
   of `Account.addresses`.
3. **`NetworkId` is a string. `ChainNetwork` is a value object.** Core stores
   the ID; client takes the object; the bridge is `config.chains` (a registry,
   like wagmi).
4. **Connector dedup by `rdns`.** Explicit connectors registered first,
   announced connectors deduplicated against them.
5. **No singletons.** `DataSourceManager` is gone. State lives in `config.state`,
   passed explicitly.
6. **No `error.message.includes(...)` capability checks.** Capabilities are
   typed (`getCapabilities()` returns `ProviderCapabilities`) and runtime
   capability misses throw `ProviderRpcError` with code `-32601`.
7. **Adapters are deletable.** When a wallet ships native `BitcoinProvider`
   support, its adapter file deletes; only its connector factory remains.

## Anti-goals

- **Not a kitchen sink.** The library is opinionated about composition; users
  who want to do something exotic compose lower-level primitives, not flags on
  a god-class.
- **Not stateful by default.** `@omnisat/lasereyes-client` is fully tree-shakable
  and stateless. State only enters when you opt into the core layer.
- **Not React-coupled.** React bindings are a thin nanostore subscription layer,
  not where logic lives. Vue/Solid/Svelte bindings should look almost identical.
- **Not opinionated about backends.** Vendors are first-class but pluggable.
  Anyone can publish a `@x/lasereyes-vendor-y` that exports capability factories
  and have it slot in via `mergeDataSources`.
