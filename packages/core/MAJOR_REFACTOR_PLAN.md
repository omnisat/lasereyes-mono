# LaserEyes Core: Modular Architecture Refactor

## Overview

Refactor `@omnisat/lasereyes-core` to be modular and tree-shaking compatible following viem's architecture patterns. This is a **breaking change** with no backward compatibility layer.

### Scope
- **Client Types**: `createPublicClient()` + `createWalletClient()`
- **Protocols**: BTC (Bitcoin native) + Runes only in initial phase
- **Migration**: Breaking change - users must migrate to new API

## Bitcoin RPC Analysis

After reviewing Bitcoin Core RPC methods, the standard Bitcoin RPC API has limitations for application developers:

- **Too low-level**: Many methods (blockchain, mining, network) require deep protocol knowledge
- **Node-dependent**: Wallet RPCs only available if Bitcoin Core built with wallet support
- **Limited accessibility**: Requires running a full Bitcoin node

**Recommendation**: For `createPublicClient()`, wrap developer-friendly public APIs (Mempool.space, Esplora) rather than raw Bitcoin Core RPC. This provides:
- Better DX with REST APIs
- No node requirement
- Cross-chain support (mainnet, testnet, signet)
- Standard operations: UTXO queries, fee estimation, tx broadcasting

**Sources:**
- [Bitcoin RPC API Reference](https://developer.bitcoin.org/reference/rpc/)
- [Bitcoin Core Documentation](https://bitcoincore.org/en/doc/)

## Architecture Design

### High-Level Pattern

```
Application
    ↓
Client Factory (createPublicClient / createWalletClient)
    ↓
Decorator Functions (publicActions, walletActions, runesActions)
    ↓
Actions Layer (pure functions)
    ↓
Transport Layer (http, wallet providers)
    ↓
External APIs (Mempool.space, wallet extensions)
```

### Key Concepts

1. **Factory Pattern**: `createPublicClient()` and `createWalletClient()` create base client instances
2. **Decorator Pattern**: Actions are composed via `.extend(decorator)` for modularity
3. **Transport Abstraction**: Separate data layer (HTTP, wallet providers) from business logic
4. **Tree-Shaking**: ESM exports with preserved module structure enable dead code elimination

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Client Factories

**Create: `src/clients/createPublicClient.ts`**
```typescript
export function createPublicClient(config: PublicClientConfig): PublicClient {
  const { network, transport } = config

  return {
    type: 'publicClient',
    network,
    transport,
    extend: (decorator) => decorator(this),
  }
}
```

**Create: `src/clients/createWalletClient.ts`**
```typescript
export function createWalletClient(config: WalletClientConfig): WalletClient {
  const { network = 'mainnet', provider } = config
  const stores = createStores()
  const transport = walletTransport({ provider, stores, config })

  return {
    type: 'walletClient',
    network: stores.$network,
    $store: stores.$store,
    transport,
    config,
    extend: (decorator) => decorator(this),
  }
}
```

**Create: `src/clients/types.ts`**
- Define `PublicClient`, `WalletClient`, `Client` base types
- Define config types for each client
- Define decorator function signatures

#### 1.2 Transport Layer

**Create: `src/transports/http.ts`**
```typescript
export function http(config: HttpConfig): HttpTransport {
  return {
    type: 'http',
    request: async (params) => {
      // HTTP request implementation using axios
    }
  }
}
```

**Create: `src/transports/wallet.ts`**
```typescript
export function walletTransport(config: WalletTransportConfig): WalletTransport {
  // Lazy provider instantiation
  // Delegate to existing WalletProvider implementations
}
```

**Create: `src/transports/types.ts`**
- Define `Transport`, `HttpTransport`, `WalletTransport` interfaces

#### 1.3 Stores Refactor

**Modify: `src/stores/createStores.ts`**
- Keep existing nanostore logic
- Export factory function for wallet client use

### Phase 2: Action Decorators

#### 2.1 Public Actions

**Create: `src/actions/public/index.ts`**
```typescript
export function publicActions<TClient extends PublicClient>(
  client: TClient
): PublicActions {
  return {
    getUtxos: getUtxos(client),
    getRecommendedFees: getRecommendedFees(client),
    broadcastTransaction: broadcastTransaction(client),
    getTransaction: getTransaction(client),
    waitForTransaction: waitForTransaction(client),
  }
}
```

**Create individual action files:**
- `src/actions/public/getUtxos.ts`
- `src/actions/public/getRecommendedFees.ts`
- `src/actions/public/broadcastTransaction.ts`
- `src/actions/public/getTransaction.ts`
- `src/actions/public/waitForTransaction.ts`

Each action:
1. Takes client as curried parameter
2. Returns async function with typed arguments
3. Delegates to transport or data sources

#### 2.2 Wallet Actions

**Create: `src/actions/wallet/index.ts`**
```typescript
export function walletActions<TClient extends WalletClient>(
  client: TClient
): WalletActions {
  return {
    connect: connect(client),
    disconnect: disconnect(client),
    getBalance: getBalance(client),
    getPublicKey: getPublicKey(client),
    sendBTC: sendBTC(client),
    signMessage: signMessage(client),
    signPsbt: signPsbt(client),
    signPsbts: signPsbts(client),
    pushPsbt: pushPsbt(client),
    switchNetwork: switchNetwork(client),
  }
}
```

**Create individual action files:**
- `src/actions/wallet/connect.ts`
- `src/actions/wallet/disconnect.ts`
- `src/actions/wallet/getBalance.ts`
- `src/actions/wallet/getPublicKey.ts`
- `src/actions/wallet/sendBTC.ts`
- `src/actions/wallet/signMessage.ts`
- `src/actions/wallet/signPsbt.ts`
- `src/actions/wallet/signPsbts.ts`
- `src/actions/wallet/pushPsbt.ts`
- `src/actions/wallet/switchNetwork.ts`

**Migration from existing:**
- Extract logic from current `WalletProvider` methods
- Move to action functions with client parameter
- Keep providers focused on low-level wallet API calls

#### 2.3 Runes Actions

**Create: `src/actions/runes/index.ts`**
```typescript
export function runesActions<TClient extends WalletClient>(
  client: TClient
): RunesActions {
  return {
    sendRune: sendRune(client),
    getRuneBalances: getRuneBalances(client),
    getRuneById: getRuneById(client),
  }
}
```

**Create individual action files:**
- `src/actions/runes/sendRune.ts`
- `src/actions/runes/getRuneBalances.ts`
- `src/actions/runes/getRuneById.ts`

**Refactor from existing:**
- Move PSBT building logic from `lib/runes/psbt.ts` to `utils/psbt/runes.ts`
- Import PSBT builders in runes actions
- Use data sources for balance queries

### Phase 3: Utilities Organization

**Reorganize existing utilities for tree-shaking:**

**Create: `src/utils/psbt/index.ts`**
- Export all PSBT-related utilities

**Create: `src/utils/psbt/btc.ts`**
- Move from `lib/btc.ts`
- BTC-specific PSBT creation

**Create: `src/utils/psbt/runes.ts`**
- Move from `lib/runes/psbt.ts`
- Runes PSBT creation with runestone encoding

**Create: `src/utils/psbt/helpers.ts`**
- Common PSBT utilities
- Signing helpers

**Create: `src/utils/scripts/runes.ts`**
- Move from `lib/runes/scripts.ts`
- OP_RETURN runestone builders

**Create: `src/utils/address/index.ts`**
- Address validation and type detection
- Move relevant code from `lib/helpers.ts`

### Phase 4: Provider Refactor

**Modify: `src/providers/base.ts`**

Refactor `WalletProvider` to focus on low-level wallet operations:
- Remove `send()` method (moved to actions)
- Keep provider-specific implementations:
  - `connect()`
  - `sendBTC()` (low-level, delegates to wallet)
  - `signPsbt()` / `signPsbts()`
  - `signMessage()`
  - `getBalance()`, `getPublicKey()`, `getNetwork()`
  - Event listener management
  - Device detection

**Update all 14 provider implementations:**
- Remove protocol-specific send logic
- Keep wallet API bindings
- Simplify to transport layer

### Phase 5: Build Configuration

**Modify: `package.json`**

Add granular exports for tree-shaking:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./actions": {
      "import": "./dist/actions/index.js",
      "types": "./dist/actions/index.d.ts"
    },
    "./actions/wallet": {
      "import": "./dist/actions/wallet/index.js",
      "types": "./dist/actions/wallet/index.d.ts"
    },
    "./actions/public": {
      "import": "./dist/actions/public/index.js",
      "types": "./dist/actions/public/index.d.ts"
    },
    "./actions/runes": {
      "import": "./dist/actions/runes/index.js",
      "types": "./dist/actions/runes/index.d.ts"
    },
    "./clients": {
      "import": "./dist/clients/index.js",
      "types": "./dist/clients/index.d.ts"
    },
    "./transports": {
      "import": "./dist/transports/index.js",
      "types": "./dist/transports/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils/index.js",
      "types": "./dist/utils/index.d.ts"
    },
    "./constants": {
      "import": "./dist/constants/index.js",
      "types": "./dist/constants/index.d.ts"
    }
  }
}
```

**Modify: `vite.config.js`**

Update build to preserve module structure:
```javascript
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false, // Keep separate .d.ts for tree-shaking
    }),
  ],
  build: {
    rollupOptions: {
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    lib: {
      entry: {
        index: './src/index.ts',
        'actions/index': './src/actions/index.ts',
        'actions/wallet/index': './src/actions/wallet/index.ts',
        'actions/public/index': './src/actions/public/index.ts',
        'actions/runes/index': './src/actions/runes/index.ts',
        'clients/index': './src/clients/index.ts',
        'transports/index': './src/transports/index.ts',
        'utils/index': './src/utils/index.ts',
      },
      formats: ['es', 'cjs'],
    },
  },
})
```

### Phase 6: Main Entry Point

**Modify: `src/index.ts`**

Export new API (remove old LaserEyesClient):
```typescript
// Clients
export { createPublicClient } from './clients/createPublicClient'
export { createWalletClient } from './clients/createWalletClient'

