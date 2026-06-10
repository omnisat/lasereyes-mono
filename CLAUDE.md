# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LaserEyes is a Bitcoin wallet connect library for building Bitcoin Ordinal Web Apps. It provides a framework-agnostic core with React bindings for integrating Bitcoin wallets (Leather, OKX, Orange, OYL, Unisat, Wizz, Phantom, Xverse, and more) into dApps.

## Monorepo Structure

This is a **Turborepo monorepo** using **pnpm** (v10.29.3+) workspaces:

- **packages/client**: Composable Bitcoin data client (balances, UTXOs, fees, transactions, PSBT utils) with backend integrations (mempool, sandshrew, maestro)
- **packages/core**: Framework-agnostic wallet integration library using nanostores for state management
- **packages/react**: React bindings with hooks, context providers, and wallet icon components
- **packages/lasereyes**: Legacy combined package
- **packages/ui**: UI components
- **apps/docs**: Documentation site (Fumadocs-based)
- **apps/lasereyes-docs**: Alternative documentation
- **apps/demo.lasereyes.build**: Demo application
- **apps/react-ui**: React UI demo

## Common Commands

### Building

```bash
# Build all packages
pnpm build

# Build specific packages
pnpm build:core
pnpm build:react
pnpm build:lasereyes
pnpm build:ui

# Build with Turbo filter
turbo build --filter @omnisat/lasereyes-client
```

### Development

```bash
# Run all dev servers
pnpm dev

# Run specific apps
pnpm dev:demo
pnpm dev:docs
pnpm dev:react
pnpm dev:vue
pnpm dev:icp
```

### Linting & Formatting

```bash
# Lint with Biome (primary) — checks the whole repo in one pass
pnpm lint
pnpm lint:fix   # auto-fix

# ESLint (secondary) — per-package via turbo, for the eslint-only rules
pnpm lint:eslint

# Format code
pnpm format
pnpm check:fix  # Format with unsafe fixes
```

**Important**: Biome is the primary linter/formatter. Use `biome check --write` for auto-fixing.

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for specific package
pnpm --filter @omnisat/lasereyes-client test
```

Tests use **Vitest** with configuration in [vitest.config.ts](vitest.config.ts). Test files are located in `packages/**/*.test.ts` and `packages/**/__tests__/`.

### Documentation

```bash
# Generate TypeDoc documentation
pnpm docs:typedoc

# Run docs dev server (runs typedoc first)
pnpm docs:dev

# Build documentation
pnpm docs:build

# Check documentation coverage
pnpm docs:check-coverage
```

TypeDoc generates MDX files from TSDoc comments into `apps/docs/.typedoc-output/`.

### Package Management

```bash
# Version packages with changesets
pnpm version

# Create prerelease version
pnpm version-prerelease

