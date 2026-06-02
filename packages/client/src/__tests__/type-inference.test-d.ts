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
 *    `createBackend` returns `ChainBackend<<correct capability set>>`,
 *    and that the capability methods are reachable from a client built on
 *    that backend.
 *
 * The contract is the source of truth — if these rules are followed, a
 * type-level regression cannot land without first showing up here.
 *
 * @module __tests__/type-inference
 */

import { describe, expectTypeOf, it } from 'vitest'
import { createReadOnlyAccount, createWalletAccount } from '../account'
import type { Account, AddressPurpose, WalletAccount } from '../account/types'
import {
  brc20Actions,
  brc20WriteActions,
  type DeployBrc20Params,
  type MintBrc20Params,
  type TransferBrc20Params,
} from '../actions/brc20'
import {
  type InscribeParams,
  inscribe,
  inscriptionActions,
  inscriptionWriteActions,
  type SendInscriptionParams,
  sendInscription,
} from '../actions/inscriptions'
import { publicActions } from '../actions/public'
import { runeActions, runeWriteActions, type SendRuneParams, sendRune } from '../actions/runes'
import type { SendBtcParams } from '../actions/wallet'
import {
  broadcastPsbt,
  getAccountBalance,
  getAccountUtxos,
  sendBtc,
  signMessage,
  signPsbt,
  walletBtcActions,
} from '../actions/wallet'
import type {
  AlkaneCapability,
  BaseCapability,
  Brc20Capability,
  InscriptionCapability,
  OrdCapability,
  RuneCapability,
} from '../backends/capabilities'
import { createBackend as createMaestroBackend, maestro } from '../backends/maestro'
import { createBackend as createMempoolBackend, mempool } from '../backends/mempool'
import type { ChainBackendMethodsOf, MergedCapabilities } from '../backends/merged'
import {
  type ChainBackendFactory,
  combineBackends,
  createChainBackend,
  mergeChainBackends,
} from '../backends/primitives'
import { createBackend as createSandshrewBackend, sandshrew } from '../backends/sandshrew'
import { type ChainNetwork, MAINNET, type NetworkId, type NetworkType } from '../chains'
import { createClient } from '../client'
import type { Client, ClientConfig } from '../client/types'
import { createWalletClient } from '../client/wallet'
import type { WalletClient, WalletClientConfig } from '../client/wallet-types'
import type {
  MessageSigningProtocol,
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
} from '../signer/types'
import type {
  Brc20Balance,
  Brc20Info,
  ChainBackend,
  ChainBackendContext,
  FeeEstimate,
  Inscription,
  InscriptionInfo,
  OrdOutputWrapper,
  PaginatedResult,
  RuneBalance,
  RuneInfo,
  RuneOutpoint,
  Transaction,
  UTXO,
} from '../types'
import { AddressType } from '../types/psbt'

// ============================================================================
// Fixtures (declared, never executed)
// ============================================================================

declare const baseCap: (ctx: ChainBackendContext) => BaseCapability
declare const partialBaseCap: (
  ctx: ChainBackendContext
) => Pick<BaseCapability, 'btcBroadcastTransaction'>
declare const runeCap: (ctx: ChainBackendContext) => RuneCapability
declare const ordCap: (ctx: ChainBackendContext) => OrdCapability
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
  it('exposes ChainNetwork constants with literal-typed id and type fields', () => {
    // Each chain const is structurally a `ChainNetwork`.
    expectTypeOf(MAINNET).toMatchTypeOf<ChainNetwork>()

    // Literal preservation: `defineChain<const T>` keeps the `id` and `type`
    // fields as literal types on the exported const. This is load-bearing —
    // `createLaserEyesConfig({ chains: [MAINNET, TESTNET4] })` relies on
    // the literal IDs to constrain `backends` keys to `'mainnet' | 'testnet4'`.
    expectTypeOf(MAINNET.id).toEqualTypeOf<'mainnet'>()
    expectTypeOf(MAINNET.type).toEqualTypeOf<'mainnet'>()

    // The literal is a subtype of the open union.
    expectTypeOf<typeof MAINNET.id>().toMatchTypeOf<NetworkId>()
    expectTypeOf<typeof MAINNET.type>().toMatchTypeOf<NetworkType>()
  })

  it('createChainBackend accepts both NetworkId string and ChainNetwork value', () => {
    // Both forms must be accepted by the constructor and produce the same
    // shape of backend (`network` field is canonical `ChainNetwork`).
    const dsFromString = createChainBackend({ network: 'mainnet' })
    const dsFromValue = createChainBackend({ network: MAINNET })
    expectTypeOf(dsFromString.network).toEqualTypeOf<ChainNetwork>()
    expectTypeOf(dsFromValue.network).toEqualTypeOf<ChainNetwork>()
  })

  it('vendor createBackend factories accept both forms', () => {
    const mempoolFromString = createMempoolBackend({ network: 'mainnet' })
    const mempoolFromValue = createMempoolBackend({ network: MAINNET })
    expectTypeOf(mempoolFromString.network).toEqualTypeOf<ChainNetwork>()
    expectTypeOf(mempoolFromValue.network).toEqualTypeOf<ChainNetwork>()

    const sandshrewFromString = createSandshrewBackend({ network: 'mainnet', apiKey: 'k' })
    expectTypeOf(sandshrewFromString.network).toEqualTypeOf<ChainNetwork>()

    const maestroFromString = createMaestroBackend({ network: 'mainnet', apiKey: 'k' })
    expectTypeOf(maestroFromString.network).toEqualTypeOf<ChainNetwork>()
  })

  it('createClient accepts both NetworkId string and ChainNetwork value', () => {
    const ds = createMempoolBackend({ network: 'mainnet' })
    const c1 = createClient({ network: 'mainnet', backend: ds })
    const c2 = createClient({ network: MAINNET, backend: ds })
    expectTypeOf(c1.config.network).toEqualTypeOf<ChainNetwork>()
    expectTypeOf(c2.config.network).toEqualTypeOf<ChainNetwork>()
  })

  it('createWalletClient accepts both NetworkId string and ChainNetwork value', () => {
    const ds = createMempoolBackend({ network: 'mainnet' })
    const wc1 = createWalletClient({ network: 'mainnet', backend: ds, account: walletAccount })
    const wc2 = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })
    expectTypeOf(wc1.config.network).toEqualTypeOf<ChainNetwork>()
    expectTypeOf(wc2.config.network).toEqualTypeOf<ChainNetwork>()
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
    expectTypeOf(walletAccount.getPublicKey)
      .parameter(0)
      .toEqualTypeOf<AddressPurpose | undefined>()
    expectTypeOf(walletAccount.getPublicKey).returns.toEqualTypeOf<string>()
  })
})

