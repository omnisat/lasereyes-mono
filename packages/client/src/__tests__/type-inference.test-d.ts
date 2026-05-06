/**
 * Type-inference contract for the client package.
 *
 * @remarks
 * Run via `vitest typecheck`. This file contains no runtime assertions —
 * each `it` block exists purely so its body is typechecked. If a future
 * change breaks a contract here, `vitest typecheck` fails in CI.
 *
 * # Maintenance rules
 *
 * **Any change to a public type or signature in this package must come with
 * a corresponding update to this file.** Specifically:
 *
 * 1. **New action factory or new method on a client.** Add `expectTypeOf`
 *    coverage for its parameter and return types under the relevant
 *    `describe` block (`createWalletClient` for wallet methods,
 *    `createClient` for read-only methods, `Direct action calls` for the
 *    free-function form).
 * 2. **Changed action signature.** Update the matching assertion. Don't
 *    rely on the rest of the suite catching it — mismatched return types
 *    won't surface here unless asserted directly.
 * 3. **New ordering constraint.** Add a `// @ts-expect-error` block that
 *    encodes "extending in the wrong order is a compile error."
 * 4. **New negative case** (account/capability/signer mismatch). Add a
 *    `// @ts-expect-error` block.
 * 5. **New vendor or capability interface.** Add a check that the vendor's
 *    `createDataSource` returns `ChainDataSource<<correct capability set>>`,
 *    and that the capability methods are reachable from a client built on
 *    that data source.
 *
 * The contract is the source of truth — if these rules are followed, a
 * type-level regression cannot land without first showing up here.
 *
 * @module __tests__/type-inference
 */

import { describe, expectTypeOf, it } from 'vitest'
import { createReadOnlyAccount, createWalletAccount } from '../account'
import type { Account, AddressPurpose, WalletAccount } from '../account/types'
import { getBalance, getUtxos, sendBtc, walletBtcActions } from '../actions/wallet-btc'
import type { SendBtcParams } from '../actions/wallet-btc'
import { signMessage, signPsbt, signingActions } from '../actions/wallet-signing'
import { MAINNET, type ChainNetwork, type NetworkId, type NetworkType } from '../chains'
import { createClient } from '../client'
import type { Client, ClientConfig } from '../client/types'
import { createWalletClient } from '../client/wallet'
import type { WalletClient, WalletClientConfig } from '../client/wallet-types'
import { createChainDataSource, mergeDataSources } from '../data-source'
import type {
  AlkaneCapability,
  BaseCapability,
  Brc20Capability,
  InscriptionCapability,
  OrdCapability,
  RuneCapability,
} from '../data-source/capabilities'
import type {
  MessageSigningProtocol,
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
} from '../signer/types'
import { createDataSource as createMaestroDataSource } from '../vendors/maestro'
import { createDataSource as createMempoolDataSource } from '../vendors/mempool'
import { createDataSource as createSandshrewDataSource } from '../vendors/sandshrew'
import type { ChainDataSource, DataSourceContext, PaginatedResult, UTXO } from '../types'
import { AddressType } from '../types/psbt'

// ============================================================================
// Fixtures (declared, never executed)
// ============================================================================

declare const baseCap: (ctx: DataSourceContext) => BaseCapability
declare const runeCap: (ctx: DataSourceContext) => RuneCapability
declare const ordCap: (ctx: DataSourceContext) => OrdCapability
declare const signer: Signer

const walletAccount = createWalletAccount({
  addresses: [{ address: 'bc1q…', purpose: 'payment', type: AddressType.P2WPKH }],
  publicKeys: { payment: '02…', ordinals: '03…', taproot: '03…' },
})

const readonlyAccount = createReadOnlyAccount({
  addresses: [{ address: 'bc1q…', purpose: 'payment', type: AddressType.P2WPKH }],
})

// ============================================================================
// 1. Chains
// ============================================================================

