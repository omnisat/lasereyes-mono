/**
 * Type-inference contract for the React hooks.
 *
 * @remarks
 * Run via `vitest typecheck`. No runtime assertions — each block exists purely
 * so its body is typechecked. Mirrors the client package's
 * `type-inference.test-d.ts` discipline (see CLAUDE.md). If a change breaks one
 * of these contracts, `vitest typecheck` fails.
 *
 * Covers the four problems from `docs/hooks-typing-and-overrides.md`:
 * - **P1** generic threading (Register default + explicit `{ config }`),
 * - **P2** discriminated results (account + read/write),
 * - **P3** per-call `chainId` narrowed to the configured chains,
 * - **P4** config injection flowing the passed config's generics.
 *
 * @module __tests__/hooks-type-inference
 */

import {
  type ChainBackendFactory,
  type Connector,
  createLaserEyesConfig,
  MAINNET,
  SIGNET,
  TESTNET4,
  type WalletAccount,
} from '@omnisat/lasereyes-core'
import { describe, expectTypeOf, it } from 'vitest'
import { useAccount } from '../hooks/useAccount'
import { useBalance } from '../hooks/useBalance'
import { useNetwork } from '../hooks/useNetwork'
import { useSendBitcoin } from '../hooks/useSendBitcoin'
import { useUtxos } from '../hooks/useUtxos'
// #4: result types must be reachable from the package root (re-exported from core).
import type { FeeEstimate, PaginatedResult, Transaction, UTXO } from '../index'

const stub = (() => ({})) as unknown as ChainBackendFactory

/** The app's config: two configured chains → `'mainnet' | 'testnet4'`. */
const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET4],
  backends: { mainnet: stub, testnet4: stub },
})

/** A second, differently-chained config to prove explicit-`config` threading. */
const signetConfig = createLaserEyesConfig({
  chains: [MAINNET, SIGNET],
  backends: { mainnet: stub, signet: stub },
})

// P1: Register augmentation makes context-derived hooks narrow by default.
// Augment the SOURCE module the hooks reference (`../types`), not the built
// package — the two declarations don't merge across that boundary.
declare module '../types' {
  interface Register {
    config: typeof config
  }
}

type ConfiguredId = 'mainnet' | 'testnet4'

describe('P1 — generic threading (Register default)', () => {
  it('useNetwork().network narrows to the configured id union', () => {
    expectTypeOf(useNetwork().network).toEqualTypeOf<ConfiguredId>()
  })

  it('useAccount().networkId narrows to the configured id union', () => {
    expectTypeOf(useAccount().networkId).toEqualTypeOf<ConfiguredId>()
  })

  it('switchNetwork accepts configured ids', () => {
    const { switchNetwork } = useNetwork()
    switchNetwork('mainnet')
    switchNetwork('testnet4')
  })

  it('switchNetwork rejects an unconfigured (but valid) network id', () => {
    const { switchNetwork } = useNetwork()
    // @ts-expect-error 'signet' is a valid NetworkId but not in this config
    switchNetwork('signet')
  })

  it('exposes the configured chains, ids narrowed to the configured union', () => {
    const { chains } = useNetwork()
    expectTypeOf(chains.map(c => c.id)).toEqualTypeOf<ConfiguredId[]>()
  })
})

describe('P2 — discriminated account', () => {
  it('connected branch guarantees non-null account/connector + payment address', () => {
    const account = useAccount()
    if (account.status === 'connected') {
      expectTypeOf(account.account).toEqualTypeOf<WalletAccount>()
      expectTypeOf(account.connector).toEqualTypeOf<Connector>()
      expectTypeOf(account.isConnected).toEqualTypeOf<true>()
      // #3: primary (payment) address/publicKey are non-null in this branch.
      expectTypeOf(account.address).toEqualTypeOf<string>()
      expectTypeOf(account.paymentAddress).toEqualTypeOf<string>()
      expectTypeOf(account.publicKey).toEqualTypeOf<string>()
      expectTypeOf(account.paymentPublicKey).toEqualTypeOf<string>()
      // ordinals stay optional (not every wallet exposes them)
      expectTypeOf(account.ordinalsAddress).toEqualTypeOf<string | undefined>()
    }
  })

  it('disconnected branch leaves account/connector/addresses possibly-undefined', () => {
    const account = useAccount()
    if (account.status !== 'connected') {
      expectTypeOf(account.account).toEqualTypeOf<WalletAccount | undefined>()
      expectTypeOf(account.connector).toEqualTypeOf<Connector | undefined>()
      expectTypeOf(account.paymentAddress).toEqualTypeOf<string | undefined>()
    }
  })
})