// ============================================================================
// 3. Backend — accumulation, merge, vendor return shapes
// ============================================================================

describe('ChainBackend', () => {
  it('accumulates capability methods through .extend()', () => {
    const dsBase = createChainBackend({ network: MAINNET }).extend(baseCap)
    expectTypeOf(dsBase.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()

    const dsBaseRune = dsBase.extend(runeCap)
    expectTypeOf(dsBaseRune.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    expectTypeOf(dsBaseRune.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
  })

  it('mergeChainBackends unions the capability sets of both inputs', () => {
    const dsBase = createChainBackend({ network: MAINNET }).extend(baseCap)
    const dsRuneOrd = createChainBackend({ network: MAINNET }).extend(runeCap).extend(ordCap)

    const merged = mergeChainBackends(dsBase, dsRuneOrd)

    // From dsBase
    expectTypeOf(merged.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    // From dsRuneOrd
    expectTypeOf(merged.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
    expectTypeOf(merged.ordGetAddress).toEqualTypeOf<OrdCapability['ordGetAddress']>()

    // The merged source is itself a ChainBackend
    expectTypeOf(merged).toMatchTypeOf<
      ChainBackend<BaseCapability & RuneCapability & OrdCapability>
    >()
  })
})

// ============================================================================
// 4. Vendor backend factories
// ============================================================================

describe('Vendor createBackend factories', () => {
  it('mempool produces ChainBackend<BaseCapability>', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    expectTypeOf(ds).toMatchTypeOf<ChainBackend<BaseCapability>>()
    expectTypeOf(ds.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
  })

  it('sandshrew produces ChainBackend<Base & Rune & Alkane & Inscription & Ord>', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    expectTypeOf(ds).toMatchTypeOf<
      ChainBackend<
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

  it('maestro produces ChainBackend<Base & Inscription & Brc20 & partial Rune>', () => {
    const ds = createMaestroBackend({ network: MAINNET, apiKey: 'k' })
    expectTypeOf(ds.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    expectTypeOf(ds.brc20GetByTicker).toEqualTypeOf<Brc20Capability['brc20GetByTicker']>()
    expectTypeOf(ds.inscriptionsGetInfo).toEqualTypeOf<
      InscriptionCapability['inscriptionsGetInfo']
    >()
    // Partial rune: only id/name lookup is exposed by maestro
    expectTypeOf(ds.runesGetById).toEqualTypeOf<RuneCapability['runesGetById']>()
    expectTypeOf(ds.runesGetByName).toEqualTypeOf<RuneCapability['runesGetByName']>()
  })
})

// ============================================================================
// 4a. Read-side factories typecheck on a BROAD-DS client
//
// Regression guard: if the Client type ever gets collapsed back from
// `{ config } & { extend } & clientActions` to a single `{ config, extend
// } & clientActions`, single-method resolution kicks in and the factory's
// `Actions extends ActionGroup` constraint can't bind against the bare
// client's `clientActions = {}`. These tests fail in that scenario.
// ============================================================================

describe('Read-side factories on broad-DS clients', () => {
  it('publicActions extends a sandshrew client (BaseCapability slice)', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds }).extend(publicActions())
    expectTypeOf(c.getAddressBalance).returns.resolves.toEqualTypeOf<string>()
  })

  it('runeActions extends a sandshrew client (RuneCapability slice)', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds }).extend(runeActions())
    expectTypeOf(c.getRuneBalances).returns.resolves.toEqualTypeOf<PaginatedResult<RuneBalance>>()
  })

  it('inscriptionActions extends a sandshrew client (InscriptionCapability slice)', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds }).extend(inscriptionActions())
    expectTypeOf(c.getInscriptionsByAddress).returns.resolves.toEqualTypeOf<
      PaginatedResult<Inscription>
    >()
  })

  it('brc20Actions extends a maestro client (Brc20Capability slice)', () => {
    const ds = createMaestroBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds }).extend(brc20Actions())
    expectTypeOf(c.getBrc20Balances).returns.resolves.toEqualTypeOf<PaginatedResult<Brc20Balance>>()
  })
})

