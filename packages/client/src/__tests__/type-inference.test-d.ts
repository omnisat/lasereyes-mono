/**
 * Type-inference contract for the client package.
 *
 * @remarks
 * This file is the type-level contract for `Client`, `WalletClient`,
 * `.extend()` accumulation, and the action factories. It contains no
 * runtime code — every check is performed by the TypeScript compiler.
 *
 * If a future change breaks a contract here, the type error surfaces in
 * CI (Phase 12 green-up) before the regression reaches users.
 *
 * Conventions:
 * - `Expect<Equal<A, B>>` asserts that two types are exactly equal.
 * - `// @ts-expect-error` asserts that the next line *must* fail to type-check.
 *
 * @module __tests__/type-inference
 */

import { MAINNET } from '../chains'
import { createClient } from '../client'
import { createWalletClient } from '../client/wallet'
import type { Client } from '../client/types'
import type { WalletClient } from '../client/wallet-types'
import { createChainDataSource } from '../data-source'
import type { BaseCapability, RuneCapability } from '../data-source/capabilities'
import { walletBtcActions } from '../actions/wallet-btc'
import { signingActions } from '../actions/wallet-signing'
import { createWalletAccount } from '../account'
import { AddressType } from '../types/psbt'
import type { Signer, SignedPsbt } from '../signer/types'

// ============================================================================
// Helpers
// ============================================================================

/** Compile-time assertion that `T` is `true`. */
// biome-ignore lint/correctness/noUnusedVariables: type-level identity
type Expect<T extends true> = T

/** Compile-time identity-equality between two types. */
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

// ============================================================================
// Test fixtures (pure type-level — no runtime calls)
// ============================================================================

declare const baseCap: (
  ctx: import('../types').DataSourceContext
) => BaseCapability
declare const runeCap: (
  ctx: import('../types').DataSourceContext
) => RuneCapability
declare const signer: Signer

const account = createWalletAccount({
  addresses: [{ address: 'bc1q…', purpose: 'payment', type: AddressType.P2WPKH }],
  publicKeys: { payment: '02…', ordinals: '03…', taproot: '03…' },
})

// ============================================================================
// 1. Data source accumulates capabilities through .extend()
// ============================================================================

const dsBase = createChainDataSource({ network: MAINNET }).extend(baseCap)
type _DSBase = Expect<Equal<typeof dsBase.btcGetBalance, BaseCapability['btcGetBalance']>>

const dsBaseRune = dsBase.extend(runeCap)
type _DSBaseRune_HasBase = Expect<
  Equal<typeof dsBaseRune.btcGetBalance, BaseCapability['btcGetBalance']>
>
type _DSBaseRune_HasRune = Expect<
  Equal<
    typeof dsBaseRune.runesGetAddressBalances,
    RuneCapability['runesGetAddressBalances']
  >
>

// ============================================================================
// 2. Client typechecks against its data source
// ============================================================================

const readClient = createClient({ network: MAINNET, dataSource: dsBase })
//    ^? Client<{ network; dataSource }, BaseCapability, {}>

// Reads the client's config types correctly.
type _ReadConfig_Network = Expect<Equal<typeof readClient.config.network, typeof MAINNET>>
type _ReadConfig_DS = Expect<Equal<typeof readClient.config.dataSource, typeof dsBase>>

// `.extend(...)` accumulates clientActions.
const readClientWithFoo = readClient.extend(_c => ({
  foo: () => 'bar' as const,
}))
type _ExtendAddsMethod = Expect<Equal<typeof readClientWithFoo.foo, () => 'bar'>>

// `.extend(non-action-group)` is rejected by the TNew constraint.
// @ts-expect-error — TNew must extend ActionGroup; a number isn't a record of fns
readClient.extend(() => 42)

// ============================================================================
// 3. Wallet client + signing + wallet-btc compose in the documented order
// ============================================================================

const walletClient = createWalletClient({ network: MAINNET, dataSource: dsBase, account })
  .extend(signingActions(signer))
  .extend(walletBtcActions())

// `signPsbt` shape matches the Signer contract.
type _SignPsbtShape = Expect<
  Equal<
    Awaited<ReturnType<typeof walletClient.signPsbt>>,
    SignedPsbt
  >
>

// `sendBtc` is exposed.
type _SendBtcExists = Expect<
  Equal<
    Parameters<typeof walletClient.sendBtc>[0],
    import('../actions/wallet-btc').SendBtcParams
  >
>

// `getBalance` is exposed and returns a string of satoshis.
type _GetBalanceShape = Expect<Equal<ReturnType<typeof walletClient.getBalance>, Promise<string>>>

// ============================================================================
// 4. Order matters: wallet-btc requires signPsbt to already be on the client
// ============================================================================

// @ts-expect-error — extending walletBtcActions() before signingActions(signer)
//                    fails because the client lacks signPsbt at extend time.
createWalletClient({ network: MAINNET, dataSource: dsBase, account }).extend(walletBtcActions())

// ============================================================================
// 5. Wallet client identity preserved as we add actions
// ============================================================================

// After both extensions, walletClient's WalletClient<...> wrapper is
// preserved — i.e., it's still a wallet client, not a plain Client.
declare const isWalletClient: <
  Config extends import('../client/wallet-types').WalletClientConfig<
    import('../account/types').WalletAccount,
    BaseCapability
  >,
  Actions extends import('../data-source/capabilities').ActionGroup,
>(
  c: WalletClient<Config, import('../account/types').WalletAccount, Actions, BaseCapability>
) => true
isWalletClient(walletClient)

// Plain Client also preserves its base type after extension.
declare const isClient: <
  Config extends import('../client/types').ClientConfig<BaseCapability>,
  Actions extends import('../data-source/capabilities').ActionGroup,
>(
  c: Client<Config, BaseCapability, Actions>
) => true
isClient(readClient)
isClient(readClientWithFoo)