// Actions
export { publicActions } from './actions/public'
export { walletActions } from './actions/wallet'
export { runesActions } from './actions/runes'

// Transports
export { http } from './transports/http'
export { walletTransport } from './transports/wallet'

// Utilities (for advanced users)
export * from './utils'

// Types & Constants
export * from './types'
export * from './constants'
```

## Usage Examples

### Example 1: Basic Wallet Connection (BTC only)

```typescript
import { createWalletClient, walletActions } from '@omnisat/lasereyes-core'
import { UNISAT } from '@omnisat/lasereyes-core/constants'

const client = createWalletClient({
  network: 'mainnet',
}).extend(walletActions)

await client.connect(UNISAT)
const balance = await client.getBalance()
const txId = await client.sendBTC({ to: 'bc1...', amount: 10000 })
```

### Example 2: Runes Application (Tree-Shaken)

```typescript
import {
  createWalletClient,
  walletActions,
  runesActions
} from '@omnisat/lasereyes-core'
import { XVERSE } from '@omnisat/lasereyes-core/constants'

const client = createWalletClient({ network: 'mainnet' })
  .extend(walletActions)
  .extend(runesActions)  // Only loads runes code

await client.connect(XVERSE)
const balances = await client.getRuneBalances()
const txId = await client.sendRune({
  runeId: '840000:3',
  amount: 1000,
  toAddress: 'bc1...',
})
```

### Example 3: Public Client (Read-Only)

```typescript
import { createPublicClient, http, publicActions } from '@omnisat/lasereyes-core'