// ============================================================================
// 5. Client (read-only) — inference, accumulation, identity
// ============================================================================

describe('createClient', () => {
  it('infers dsMethods from the backend argument', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const client = createClient({ network: MAINNET, backend: ds })

    // `ClientConfig.network` is typed as the broad `ChainNetwork` — chain
    // literal types are NOT yet threaded through `createClient`. (Phase 10
    // introduces per-chain precision via the keystone `getClient(config,
    // { chainId })`.) `dsMethods` IS threaded through, so `backend`
    // retains its precise type.
    expectTypeOf(client.config.network).toEqualTypeOf<ChainNetwork>()
    expectTypeOf(client.config.backend).toEqualTypeOf<typeof ds>()
  })

  it('accumulates clientActions through .extend()', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const client = createClient({ network: MAINNET, backend: ds }).extend(_c => ({
      foo: () => 'bar' as const,
    }))

    expectTypeOf(client.foo).toEqualTypeOf<() => 'bar'>()
  })

  it('rejects non-ActionGroup .extend() callbacks', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const client = createClient({ network: MAINNET, backend: ds })

    // @ts-expect-error — TNew must extend ActionGroup; a number is not a record of fns.
    client.extend(() => 42)
  })

  it('rejects calls to methods that no factory has added', () => {
    // Regression guard: a freshly-built client must NOT structurally permit
    // arbitrary method calls. If the bare client's clientActions slot is
    // typed as `ActionGroup` (instead of `{}`), the index signature
    // `[k: string]: AnyFn` flows through and `client.frobnicate()` would
    // typecheck. Keep the slot at `{}` so this stays a compile error.
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const client = createClient({ network: MAINNET, backend: ds })

    // @ts-expect-error — `frobnicate` was never added by any factory.
    client.frobnicate()
    // @ts-expect-error — same reason; no read-only public actions extended yet.
    client.getAddressBalance('bc1q')
  })

  it('preserves Client kind across extension', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const c1 = createClient({ network: MAINNET, backend: ds })
    const c2 = c1.extend(_c => ({ foo: () => 1 }))

    expectTypeOf(c1).toMatchTypeOf<Client<ClientConfig<BaseCapability>, BaseCapability, {}>>()
    expectTypeOf(c2).toMatchTypeOf<
      Client<ClientConfig<BaseCapability>, BaseCapability, { foo: () => number }>
    >()
  })
})

// ============================================================================
// 6. Wallet client — composition, exposed methods
//
// signingActions was folded into walletBtcActions — one extend installs the
// full base wallet surface (signing primitives + BTC ops).
// ============================================================================

