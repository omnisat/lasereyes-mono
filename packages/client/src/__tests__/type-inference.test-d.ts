/**
 * Type-inference contract for the client package.
 *
 * @remarks
 * Run via `vitest typecheck`. This file contains no runtime assertions —
 * each `it` block exists purely so its body is typechecked. If a future
 * change breaks a contract here, `vitest typecheck` fails in CI.
 *
 * @module __tests__/type-inference
 */

import { describe, expectTypeOf, it } from 'vitest'
import { createWalletAccount } from '../account'
import type { Account, WalletAccount } from '../account/types'
import { walletBtcActions, type SendBtcParams } from '../actions/wallet-btc'
import { signingActions } from '../actions/wallet-signing'
import { MAINNET } from '../chains'
import { createClient } from '../client'
import type { Client, ClientConfig } from '../client/types'
import { createWalletClient } from '../client/wallet'
import type { WalletClient, WalletClientConfig } from '../client/wallet-types'
import { createChainDataSource } from '../data-source'
import type { BaseCapability, RuneCapability } from '../data-source/capabilities'
import type { SignedPsbt, Signer } from '../signer/types'
import { AddressType } from '../types/psbt'
import type { DataSourceContext, PaginatedResult, UTXO } from '../types'

// ============================================================================
// Fixtures (declared, never executed)
// ============================================================================

declare const baseCap: (ctx: DataSourceContext) => BaseCapability
declare const runeCap: (ctx: DataSourceContext) => RuneCapability
declare const signer: Signer

const account = createWalletAccount({
  addresses: [{ address: 'bc1q…', purpose: 'payment', type: AddressType.P2WPKH }],
  publicKeys: { payment: '02…', ordinals: '03…', taproot: '03…' },
})

// ============================================================================
// 1. Data source accumulates capabilities through .extend()
// ============================================================================

describe('ChainDataSource', () => {
  it('accumulates capability methods through .extend()', () => {
    const dsBase = createChainDataSource({ network: MAINNET }).extend(baseCap)

    expectTypeOf(dsBase.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()

    const dsBaseRune = dsBase.extend(runeCap)
    expectTypeOf(dsBaseRune.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    expectTypeOf(dsBaseRune.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
  })
})

// ============================================================================
// 2. Client: Config and dsMethods are inferred from createClient args
// ============================================================================

describe('createClient', () => {
  it('infers dsMethods from the data source argument', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const client = createClient({ network: MAINNET, dataSource: ds })

    expectTypeOf(client.config.network).toEqualTypeOf<typeof MAINNET>()
    expectTypeOf(client.config.dataSource).toEqualTypeOf<typeof ds>()
  })

  it('accumulates clientActions through .extend()', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const client = createClient({ network: MAINNET, dataSource: ds }).extend(_c => ({
      foo: () => 'bar' as const,
    }))

    expectTypeOf(client.foo).toEqualTypeOf<() => 'bar'>()
  })

  it('rejects non-ActionGroup .extend() callbacks', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const client = createClient({ network: MAINNET, dataSource: ds })

    // @ts-expect-error — TNew must extend ActionGroup; a number is not a record of fns.
    client.extend(() => 42)
  })
})

// ============================================================================
// 3. Wallet client + signing + wallet-btc compose in the documented order
// ============================================================================

describe('createWalletClient', () => {
  it('composes signing then wallet-btc actions', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account })
      .extend(signingActions(signer))
      .extend(walletBtcActions())

    expectTypeOf(wc.signPsbt).returns.resolves.toEqualTypeOf<SignedPsbt>()
    expectTypeOf(wc.sendBtc).parameter(0).toEqualTypeOf<SendBtcParams>()
    expectTypeOf(wc.sendBtc).returns.resolves.toEqualTypeOf<string>()
    expectTypeOf(wc.getBalance).returns.resolves.toEqualTypeOf<string>()
    expectTypeOf(wc.getUtxos).returns.resolves.toEqualTypeOf<PaginatedResult<UTXO>>()
  })

  it('rejects walletBtcActions before signingActions', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)

    // @ts-expect-error — walletBtcActions requires signPsbt on the client at extend time.
    createWalletClient({ network: MAINNET, dataSource: ds, account }).extend(walletBtcActions())
  })
})

// ============================================================================
// 4. Identity: extension preserves the Client / WalletClient kind
// ============================================================================

describe('Client identity', () => {
  it('preserves Client kind across extension', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const c1 = createClient({ network: MAINNET, dataSource: ds })
    const c2 = c1.extend(_c => ({ foo: () => 1 }))

    // Bare client: clientActions is the empty record.
    expectTypeOf(c1).toMatchTypeOf<
      Client<ClientConfig<BaseCapability>, BaseCapability, {}>
    >()

    // Extended client: clientActions has the added method.
    expectTypeOf(c2).toMatchTypeOf<
      Client<ClientConfig<BaseCapability>, BaseCapability, { foo: () => number }>
    >()
  })

  it('preserves WalletClient kind across extension', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account })
      .extend(signingActions(signer))

    // After signingActions extension, clientActions has signPsbt + signMessage.
    expectTypeOf(wc).toMatchTypeOf<
      WalletClient<
        WalletClientConfig<WalletAccount, BaseCapability>,
        WalletAccount,
        { signPsbt: (...args: any[]) => Promise<SignedPsbt>; signMessage: (...args: any[]) => Promise<string> },
        BaseCapability
      >
    >()
  })

  it('createWalletAccount yields a WalletAccount (which extends Account)', () => {
    expectTypeOf(account).toMatchTypeOf<WalletAccount>()
    expectTypeOf(account).toMatchTypeOf<Account>()
  })
})