const client = createPublicClient({
  network: 'mainnet',
  transport: http({ url: 'https://mempool.space/api' }),
}).extend(publicActions)

const utxos = await client.getUtxos({ address: 'bc1...' })
const fees = await client.getRecommendedFees()
const txId = await client.broadcastTransaction({ rawTx: '...' })
```

### Example 4: Custom Extension

```typescript
const client = createWalletClient({ network: 'mainnet' })
  .extend(walletActions)
  .extend((client) => ({
    // Custom action
    myCustomMethod: async (args) => {
      const balance = await client.getBalance()
      // Custom logic here
      return balance * 2
    }
  }))

const result = await client.myCustomMethod()
```

## New Directory Structure

```
packages/core/src/
├── index.ts                    # Main entry point
│
├── clients/
│   ├── createPublicClient.ts
│   ├── createWalletClient.ts
│   └── types.ts
│
├── actions/
│   ├── index.ts
│   ├── public/
│   │   ├── index.ts
│   │   ├── getUtxos.ts
│   │   ├── getRecommendedFees.ts
│   │   ├── broadcastTransaction.ts
│   │   ├── getTransaction.ts
│   │   └── waitForTransaction.ts
│   ├── wallet/
│   │   ├── index.ts
│   │   ├── connect.ts
│   │   ├── disconnect.ts
│   │   ├── getBalance.ts
│   │   ├── sendBTC.ts
│   │   ├── signPsbt.ts
│   │   ├── signMessage.ts
│   │   └── [...]
│   └── runes/
│       ├── index.ts
│       ├── sendRune.ts
│       ├── getRuneBalances.ts
│       └── getRuneById.ts
│
├── transports/
│   ├── http.ts
│   ├── wallet.ts
│   └── types.ts
│
├── providers/              # Existing, refactored
│   ├── base.ts
│   ├── unisat.ts
│   └── [14 providers...]
│
├── utils/                  # Reorganized for tree-shaking
│   ├── psbt/
│   │   ├── index.ts
│   │   ├── btc.ts
│   │   ├── runes.ts
│   │   └── helpers.ts
│   ├── scripts/
│   │   └── runes.ts
│   └── address/
│       └── index.ts
│
├── data-sources/           # Existing, kept mostly as-is
│   ├── manager.ts
│   └── sources/
│
├── stores/                 # Existing
│   └── createStores.ts
│
├── constants/              # Existing
└── types/                  # Existing
```

## Critical Files to Create/Modify

### Must Create (New Architecture)
1. `src/clients/createPublicClient.ts` - Public client factory
2. `src/clients/createWalletClient.ts` - Wallet client factory
3. `src/clients/types.ts` - Client type definitions
4. `src/transports/http.ts` - HTTP transport
5. `src/transports/wallet.ts` - Wallet transport
6. `src/transports/types.ts` - Transport types
7. `src/actions/public/index.ts` - Public actions decorator
8. `src/actions/wallet/index.ts` - Wallet actions decorator
9. `src/actions/runes/index.ts` - Runes actions decorator

### Must Modify (Refactor Existing)
10. `src/providers/base.ts` - Refactor WalletProvider base class
11. `src/index.ts` - Update main entry point
12. `package.json` - Add granular exports
13. `vite.config.js` - Configure for tree-shaking
14. `src/stores/createStores.ts` - Export factory function

### Should Move/Reorganize
15. `src/lib/btc.ts` → `src/utils/psbt/btc.ts`
16. `src/lib/runes/psbt.ts` → `src/utils/psbt/runes.ts`
17. `src/lib/runes/scripts.ts` → `src/utils/scripts/runes.ts`

## Migration Guide for Users

This is a **breaking change**. All users must update their code.

### Before (v0.x)
```typescript
import { LaserEyesClient, createStores } from '@omnisat/lasereyes-core'