describe('createWalletClient', () => {
  it('walletBtcActions exposes the full base wallet surface', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    }).extend(walletBtcActions())

    // signing primitives
    expectTypeOf(wc.signPsbt).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(wc.signPsbt).parameter(1).toEqualTypeOf<SignPsbtOptions | undefined>()
    expectTypeOf(wc.signPsbt).returns.resolves.toEqualTypeOf<SignedPsbt>()

    expectTypeOf(wc.signMessage).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(wc.signMessage).parameter(1).toEqualTypeOf<SignMessageOptions | undefined>()
    expectTypeOf(wc.signMessage).returns.resolves.toEqualTypeOf<string>()

    expectTypeOf(wc.broadcastPsbt).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(wc.broadcastPsbt).returns.resolves.toEqualTypeOf<string>()

    // BTC ops
    expectTypeOf(wc.sendBtc).parameter(0).toEqualTypeOf<SendBtcParams>()
    expectTypeOf(wc.sendBtc).returns.resolves.toEqualTypeOf<string>()

    // getAccountBalance(account?, purpose?) — both optional; defaults to client.config.account and 'payment'.
    expectTypeOf(wc.getAccountBalance).parameter(0).toEqualTypeOf<WalletAccount | undefined>()
    expectTypeOf(wc.getAccountBalance).parameter(1).toEqualTypeOf<AddressPurpose | undefined>()
    expectTypeOf(wc.getAccountBalance).returns.resolves.toEqualTypeOf<string>()

    // getAccountUtxos(account, purpose?) — account required, purpose defaults to 'payment'.
    expectTypeOf(wc.getAccountUtxos).parameter(0).toEqualTypeOf<WalletAccount>()
    expectTypeOf(wc.getAccountUtxos).parameter(1).toEqualTypeOf<AddressPurpose | undefined>()
    expectTypeOf(wc.getAccountUtxos).returns.resolves.toEqualTypeOf<PaginatedResult<UTXO>>()
  })

  it('rejects walletBtcActions when the backend lacks btcGetAddressUtxos', () => {
    // Use the partialBaseCap fixture (declared at top of file).
    const ds = createChainBackend({ network: MAINNET }).extend(partialBaseCap)
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // @ts-expect-error — walletBtcActions needs btcGetAddressUtxos which is not on this ds.
    wc.extend(walletBtcActions())
  })

  it('rejects walletBtcActions on a read-only account (needs WalletAccount for pubkey)', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: readonlyAccount,
    })

    // @ts-expect-error — sendBtc needs WalletAccount (for getPublicKey); ReadOnlyAccount has none.
    wc.extend(walletBtcActions())
  })

  it('preserves WalletClient kind across extension', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    }).extend(walletBtcActions())

    expectTypeOf(wc).toMatchTypeOf<
      WalletClient<
        WalletClientConfig<WalletAccount, BaseCapability>,
        WalletAccount,
        {
          signPsbt: (...args: any[]) => Promise<SignedPsbt>
          signMessage: (...args: any[]) => Promise<string>
          broadcastPsbt: (...args: any[]) => Promise<string>
          sendBtc: (...args: any[]) => Promise<string>
          getAccountBalance: (...args: any[]) => Promise<string>
          getAccountUtxos: (...args: any[]) => Promise<PaginatedResult<UTXO>>
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
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    }).extend(walletBtcActions())

    expectTypeOf(sendBtc(wc, { to: 'bc1q…', amount: 1000 })).resolves.toEqualTypeOf<string>()
  })

  it('getAccountBalance(client) defaults to client.config.account + payment purpose', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // Both account and purpose optional — defaults to client.config.account + 'payment'.
    expectTypeOf(getAccountBalance(wc)).resolves.toEqualTypeOf<string>()
    expectTypeOf(getAccountBalance(wc, walletAccount)).resolves.toEqualTypeOf<string>()
    expectTypeOf(getAccountBalance(wc, walletAccount, 'ordinals')).resolves.toEqualTypeOf<string>()
  })

  it('getAccountUtxos(client, account, purpose?) — account required, purpose defaults to payment', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    expectTypeOf(getAccountUtxos(wc, walletAccount, 'ordinals')).resolves.toEqualTypeOf<
      PaginatedResult<UTXO>
    >()
    expectTypeOf(getAccountUtxos(wc, walletAccount)).resolves.toEqualTypeOf<PaginatedResult<UTXO>>()
  })

  it('signPsbt(client, psbt, options) reads signer from client.config.signer', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
      signer,
    })

    // No signer arg — read from config at runtime.
    expectTypeOf(signPsbt(wc, 'hex')).resolves.toEqualTypeOf<SignedPsbt>()
  })

  it('signMessage(client, message, options) reads signer from client.config.signer', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
      signer,
    })

    expectTypeOf(signMessage(wc, 'hello')).resolves.toEqualTypeOf<string>()
  })

  it('sendBtc compiles against any wallet client (no Actions constraint)', () => {
    // Free-function path: no `Actions extends RequiredSigningActions` constraint
    // on the free function. Composition uses getAction at runtime; the
    // missing-signer error surfaces from the free `signPsbt` reading
    // `client.config.signer` (here we pass a signer to keep the call legal at
    // runtime; if omitted, signPsbt would throw at call time).
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
      signer,
    })

    expectTypeOf(sendBtc(wc, { to: 'bc1q…', amount: 1000 })).resolves.toEqualTypeOf<string>()
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

// ============================================================================
// 9. publicActions — read-only Bitcoin operations on a Client
// ============================================================================

describe('publicActions', () => {
  it('extends a client with the full BaseCapability surface', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const c = createClient({ network: MAINNET, backend: ds }).extend(publicActions())

    expectTypeOf(c.getAddressBalance).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(c.getAddressBalance).returns.resolves.toEqualTypeOf<string>()

    expectTypeOf(c.getAddressUtxos).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(c.getAddressUtxos).returns.resolves.toEqualTypeOf<PaginatedResult<UTXO>>()

    expectTypeOf(c.getTransaction).returns.resolves.toEqualTypeOf<Transaction>()
    expectTypeOf(c.broadcastTransaction).returns.resolves.toEqualTypeOf<string>()
    expectTypeOf(c.getRecommendedFees).returns.resolves.toEqualTypeOf<FeeEstimate>()
    expectTypeOf(c.getOutputValue).returns.resolves.toEqualTypeOf<number | null>()
    expectTypeOf(c.waitForTransaction).returns.resolves.toEqualTypeOf<boolean>()
  })

  it('rejects publicActions when the backend lacks BaseCapability', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(runeCap)
    const c = createClient({ network: MAINNET, backend: ds })

    // @ts-expect-error — publicActions requires full BaseCapability on the backend.
    c.extend(publicActions())
  })
})

// ============================================================================
// 10. runeActions — read-only Runes operations
// ============================================================================