# Publish packages
pnpm release
```

## Architecture

### Core Package (`@omnisat/lasereyes-core`)

- **Config-driven**: `createLaserEyesConfig({ chains, connectors, backends })` builds a config *value* (not a class). Operations are free-function **actions** in `src/actions/` that take the config as their first argument.
- **Connectors**: One per wallet (`unisat()`, `leather()`, …) — how a user connects. Registered connectors always surface; others appear via EIP-6963-style discovery.
- **Adapters**: Normalize a wallet's injected provider into a standard shape — either a class (`BaseAdapter`) or the declarative `defineAdapter()` factory.
- **State**: **nanostores** atoms on `config.state` (`$connection`, `$connectors`), exposed read-only; the action layer is the only writer.
- **Data**: Reads route through a per-network **backend** from `@omnisat/lasereyes-client` (with a native-wallet-RPC shortcut when the connected wallet supports it).
- **Structure**:
  - `src/config.ts`, `src/state.ts`: config + reactive state
  - `src/client.ts`, `src/wallet-client.ts`: typed client builders bridging to the client package
  - `src/connectors/`, `src/adapters/`: per-wallet connectors + adapters
  - `src/actions/`: free-function actions (lifecycle, reads, writes)
  - `src/query/`: nanostores/query caching layer for reads/writes
  - `src/detection/`: EIP-6963-style wallet discovery
  - `src/constants/`, `src/types/`, `src/internal/`: constants, types, internal helpers

### Client Package (`@omnisat/lasereyes-client`)

**Primary data package**: Modern, composable Bitcoin data client with wallet integration support. The core package builds on it.

#### Architecture Principles
- **Actions = Data Operations**: Methods that interact with blockchain (queries + mutations)
- **Utils = Pure Functions**: Transformation and building functions (no I/O)
- **Account = Data Container**: Addresses and keys (no signing logic)
- **Signer = Signing Capability**: Optional, injected into wallet client
- **Backend = Data Source**: Per-network capability bundle (mempool, sandshrew, maestro, or your own)
- **Wallet Client = Orchestrator**: Combines Account + Signer + Backend

#### Subpath Exports
- **Main export** (`@omnisat/lasereyes-client`): Base client, `publicActions`, chains, errors, domain types
- **`/wallet`**: Wallet client + accounts — `createWalletClient()`, `createWalletAccount()`, `createReadOnlyAccount()`, `walletBtcActions()`, `providerSigner()`
- **`/utils`**: Pure utility functions (PSBT builders, address utilities, conversions)
- **`/backends`**: Backend primitives — `createChainBackend()`, `combineBackends()`
- **`/backends/mempool`**: mempool.space backend (`mempool()`)
- **`/backends/sandshrew`**: Sandshrew backend (`sandshrew()`)
- **`/backends/maestro`**: Maestro backend (`maestro()`)

Protocol action groups (runes, BRC-20, alkanes, inscriptions) are scaffolded under `src/actions/<proto>/` but **not yet exported** — see [`packages/client/FUTURE-IMPROVEMENTS.md`](packages/client/FUTURE-IMPROVEMENTS.md).

#### Key Concepts

**Base Client** (Read-only, explicit addresses):
```typescript
import { createClient, publicActions, combineBackends, MAINNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { sandshrew } from '@omnisat/lasereyes-client/backends/sandshrew'

// Backend factories resolve against a network.
const backend = combineBackends(sandshrew({ apiKey: '…' }), mempool())(MAINNET)
const client = createClient({ network: MAINNET, backend }).extend(publicActions())

const balance = await client.getAddressBalance('bc1q...')
```

**Wallet Client** (Account-aware, ergonomic):
```typescript
import {
  createWalletClient, createWalletAccount, walletBtcActions,
} from '@omnisat/lasereyes-client/wallet'

const account = createWalletAccount({
  addresses: [
    { address: 'bc1q...', purpose: 'payment', type: AddressType.P2WPKH },
    { address: 'bc1p...', purpose: 'ordinals', type: AddressType.P2TR }
  ],
  publicKeys: { payment: '02...', ordinals: '03...', taproot: '03...' }
})

const walletClient = createWalletClient({ network: MAINNET, backend, account, signer })
  .extend(walletBtcActions())

await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
await walletClient.signPsbt(psbtHex, { finalize: true })
```

**Utilities** (Pure functions, no I/O):
```typescript
import { buildSendBtcPsbt, getAddressType } from '@omnisat/lasereyes-client/utils'

const psbt = buildSendBtcPsbt({ utxos, toAddress, amount, changeAddress, feeRate, network })
const addrType = getAddressType('bc1q...')
```

**Structure**:
- `src/client/`: Base + wallet client factories and types
- `src/account/`: Account implementations
- `src/actions/`: Action groups (`public`, `wallet`, and scaffolded protocols)
- `src/backends/`: Backend primitives + vendor factories (mempool, sandshrew, maestro)
- `src/signer/`: Signer types + `providerSigner` bridge
- `src/chains/`: Chain definitions
- `src/lib/`: Internal utilities (not exported)
- `src/utils.ts`: Public utility exports
- `src/types/`: TypeScript type definitions

Size limits enforced via **size-limit** tool.

### React Package (`@omnisat/lasereyes-react`)

- **Context Provider**: `<LaserEyesProvider config={config}>` wraps the app; owns the `initialize`/`dispose` lifecycle and a provider-scoped query cache.
- **Hooks**: Query-backed hooks — `useConnect`, `useDisconnect`, `useAccount`, `useStatus`, `useConnectors`, `useConnector`, `useNetwork`, `useBalance`, `useUtxos`, `useFeeRates`, `useTransaction`, `useSendBitcoin`, `useSignPsbt`, `useSignMessage`, `useBroadcastPsbt`, `useBroadcastTransaction`, `useConfig`. Reads cache + auto-revalidate; writes refresh the affected reads.
- **Typed config**: Optional `Register` module augmentation narrows `network`/`chainId` to the configured chains.
- **Icons**: Wallet icon components (SVG-based), incl. the name-resolving `WalletIcon`.
- **Next.js Support**: `'use client'` directives on the provider and hooks.

### Documentation

- Built with **Fumadocs** (Next.js-based documentation framework)
- TypeDoc generates API reference from TSDoc comments
- Post-processing script ([scripts/typedoc-postprocess.mjs](scripts/typedoc-postprocess.mjs)) enhances generated docs
- Doc coverage script ([scripts/check-doc-coverage.mjs](scripts/check-doc-coverage.mjs)) ensures tier-1 exports are documented

## Code Standards

### TypeScript

- **No `any` types** (except in core/client packages where explicitly allowed via Biome overrides)
- All public APIs must have proper type definitions
- TSDoc comments required for all public methods, classes, interfaces

### Type-inference contract (client package)

`packages/client/src/__tests__/type-inference.test-d.ts` is the
**binding type-level contract** for the client package. Any change to a
public type or signature in `@omnisat/lasereyes-client` must come with a
corresponding update to that file. Concretely:

- New action factory or new client method → add `expectTypeOf` coverage
- Changed action signature → update the matching assertion
- New ordering constraint → add a `// @ts-expect-error` block
- New negative case (capability/account/signer mismatch) → add a `// @ts-expect-error` block
- New vendor or capability interface → add return-shape and reachability checks
- New direct-callable action → add an entry under `Direct action calls`

The full rule set lives in the file's docblock and in
[`MENTAL-MODEL.md`](./MENTAL-MODEL.md) §8 ("Maintenance discipline").
Run via `vitest typecheck` (or `pnpm tsc --noEmit -p packages/client`
including `__tests__`).

### Formatting (Biome)

- Semicolons: as needed
- Quotes: single for JS/TS, double for JSX
- Line width: 100
- Indentation: 2 spaces
- Trailing commas: ES5

### React-Specific

- Use **functional components** with hooks
- No class components
- `'use client'` directive for client components in Next.js apps
- Memoize context values to prevent re-renders

### Error Handling

- Implement proper error handling in all connectors and adapters
- Normalize errors from different wallet implementations
- Provide meaningful error messages

## Adding Features

### Adding a New Wallet

1. Create an adapter in `packages/core/src/adapters/<wallet>.ts` — usually via `defineAdapter({ walletId, walletName, networks, handlers })` (or extend `BaseAdapter` for Unisat-style providers).
2. Create a connector in `packages/core/src/connectors/<wallet>.ts` (e.g. via `injected(...)`) and export it from `connectors/index.ts`.
3. Add wallet constants to `packages/core/src/constants/wallets.ts`.
4. Register the subpath exports in `packages/core/package.json` and `src/umd.ts`.
5. Add a wallet icon to `packages/react/src/icons/` and wire it into `walletIcon.tsx`.
6. Add tests, including the type-contract assertion in the type-inference test.

### Adding a New Backend (Data Source)

1. Build a backend with `createChainBackend({ network })` and `.extend(...)` the capability methods, or wrap a vendor API as a factory like `mempool()` / `sandshrew()`.
2. Implement the capability methods the actions need (balance, UTXOs, fees, transactions, …).
3. Compose multiple sources for one network with `combineBackends(primary(), fallback())`.
4. Normalize API responses to the standard return shapes.
5. Add type-contract coverage in the client package's type-inference test.

### Adding Documentation

1. Create file in `apps/lasereyes-docs/app/docs/` or `apps/docs/`
2. Add to navigation in `lib/theme-config.ts`
3. Use TSDoc comments for API documentation (auto-generated via TypeDoc)
4. Run `pnpm docs:check-coverage` to verify tier-1 exports are documented

## Network Support

- Support mainnet, testnet, and other Bitcoin networks
- Handle network switching via connectors and the `switchNetwork` action
- Maintain network state in the config (`state.$connection`)

## Dependencies

- Keep dependencies minimal
- Consider bundle size impact
- Use workspace protocol (`workspace:*`) for internal dependencies
- Peer dependencies: React >=17, nanostores >=0.11

## Changesets

This project uses **@changesets/cli** for version management:

1. Create changeset: `pnpm changeset`
2. Version packages: `pnpm version`
3. Publish: `pnpm release`

## Important Notes

- Main branch for PRs: `main`
- Current development branch: `major-refactor`
- Package manager: **pnpm** (required, version specified in packageManager field)
- Node version: >=18
- Build tool: **Turbo** for monorepo orchestration
- Test runner: **Vitest**
- Linter/Formatter: **Biome** (primary), Prettier (legacy)
- **Use `script` (PTY) ONLY for `pnpm install`, not for other pnpm commands.**
  Plain `pnpm install` aborts with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`
  when it needs to remove `node_modules` and there's no TTY. Wrap only the
  install: `script -q /dev/null pnpm install` (macOS). This gives pnpm a
  pseudo-TTY so it proceeds instead of aborting. (Setting `CI=true` also
  bypasses the prompt but changes other pnpm behavior — prefer `script`.)
  Run all other pnpm commands (`build`, `test`, `exec tsc`, etc.) directly
  without `script`.