describe('chains', () => {
  it('exposes ChainNetwork as a value object with id, type, and prefix', () => {
    expectTypeOf(MAINNET).toMatchTypeOf<ChainNetwork>()
    expectTypeOf(MAINNET.id).toEqualTypeOf<NetworkId>()
    expectTypeOf(MAINNET.type).toEqualTypeOf<NetworkType>()
  })
})

// ============================================================================
// 2. Account
// ============================================================================

describe('Account', () => {
  it('createWalletAccount yields a WalletAccount (which extends Account)', () => {
    expectTypeOf(walletAccount).toMatchTypeOf<WalletAccount>()
    expectTypeOf(walletAccount).toMatchTypeOf<Account>()
  })

  it('createReadOnlyAccount yields an Account but NOT a WalletAccount', () => {
    expectTypeOf(readonlyAccount).toMatchTypeOf<Account>()
    // @ts-expect-error — read-only account has no public keys; not a WalletAccount.
    expectTypeOf(readonlyAccount).toMatchTypeOf<WalletAccount>()
  })

  it('Account.getAddress accepts AddressPurpose and returns string', () => {
    expectTypeOf(walletAccount.getAddress).parameter(0).toEqualTypeOf<AddressPurpose | undefined>()
    expectTypeOf(walletAccount.getAddress).returns.toEqualTypeOf<string>()
  })

  it('WalletAccount.getPublicKey accepts AddressPurpose and returns string', () => {
    expectTypeOf(walletAccount.getPublicKey).parameter(0).toEqualTypeOf<AddressPurpose | undefined>()
    expectTypeOf(walletAccount.getPublicKey).returns.toEqualTypeOf<string>()
  })
})

// ============================================================================
// 3. Data source — accumulation, merge, vendor return shapes
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

  it('mergeDataSources unions the capability sets of both inputs', () => {
    const dsBase = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const dsRuneOrd = createChainDataSource({ network: MAINNET })
      .extend(runeCap)
      .extend(ordCap)

    const merged = mergeDataSources(dsBase, dsRuneOrd)

    // From dsBase
    expectTypeOf(merged.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    // From dsRuneOrd
    expectTypeOf(merged.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
    expectTypeOf(merged.ordGetAddress).toEqualTypeOf<OrdCapability['ordGetAddress']>()

    // The merged source is itself a ChainDataSource
    expectTypeOf(merged).toMatchTypeOf<ChainDataSource<BaseCapability & RuneCapability & OrdCapability>>()
  })
})

// ============================================================================
// 4. Vendor data source factories
// ============================================================================