describe('runeActions', () => {
  it('extends a client with the full RuneCapability surface', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds }).extend(runeActions())

    expectTypeOf(c.getRuneBalances).returns.resolves.toEqualTypeOf<PaginatedResult<RuneBalance>>()
    expectTypeOf(c.getRuneById).returns.resolves.toEqualTypeOf<RuneInfo>()
    expectTypeOf(c.getRuneByName).returns.resolves.toEqualTypeOf<RuneInfo>()
    expectTypeOf(c.getRuneOutpoints).returns.resolves.toEqualTypeOf<PaginatedResult<RuneOutpoint>>()
    expectTypeOf(c.batchGetRuneOutputs).returns.resolves.toEqualTypeOf<OrdOutputWrapper[]>()
  })

  it('rejects runeActions when backend has only partial RuneCapability', () => {
    // Maestro provides only runesGetById/runesGetByName — not the full RuneCapability.
    const ds = createMaestroBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds })

    // @ts-expect-error — runeActions requires the full RuneCapability.
    c.extend(runeActions())
  })

  it('runeWriteActions exposes sendRune (stubbed signature)', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })
      .extend(walletBtcActions())
      .extend(runeWriteActions())

    expectTypeOf(wc.sendRune).parameter(0).toEqualTypeOf<SendRuneParams>()
    expectTypeOf(wc.sendRune).returns.resolves.toEqualTypeOf<string>()
  })

  it('rejects runeWriteActions before walletBtcActions', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // @ts-expect-error — sendRune requires signPsbt on the client.
    wc.extend(runeWriteActions())
  })

  it('sendRune (free fn) is callable directly', () => {
    const ds = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    }).extend(walletBtcActions())

    expectTypeOf(
      sendRune(wc, { to: 'bc1q…', runeId: '840000:1', amount: '100' })
    ).resolves.toEqualTypeOf<string>()
  })
})

// ============================================================================
// 11. brc20Actions — read + write
// ============================================================================

describe('brc20Actions', () => {
  it('extends a client with the full Brc20Capability surface', () => {
    const ds = createMaestroBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds }).extend(brc20Actions())

    expectTypeOf(c.getBrc20Balances).returns.resolves.toEqualTypeOf<PaginatedResult<Brc20Balance>>()
    expectTypeOf(c.getBrc20ByTicker).returns.resolves.toEqualTypeOf<Brc20Info>()
  })

  it('brc20WriteActions exposes deploy/mint/transfer (stubbed)', () => {
    const ds = createMaestroBackend({ network: MAINNET, apiKey: 'k' })
    // Maestro lacks btcGetAddressUtxos so writes need a merged source, but for
    // the type-shape check we pretend mempool joined in.
    const merged = mergeChainBackends(ds, createMempoolBackend({ network: MAINNET }))
    const wc = createWalletClient({ network: MAINNET, backend: merged, account: walletAccount })
      .extend(walletBtcActions())
      .extend(brc20WriteActions())

    expectTypeOf(wc.deployBrc20).parameter(0).toEqualTypeOf<DeployBrc20Params>()
    expectTypeOf(wc.deployBrc20).returns.resolves.toEqualTypeOf<string>()

    expectTypeOf(wc.mintBrc20).parameter(0).toEqualTypeOf<MintBrc20Params>()
    expectTypeOf(wc.mintBrc20).returns.resolves.toEqualTypeOf<string>()

    expectTypeOf(wc.transferBrc20).parameter(0).toEqualTypeOf<TransferBrc20Params>()
    expectTypeOf(wc.transferBrc20).returns.resolves.toEqualTypeOf<string>()
  })

  it('rejects brc20WriteActions before walletBtcActions', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // @ts-expect-error — write actions need signPsbt extended first.
    wc.extend(brc20WriteActions())
  })
})

// ============================================================================
// 12. inscriptionActions — read + write
// ============================================================================

describe('inscriptionActions', () => {
  it('extends a client with the full InscriptionCapability surface', () => {
    const ds = createMaestroBackend({ network: MAINNET, apiKey: 'k' })
    const c = createClient({ network: MAINNET, backend: ds }).extend(inscriptionActions())

    expectTypeOf(c.getInscriptionsByAddress).returns.resolves.toEqualTypeOf<
      PaginatedResult<Inscription>
    >()
    expectTypeOf(c.getInscriptionInfo).returns.resolves.toEqualTypeOf<InscriptionInfo>()
    expectTypeOf(c.batchGetInscriptionInfo).returns.resolves.toEqualTypeOf<InscriptionInfo[]>()
  })

  it('inscriptionWriteActions exposes inscribe/sendInscription (stubbed)', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })
      .extend(walletBtcActions())
      .extend(inscriptionWriteActions())

    expectTypeOf(wc.inscribe).parameter(0).toEqualTypeOf<InscribeParams>()
    expectTypeOf(wc.inscribe).returns.resolves.toEqualTypeOf<string>()

    expectTypeOf(wc.sendInscription).parameter(0).toEqualTypeOf<SendInscriptionParams>()
    expectTypeOf(wc.sendInscription).returns.resolves.toEqualTypeOf<string>()
  })

  it('inscribe + sendInscription are callable as free functions', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    }).extend(walletBtcActions())

    expectTypeOf(
      inscribe(wc, { contentType: 'text/plain', content: 'hello' })
    ).resolves.toEqualTypeOf<string>()
    expectTypeOf(
      sendInscription(wc, { inscriptionId: 'abc…i0', to: 'bc1q…' })
    ).resolves.toEqualTypeOf<string>()
  })

  it('rejects inscriptionWriteActions before walletBtcActions', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // @ts-expect-error — write actions need signPsbt extended first.
    wc.extend(inscriptionWriteActions())
  })
})

// ============================================================================
// 13. broadcastPsbt — exposed by walletBtcActions
// ============================================================================