describe('#4 — result types re-exported from the package root', () => {
  it('UTXO / Transaction / FeeEstimate / PaginatedResult are importable', () => {
    expectTypeOf<UTXO['value']>().toEqualTypeOf<number>()
    expectTypeOf<Transaction['txid']>().toEqualTypeOf<string>()
    expectTypeOf<FeeEstimate['fastFee']>().toEqualTypeOf<number>()
    expectTypeOf<PaginatedResult<UTXO>['data']>().toEqualTypeOf<UTXO[]>()
  })
})

describe('P2 — discriminated read/write results', () => {
  it('read success branch proves data: T (not T | undefined)', () => {
    const balance = useBalance()
    if (balance.status === 'success') {
      expectTypeOf(balance.data).toEqualTypeOf<string>()
      expectTypeOf(balance.error).toEqualTypeOf<undefined>()
    }
    if (balance.status === 'error') {
      expectTypeOf(balance.error).toEqualTypeOf<Error>()
    }
  })

  it('reads expose isFetching + isLoading, not a bare loading (#7)', () => {
    const balance = useBalance()
    expectTypeOf(balance.isFetching).toEqualTypeOf<boolean>()
    expectTypeOf(balance.isLoading).toEqualTypeOf<boolean>()
    // @ts-expect-error renamed: reads use `isFetching` (any fetch) / `isLoading` (first load)
    balance.loading
  })

  it('mutation success branch proves data: Result', () => {
    const send = useSendBitcoin()
    if (send.status === 'success') {
      expectTypeOf(send.data).toEqualTypeOf<string>()
    }
    expectTypeOf(send.txId).toEqualTypeOf<string | undefined>()
    expectTypeOf(send.isLoading).toEqualTypeOf<boolean>()
    // @ts-expect-error mutations expose only `isLoading` (no background-refetch state)
    send.loading
  })
})

describe('P3 — per-call chainId narrowed to configured chains', () => {
  it('accepts a configured chainId', () => {
    useBalance('bc1q…', { chainId: 'testnet4' })
  })

  it('rejects an unconfigured chainId', () => {
    // @ts-expect-error 'signet' is not one of this config's chains
    useBalance('bc1q…', { chainId: 'signet' })
  })

  it('accepts the behaviour knobs', () => {
    useBalance('bc1q…', { enabled: false })
  })
})

describe('P1 footgun — chainId requires an explicit address', () => {
  it('allows chainId with an explicit address', () => {
    useBalance('bc1q…', { chainId: 'testnet4' })
    useUtxos('bc1q…', { chainId: 'testnet4' })
  })

  it('rejects chainId paired with the default (active-account) address', () => {
    // @ts-expect-error chainId needs an explicit address — the active-account
    // default can't be silently read against a foreign chain
    useBalance(undefined, { chainId: 'testnet4' })
    // @ts-expect-error same for the paginated read
    useUtxos(undefined, { chainId: 'testnet4' })
  })

  it('still allows the non-chain knobs without an address', () => {
    useBalance(undefined, { enabled: false })
    useUtxos(undefined, { enabled: false, limit: 10 })
  })
})

describe('Pagination — useUtxos accumulates pages', () => {
  it('exposes the infinite-result surface (items + fetchNextPage + hasNextPage)', () => {
    const utxos = useUtxos()
    expectTypeOf(utxos.items).toBeArray()
    expectTypeOf(utxos.fetchNextPage).toEqualTypeOf<() => void>()
    expectTypeOf(utxos.hasNextPage).toEqualTypeOf<boolean>()
    expectTypeOf(utxos.isFetchingNextPage).toEqualTypeOf<boolean>()
    // first item carries the UTXO shape (value in sats)
    if (utxos.items[0]) expectTypeOf(utxos.items[0].value).toEqualTypeOf<number>()
  })

  it('accepts limit but not a caller-supplied cursor (the hook owns it)', () => {
    useUtxos('bc1q…', { limit: 50 })
    // @ts-expect-error cursor is managed by the hook, not a hook option
    useUtxos('bc1q…', { cursor: 'abc' })
  })
})

describe('P4 — explicit config flows its own generics', () => {
  it('a passed config narrows network / chainId to ITS chains', () => {
    expectTypeOf(useNetwork({ config: signetConfig }).network).toEqualTypeOf<'mainnet' | 'signet'>()

    // signetConfig has signet; the Register default does not
    useBalance('bc1q…', { config: signetConfig, chainId: 'signet' })
    // @ts-expect-error 'testnet4' is not in signetConfig
    useBalance('bc1q…', { config: signetConfig, chainId: 'testnet4' })
  })
})