const stores = createStores()
const client = new LaserEyesClient(stores)
await client.connect(UNISAT)
await client.send(RUNES, { runeId: '...', amount: 100, toAddress: '...' })
```

### After (v1.0)
```typescript
import { createWalletClient, walletActions, runesActions } from '@omnisat/lasereyes-core'

const client = createWalletClient({ network: 'mainnet' })
  .extend(walletActions)
  .extend(runesActions)

await client.connect(UNISAT)
await client.sendRune({ runeId: '...', amount: 100, toAddress: '...' })
```

### Key Changes
- Replace `new LaserEyesClient()` with `createWalletClient()`
- Add `.extend(walletActions)` for wallet operations
- Add `.extend(runesActions)` for runes support
- Replace `client.send(RUNES, args)` with `client.sendRune(args)`
- No need to manage stores manually

## Verification & Testing

### End-to-End Tests

1. **Wallet Connection Test**
   - Create wallet client with Unisat provider
   - Connect and verify address
   - Check balance retrieval

2. **BTC Send Test**
   - Create wallet client with wallet actions
   - Send BTC transaction
   - Verify transaction broadcast

3. **Runes Send Test**
   - Create wallet client with runes actions
   - Get rune balances
   - Send rune transaction

4. **Tree-Shaking Test**
   - Build minimal app using only wallet actions
   - Verify runes code is not in bundle
   - Build app using runes actions
   - Verify runes code is in bundle

5. **Public Client Test**
   - Create public client with HTTP transport
   - Fetch UTXOs from Mempool.space API
   - Get fee recommendations

### Bundle Size Analysis

Run bundle analyzer to verify:
- Base client + wallet actions: ~40-50 kB
- + Runes actions: ~50-60 kB
- Full bundle with all extensions: ~80-90 kB
- Target: 40-60% reduction for minimal usage

### Type Safety Tests

Verify TypeScript inference:
- Client methods are properly typed
- Action return types are inferred
- Decorator composition works without explicit types

## Success Criteria

1. **Modularity**: Each protocol can be imported independently
2. **Tree-Shaking**: 40-60% bundle size reduction for minimal usage
3. **Type Safety**: Full TypeScript inference without explicit annotations
4. **API Simplicity**: Clearer, more composable API than v0.x
5. **Extensibility**: Easy to add custom actions via `.extend()`

## Future Extensions (Post-v1.0)

- BRC-20 actions decorator
- Alkanes actions decorator
- Inscription actions decorator
- Bitcoin Core RPC transport (for node operators)
- WebSocket transport (for real-time updates)
- Additional data source integrations