describe('broadcastPsbt', () => {
  it('exposed on the client after walletBtcActions extension', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    }).extend(walletBtcActions())

    expectTypeOf(wc.broadcastPsbt).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(wc.broadcastPsbt).returns.resolves.toEqualTypeOf<string>()
  })

  it('callable as a free function', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
      signer,
    })

    expectTypeOf(broadcastPsbt(wc, 'psbthex')).resolves.toEqualTypeOf<string>()
  })

  it('rejects walletBtcActions when backend lacks btcBroadcastTransaction', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(runeCap)
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // @ts-expect-error — walletBtcActions needs btcGetAddressUtxos | btcBroadcastTransaction | btcGetBalance.
    wc.extend(walletBtcActions())
  })

  it('walletBtcActions reads signer from client.config.signer', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
      signer,
    }).extend(walletBtcActions())

    // Type-only: confirms the factory shape doesn't require a signer argument.
    // Runtime behavior (read from config, throw if absent) lives in the
    // action bodies; not asserted here.
    expectTypeOf(wc.signPsbt).parameter(0).toEqualTypeOf<string>()
  })
})

// ============================================================================
// 14. Anti-clobber — `.extend()` rejects redeclaring reserved members
//
// This is the viem-style `Extension<Reserved>` constraint at work. The
// factory's return type cannot redeclare keys that the receiver reserves
// (e.g. `config`, `extend` on Client/WalletClient; `network`,
// `getCapabilities`, `extend` on ChainBackend). Other keys are permitted.
// ============================================================================

describe('Extension anti-clobber', () => {
  it('Client.extend rejects redeclaring `config`', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const c = createClient({ network: MAINNET, backend: ds })

    // @ts-expect-error — `config` is a reserved member of Client.
    c.extend(() => ({ config: 'oops' }))
  })

  it('Client.extend rejects redeclaring `extend`', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const c = createClient({ network: MAINNET, backend: ds })

    // @ts-expect-error — `extend` is a reserved member of Client.
    c.extend(() => ({ extend: () => 'oops' }))
  })

  it('Client.extend permits adding non-reserved keys with arbitrary value types', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const c = createClient({ network: MAINNET, backend: ds }).extend(() => ({
      foo: () => 'bar' as const,
      lastBlock: 12345,
      meta: { source: 'mempool' as const },
    }))

    expectTypeOf(c.foo).toEqualTypeOf<() => 'bar'>()
    expectTypeOf(c.lastBlock).toEqualTypeOf<number>()
    expectTypeOf(c.meta).toMatchTypeOf<{ source: 'mempool' }>()
  })

  it('WalletClient.extend rejects redeclaring `config`', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    })

    // @ts-expect-error — `config` is a reserved member of WalletClient.
    wc.extend(() => ({ config: 'oops' }))
  })

  it('WalletClient.extend rejects redeclaring `extend`', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({
      network: MAINNET,
      backend: ds,
      account: walletAccount,
    })

    // @ts-expect-error — `extend` is a reserved member of WalletClient.
    wc.extend(() => ({ extend: () => 'oops' }))
  })

  // ============================================================================
  // ExtendableProtectedActions shape-validation — overrides of registered
  // action names must match their canonical signature. Mirrors viem's
  // `ExactPartial<ExtendableProtectedActions>` constraint on `.extend()`.
  // ============================================================================

  it('Client.extend accepts a correctly-shaped getAddressBalance override', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const c = createClient({ network: MAINNET, backend: ds })

    // Matches the canonical signature (string → Promise<string>).
    const cx = c.extend(() => ({
      getAddressBalance: async (_address: string) => '0',
    }))
    expectTypeOf(cx.getAddressBalance).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(cx.getAddressBalance).returns.resolves.toEqualTypeOf<string>()
  })

  it('Client.extend rejects a mis-shaped getAddressBalance override', () => {
    const ds = createMempoolBackend({ network: MAINNET })
    const c = createClient({ network: MAINNET, backend: ds })

    // @ts-expect-error — canonical shape is `(address: string) => Promise<string>`.
    // Returning `'oops'` (literal, not a Promise) or accepting `number` violates the registry.
    c.extend(() => ({ getAddressBalance: (_address: number) => 'oops' }))
  })

  it('WalletClient.extend rejects a mis-shaped getAccountBalance override', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // @ts-expect-error — canonical shape takes (WalletAccount?, AddressPurpose?), not (string).
    wc.extend(() => ({ getAccountBalance: async (_address: string) => '0' }))
  })

  it('WalletClient.extend rejects a mis-shaped signPsbt override', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const wc = createWalletClient({ network: MAINNET, backend: ds, account: walletAccount })

    // @ts-expect-error — canonical signPsbt returns Promise<SignedPsbt>, not Promise<string>.
    wc.extend(() => ({ signPsbt: async (_psbt: string) => 'just-a-string' }))
  })

  it('Client.extend permits novel (non-registered) keys with any shape', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const c = createClient({ network: MAINNET, backend: ds }).extend(() => ({
      lastSeenBlock: 850000,
      cache: new Map<string, unknown>(),
      ping: async () => true,
    }))

    // Novel keys land on the client unchanged — only registry-overlapping
    // keys are constrained.
    expectTypeOf(c.lastSeenBlock).toEqualTypeOf<number>()
    expectTypeOf(c.ping).returns.resolves.toEqualTypeOf<boolean>()
  })

  it('ChainBackend.extend rejects redeclaring `network`', () => {
    const ds = createChainBackend({ network: MAINNET })

    // @ts-expect-error — `network` is a reserved member of ChainBackend.
    ds.extend(() => ({ network: MAINNET }))
  })

  it('ChainBackend.extend rejects redeclaring `getCapabilities`', () => {
    const ds = createChainBackend({ network: MAINNET })

    // @ts-expect-error — `getCapabilities` is reserved on ChainBackend.
    ds.extend(() => ({ getCapabilities: () => [] }))
  })

  it('ChainBackend.extend rejects redeclaring `extend`', () => {
    const ds = createChainBackend({ network: MAINNET })

    // @ts-expect-error — `extend` is reserved on ChainBackend.
    ds.extend(() => ({ extend: () => 'oops' }))
  })

  it('ChainBackend.extend permits adding capability methods', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(() => ({
      myCustomFetch: (id: string) => Promise.resolve({ id }),
    }))

    expectTypeOf(ds.myCustomFetch).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(ds.myCustomFetch).returns.resolves.toMatchTypeOf<{ id: string }>()
  })

  it('Base members survive extension on Client', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(baseCap)
    const extended = createClient({ network: MAINNET, backend: ds }).extend(() => ({
      foo: () => 1,
    }))

    // After extension, `config` and `extend` are still reachable.
    // (Note: `network` is `ChainNetwork`, not `typeof MAINNET` — Client doesn't
    // thread chain precision yet; that's Phase 10's keystone work.)
    expectTypeOf(extended.config).toMatchTypeOf<{ network: ChainNetwork }>()
    expectTypeOf(extended.extend).toMatchTypeOf<Function>()
  })

  it('Base members survive extension on ChainBackend', () => {
    const ds = createChainBackend({ network: MAINNET }).extend(() => ({
      thing: () => 'x' as const,
    }))

    // `ds.network` is `ChainNetwork` — `createChainBackend` doesn't thread
    // chain precision into the backend's network field.
    expectTypeOf(ds.network).toEqualTypeOf<ChainNetwork>()
    expectTypeOf(ds.getCapabilities).toMatchTypeOf<Function>()
    expectTypeOf(ds.extend).toMatchTypeOf<Function>()
    expectTypeOf(ds.thing).toEqualTypeOf<() => 'x'>()
  })
})