describe('Vendor createDataSource factories', () => {
  it('mempool produces ChainDataSource<BaseCapability>', () => {
    const ds = createMempoolDataSource({ network: MAINNET })
    expectTypeOf(ds).toMatchTypeOf<ChainDataSource<BaseCapability>>()
    expectTypeOf(ds.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
  })

  it('sandshrew produces ChainDataSource<Base & Rune & Alkane & Inscription & Ord>', () => {
    const ds = createSandshrewDataSource({ network: MAINNET, apiKey: 'k' })
    expectTypeOf(ds).toMatchTypeOf<
      ChainDataSource<
        BaseCapability & RuneCapability & AlkaneCapability & InscriptionCapability & OrdCapability
      >
    >()
    expectTypeOf(ds.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    expectTypeOf(ds.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
    expectTypeOf(ds.alkanesGetByAddress).toEqualTypeOf<AlkaneCapability['alkanesGetByAddress']>()
    expectTypeOf(ds.inscriptionsGetByAddress).toEqualTypeOf<
      InscriptionCapability['inscriptionsGetByAddress']
    >()
    expectTypeOf(ds.ordGetAddress).toEqualTypeOf<OrdCapability['ordGetAddress']>()
  })

  it('maestro produces ChainDataSource<Base & Inscription & Brc20 & partial Rune>', () => {
    const ds = createMaestroDataSource({ network: MAINNET, apiKey: 'k' })
    expectTypeOf(ds.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    expectTypeOf(ds.brc20GetByTicker).toEqualTypeOf<Brc20Capability['brc20GetByTicker']>()
    expectTypeOf(ds.inscriptionsGetInfo).toEqualTypeOf<InscriptionCapability['inscriptionsGetInfo']>()
    // Partial rune: only id/name lookup is exposed by maestro
    expectTypeOf(ds.runesGetById).toEqualTypeOf<RuneCapability['runesGetById']>()
    expectTypeOf(ds.runesGetByName).toEqualTypeOf<RuneCapability['runesGetByName']>()
  })
})

// ============================================================================
// 5. Client (read-only) — inference, accumulation, identity
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

  it('preserves Client kind across extension', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const c1 = createClient({ network: MAINNET, dataSource: ds })
    const c2 = c1.extend(_c => ({ foo: () => 1 }))

    expectTypeOf(c1).toMatchTypeOf<
      Client<ClientConfig<BaseCapability>, BaseCapability, {}>
    >()
    expectTypeOf(c2).toMatchTypeOf<
      Client<ClientConfig<BaseCapability>, BaseCapability, { foo: () => number }>
    >()
  })
})

// ============================================================================
// 6. Wallet client — composition, ordering, exposed methods
// ============================================================================

describe('createWalletClient', () => {
  it('composes signing then wallet-btc actions, exposing all expected methods', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })
      .extend(signingActions(signer))
      .extend(walletBtcActions())

    // signing actions
    expectTypeOf(wc.signPsbt).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(wc.signPsbt).parameter(1).toEqualTypeOf<SignPsbtOptions | undefined>()
    expectTypeOf(wc.signPsbt).returns.resolves.toEqualTypeOf<SignedPsbt>()

    expectTypeOf(wc.signMessage).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(wc.signMessage).parameter(1).toEqualTypeOf<SignMessageOptions | undefined>()
    expectTypeOf(wc.signMessage).returns.resolves.toEqualTypeOf<string>()

    // wallet-btc actions
    expectTypeOf(wc.sendBtc).parameter(0).toEqualTypeOf<SendBtcParams>()
    expectTypeOf(wc.sendBtc).returns.resolves.toEqualTypeOf<string>()

    expectTypeOf(wc.getBalance).parameters.toEqualTypeOf<[]>()
    expectTypeOf(wc.getBalance).returns.resolves.toEqualTypeOf<string>()

    expectTypeOf(wc.getUtxos).parameter(0).toEqualTypeOf<AddressPurpose | undefined>()
    expectTypeOf(wc.getUtxos).returns.resolves.toEqualTypeOf<PaginatedResult<UTXO>>()
  })

  it('signing actions alone (without walletBtcActions) compose fine', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })
      .extend(signingActions(signer))

    expectTypeOf(wc.signPsbt).returns.resolves.toEqualTypeOf<SignedPsbt>()
    expectTypeOf(wc.signMessage).returns.resolves.toEqualTypeOf<string>()
  })

  it('rejects walletBtcActions before signingActions', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })

    // @ts-expect-error — walletBtcActions requires signPsbt on the client at extend time.
    wc.extend(walletBtcActions())
  })

  it('rejects walletBtcActions when the data source lacks BaseCapability methods', () => {
    // Data source with only RuneCapability — no btcGetAddressUtxos / btcBroadcastTransaction.
    const ds = createChainDataSource({ network: MAINNET }).extend(runeCap)
    const wc = createWalletClient({
      network: MAINNET,
      dataSource: ds,
      account: walletAccount,
    }).extend(signingActions(signer))

    // @ts-expect-error — base capabilities missing on the data source.
    wc.extend(walletBtcActions())
  })

  it('rejects walletBtcActions on a read-only account (needs WalletAccount for pubkey)', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      dataSource: ds,
      account: readonlyAccount,
    }).extend(signingActions(signer))

    // @ts-expect-error — sendBtc needs WalletAccount (for getPublicKey); ReadOnlyAccount has none.
    wc.extend(walletBtcActions())
  })

  it('preserves WalletClient kind across extension', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })
      .extend(signingActions(signer))

    expectTypeOf(wc).toMatchTypeOf<
      WalletClient<
        WalletClientConfig<WalletAccount, BaseCapability>,
        WalletAccount,
        {
          signPsbt: (...args: any[]) => Promise<SignedPsbt>
          signMessage: (...args: any[]) => Promise<string>
        },
        BaseCapability
      >
    >()
  })
})

