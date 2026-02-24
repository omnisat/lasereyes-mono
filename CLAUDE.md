# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LaserEyes is a Bitcoin wallet connect library for building Bitcoin Ordinal Web Apps. It provides a framework-agnostic core with React bindings for integrating Bitcoin wallets (Leather, Magic Eden, OKX, Orange Wallet, OYL, Unisat, Wizz, Phantom, Xverse) into dApps.

## Monorepo Structure

This is a **Turborepo monorepo** using **pnpm** (v10.29.3+) workspaces:

- **packages/client**: New data client for Bitcoin blockchain data (runes, BRC-20, alkanes, inscriptions) with vendor integrations (mempool, sandshrew, maestro)
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
# Lint all packages
pnpm lint

# Biome check (recommended)
pnpm lint:biome
pnpm lint:biome:fix

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

- **Provider Pattern**: Each wallet implements the `WalletProvider` interface
- **Client**: `LaserEyesClient` provides unified interface, delegates to wallet providers
- **State**: Uses **nanostores** for framework-agnostic state management
- **Data Sources**: `DataSourceManager` pattern for fallback between Bitcoin data APIs
- **Structure**:
  - `src/client/`: Client-facing API
  - `src/lib/`: Shared utilities and helpers
  - `src/constants/`: Project constants
  - `src/types/`: TypeScript type definitions

### Client Package (`@omnisat/lasereyes-client`)

**Primary Package**: Modern Bitcoin data client with wallet integration support. The core package will be refactored to align with this architecture.

#### Architecture Principles
- **Actions = Data Operations**: Methods that interact with blockchain (queries + mutations)
- **Utils = Pure Functions**: Transformation and building functions (no I/O)
- **Account = Data Container**: Addresses and keys (no signing logic)
- **Signer = Signing Capability**: Optional, injected into wallet client
- **Wallet Client = Orchestrator**: Combines Account + Signer + DataSource

#### Subpath Exports
- **Main export** (`@omnisat/lasereyes-client`): Base client, actions, types
- **`/wallet`**: Wallet client with account context
  - Account types: `WalletAccount`, `ReadOnlyAccount`
  - Wallet-aware actions: `walletBtcActions()`, `signingActions()`
  - Factories: `createWalletClient()`, `createWalletAccount()`, `createReadOnlyAccount()`
- **`/utils`**: Public utility functions (PSBT builders, address utilities, conversions)
- **`/runes`**: Runes protocol support
- **`/brc20`**: BRC-20 token support
- **`/alkanes`**: Alkanes protocol support
- **`/inscriptions`**: Bitcoin inscriptions
- **`/vendors/mempool`**: Mempool.space integration
- **`/vendors/sandshrew`**: Sandshrew API integration
- **`/vendors/maestro`**: Maestro API integration

#### Key Concepts

**Base Client** (Read-only, explicit addresses):
```typescript
import { createClient, btcActions } from '@omnisat/lasereyes-client'

const client = createClient({ network: MAINNET, dataSource })
  .extend(btcActions())

const balance = await client.btcGetBalance('bc1q...')
```

**Wallet Client** (Account-aware, ergonomic):
```typescript
import { createWalletClient, createWalletAccount, walletBtcActions } from '@omnisat/lasereyes-client/wallet'

const account = createWalletAccount({
  addresses: [
    { address: 'bc1q...', purpose: 'payment', type: AddressType.P2WPKH },
    { address: 'bc1p...', purpose: 'ordinals', type: AddressType.P2TR }
  ],
  publicKeys: { payment: '02...', ordinals: '03...', taproot: '03...' }
})

const walletClient = createWalletClient({ network: MAINNET, dataSource, account, signer })
  .extend(walletBtcActions())
  .extend(signingActions())

// Automatically uses account.getAddress('payment')
const balance = await walletClient.getBalance()
await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
```

**Utilities** (Pure functions, no I/O):
```typescript
import { buildSendBtcPsbt, getAddressType } from '@omnisat/lasereyes-client/utils'

const psbt = buildSendBtcPsbt({ utxos, toAddress, amount, changeAddress, feeRate, network })
const addrType = getAddressType('bc1q...')
```

**Structure**:
- `src/client.ts`: Base client factory
- `src/wallet-client.ts`: Wallet client factory
- `src/account/`: Account implementations
- `src/actions/`: Action groups (btc, wallet-btc, wallet-signing)
- `src/lib/`: Internal utilities (not exported)
- `src/utils.ts`: Public utility exports
- `src/types/`: TypeScript type definitions

Size limits enforced via **size-limit** tool.

### React Package (`@omnisat/lasereyes-react`)

- **Context Provider**: `LaserEyesProvider` wraps app and provides wallet context
- **Hooks**: `useLaserEyes` and other hooks for wallet operations
- **Icons**: Wallet icon components (SVG-based)
- **Integration**: Uses `@nanostores/react` to connect to core state
- **Next.js Support**: Includes `'use client'` directives for compatibility

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

- Implement proper error handling in all providers
- Normalize errors from different wallet implementations
- Provide meaningful error messages

## Adding Features

### Adding a New Wallet

1. Create provider class extending `WalletProvider` in `packages/core/src/client/`
2. Implement all required methods
3. Add wallet constants to `packages/core/src/constants/`
4. Register provider in `LaserEyesClient`
5. Add wallet icon to `packages/react/lib/icons/`
6. Add tests

### Adding a New Data Source

1. Create class implementing `DataSource` interface
2. Implement required methods based on API capabilities
3. Register in `DataSourceManager`
4. Add normalization functions for API responses
5. Implement fallback error handling

### Adding Documentation

1. Create file in `apps/lasereyes-docs/app/docs/` or `apps/docs/`
2. Add to navigation in `lib/theme-config.ts`
3. Use TSDoc comments for API documentation (auto-generated via TypeDoc)
4. Run `pnpm docs:check-coverage` to verify tier-1 exports are documented

## Network Support

- Support mainnet, testnet, and other Bitcoin networks
- Handle network switching in wallet providers
- Maintain network state in client

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