// ============================================================================
// 15. `MergedCapabilities<T>` — fold a tuple of ChainBackend into one
// intersection of dsMethods, with the inherited index signature stripped.
//
// This is the type-level companion to `mergeChainBackends` (the runtime fold).
// Phase 10's keystone consumes it to give precisely-typed merged clients.
// ============================================================================

// Module-level fixtures (declare's must live here, not inside `it()` bodies).
const _sandshrewForMerge = createSandshrewBackend({ network: MAINNET, apiKey: 'k' })
const _mempoolForMerge = createMempoolBackend({ network: MAINNET })
const _maestroForMerge = createMaestroBackend({ network: MAINNET, apiKey: 'k' })

// User-defined capability — must `extends ActionGroup` to satisfy
// `ChainBackend<dsMethods extends ActionGroup>`. (Currently a ceremony
// requirement; revisit if/when we relax the constraint package-wide.)
interface _MyCustom extends ActionGroupBrand {
  myCustomFetch(id: string): Promise<{ data: number }>
}
type ActionGroupBrand = { [k: string]: (...args: any[]) => any }

declare const _customA: ChainBackend<_MyCustom>

declare const _cap1: ChainBackend<{ a: () => Promise<1>; [k: string]: (...args: any[]) => any }>
declare const _cap2: ChainBackend<{ b: () => Promise<2>; [k: string]: (...args: any[]) => any }>
declare const _cap3: ChainBackend<{ c: () => Promise<3>; [k: string]: (...args: any[]) => any }>
declare const _cap4: ChainBackend<{ d: () => Promise<4>; [k: string]: (...args: any[]) => any }>
declare const _cap5: ChainBackend<{ e: () => Promise<5>; [k: string]: (...args: any[]) => any }>

declare const _mergedTwo: MergedCapabilities<
  readonly [typeof _sandshrewForMerge, typeof _mempoolForMerge]
>
declare const _mergedTen: MergedCapabilities<
  readonly [
    typeof _cap1,
    typeof _cap2,
    typeof _cap3,
    typeof _cap4,
    typeof _cap5,
    typeof _cap1,
    typeof _cap2,
    typeof _cap3,
    typeof _cap4,
    typeof _cap5,
  ]
>

describe('ChainBackendMethodsOf', () => {
  it('extracts dsMethods from a ChainBackend', () => {
    type Extracted = ChainBackendMethodsOf<typeof _sandshrewForMerge>
    expectTypeOf<Extracted>().toMatchTypeOf<BaseCapability>()
    expectTypeOf<Extracted>().toMatchTypeOf<RuneCapability>()
  })

  it('returns never for a non-ChainBackend type', () => {
    expectTypeOf<ChainBackendMethodsOf<string>>().toEqualTypeOf<never>()
    expectTypeOf<ChainBackendMethodsOf<{ foo: 1 }>>().toEqualTypeOf<never>()
  })
})