// ============================================================================
// 7. Direct action calls — the free-function form
//
// Every action exposed via a factory must also be callable directly. Add a
// new `it` block here whenever a new action is added.
// ============================================================================

describe('Direct action calls', () => {
  it('sendBtc(client, params) typechecks against a properly-extended client', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })
      .extend(signingActions(signer))

    expectTypeOf(sendBtc(wc, { to: 'bc1q…', amount: 1000 })).resolves.toEqualTypeOf<string>()
  })

  it('getBalance(client) typechecks for any wallet client with btcGetBalance', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })

    expectTypeOf(getBalance(wc)).resolves.toEqualTypeOf<string>()
  })

  it('getUtxos(client, purpose) typechecks for any wallet client with btcGetAddressUtxos', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })

    expectTypeOf(getUtxos(wc, 'ordinals')).resolves.toEqualTypeOf<PaginatedResult<UTXO>>()
    expectTypeOf(getUtxos(wc)).resolves.toEqualTypeOf<PaginatedResult<UTXO>>()
  })

  it('signPsbt(client, signer, psbt, options) returns SignedPsbt', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })

    expectTypeOf(signPsbt(wc, signer, 'hex')).resolves.toEqualTypeOf<SignedPsbt>()
  })

  it('signMessage(client, signer, message, options) returns string', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })

    expectTypeOf(signMessage(wc, signer, 'hello')).resolves.toEqualTypeOf<string>()
  })

  it('sendBtc rejects clients missing signPsbt', () => {
    const ds = createChainDataSource({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, dataSource: ds, account: walletAccount })

    // @ts-expect-error — sendBtc requires signPsbt on clientActions; this client has none.
    sendBtc(wc, { to: 'bc1q…', amount: 1000 })
  })
})

// ============================================================================
// 8. Signer interface — message protocols and PSBT options
// ============================================================================

describe('Signer interface', () => {
  it('SignMessageOptions.protocol accepts the documented protocols', () => {
    expectTypeOf<MessageSigningProtocol>().toEqualTypeOf<'ecdsa' | 'bip322'>()

    const opts: SignMessageOptions = { address: 'bc1q…', protocol: 'bip322' }
    expectTypeOf(opts.protocol).toEqualTypeOf<MessageSigningProtocol | undefined>()
  })

  it('SignPsbtOptions carries finalize/broadcast/inputsToSign', () => {
    const opts: SignPsbtOptions = {
      finalize: true,
      broadcast: false,
      inputsToSign: [{ index: 0, address: 'bc1q…' }],
    }
    expectTypeOf(opts.finalize).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(opts.broadcast).toEqualTypeOf<boolean | undefined>()
  })

  it('SignedPsbt carries hex/base64 and optional txId/txHex', () => {
    const out: SignedPsbt = { psbtHex: '…', psbtBase64: '…' }
    expectTypeOf(out.psbtHex).toEqualTypeOf<string>()
    expectTypeOf(out.psbtBase64).toEqualTypeOf<string>()
    expectTypeOf(out.txId).toEqualTypeOf<string | undefined>()
    expectTypeOf(out.txHex).toEqualTypeOf<string | undefined>()
  })
})