describe('MergedCapabilities', () => {
  it("single-element tuple → that element's dsMethods are reachable", () => {
    type Single = MergedCapabilities<readonly [typeof _mempoolForMerge]>
    expectTypeOf<Single>().toMatchTypeOf<BaseCapability>()
  })

  it('two-element tuple → merged type extends each component capability', () => {
    type Pair = MergedCapabilities<readonly [typeof _sandshrewForMerge, typeof _mempoolForMerge]>
    expectTypeOf<Pair>().toMatchTypeOf<BaseCapability>()
    expectTypeOf<Pair>().toMatchTypeOf<RuneCapability>()
    expectTypeOf<Pair>().toMatchTypeOf<AlkaneCapability>()
    expectTypeOf<Pair>().toMatchTypeOf<InscriptionCapability>()
    expectTypeOf<Pair>().toMatchTypeOf<OrdCapability>()
  })

  it('three-element tuple — adding maestro brings Brc20Capability into the merge', () => {
    type Triple = MergedCapabilities<
      readonly [typeof _sandshrewForMerge, typeof _mempoolForMerge, typeof _maestroForMerge]
    >
    expectTypeOf<Triple>().toMatchTypeOf<Brc20Capability>()
    expectTypeOf<Triple>().toMatchTypeOf<RuneCapability>()
  })

  it('strips the index signature from the merged type', () => {
    // If the inherited index signature `[k: string]: AnyFn` flowed through,
    // `string extends keyof Single` would be `true`. WithoutIndexSig strips
    // it so only declared method keys remain.
    type Single = MergedCapabilities<readonly [typeof _mempoolForMerge]>
    expectTypeOf<string extends keyof Single ? true : false>().toEqualTypeOf<false>()
  })

  it('keys not present in the source array are correctly absent', () => {
    // mempool alone is BaseCapability-shaped — no rune methods.
    type MempoolOnly = MergedCapabilities<readonly [typeof _mempoolForMerge]>
    expectTypeOf<
      'runesGetAddressBalances' extends keyof MempoolOnly ? true : false
    >().toEqualTypeOf<false>()
  })

  it('declared methods are reachable on a value of the merged type', () => {
    expectTypeOf(_mergedTwo.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
    expectTypeOf(_mergedTwo.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
    expectTypeOf(_mergedTwo.alkanesGetByAddress).toEqualTypeOf<
      AlkaneCapability['alkanesGetByAddress']
    >()
    expectTypeOf(_mergedTwo.ordGetAddress).toEqualTypeOf<OrdCapability['ordGetAddress']>()
  })

  it('user-defined custom capabilities flow through into the merge', () => {
    type Mixed = MergedCapabilities<readonly [typeof _customA, typeof _mempoolForMerge]>
    expectTypeOf<Mixed>().toMatchTypeOf<_MyCustom>()
    expectTypeOf<Mixed>().toMatchTypeOf<BaseCapability>()
  })

  it('handles deep recursion (10-element tuple) without hitting TS limits', () => {
    expectTypeOf(_mergedTen.a).toEqualTypeOf<() => Promise<1>>()
    expectTypeOf(_mergedTen.e).toEqualTypeOf<() => Promise<5>>()
  })
})

// ============================================================================
// Chain backends — `ChainBackendFactory`, vendor factories, `combineBackends`
//
// A backend is a lazy `(network) => ChainBackend`. Vendor entrypoints
// return one; `combineBackends` folds several into one, intersecting their
// capability sets. This is the value put in `createLaserEyesConfig({ backends })`.
// ============================================================================

describe('chain backends', () => {
  it('mempool() is a ChainBackendFactory<BaseCapability>', () => {
    expectTypeOf(mempool()).toMatchTypeOf<ChainBackendFactory<BaseCapability>>()
    // Invoking it for a network yields a BaseCapability backend.
    expectTypeOf(mempool()(MAINNET)).toMatchTypeOf<ChainBackend<BaseCapability>>()
  })

  it('sandshrew() carries the full protocol capability surface', () => {
    const ds = sandshrew()(MAINNET)
    expectTypeOf(ds.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
    expectTypeOf(ds.ordGetAddress).toEqualTypeOf<OrdCapability['ordGetAddress']>()
    expectTypeOf(ds.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
  })

  it('maestro() is a ChainBackendFactory and requires an API key', () => {
    expectTypeOf(maestro).parameter(0).toMatchTypeOf<{ apiKey: string }>()
    expectTypeOf(maestro({ apiKey: 'k' })).toMatchTypeOf<ChainBackendFactory>()
  })

  it('combineBackends intersects capabilities; first wins on overlap', () => {
    const backend = combineBackends(sandshrew(), mempool())
    expectTypeOf(backend).toMatchTypeOf<ChainBackendFactory>()

    const ds = backend(MAINNET)
    // sandshrew's protocol methods survive…
    expectTypeOf(ds.runesGetAddressBalances).toEqualTypeOf<
      RuneCapability['runesGetAddressBalances']
    >()
    // …alongside the base methods both vendors provide.
    expectTypeOf(ds.btcGetBalance).toEqualTypeOf<BaseCapability['btcGetBalance']>()
  })

  it('combineBackends of base-only backends exposes no protocol methods', () => {
    const ds = combineBackends(mempool(), mempool())(MAINNET)
    expectTypeOf<
      'runesGetAddressBalances' extends keyof typeof ds ? true : false
    >().toEqualTypeOf<false>()
  })
})
