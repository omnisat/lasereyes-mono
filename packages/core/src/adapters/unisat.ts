/**
 * Unisat wallet adapter.
 * Normalizes Unisat's API to Bitcoin Provider Standard.
 *
 * @module adapters/unisat
 */

import type { Inscription, NetworkId } from '@omnisat/lasereyes-client'
import { AddressType } from '@omnisat/lasereyes-client/utils'
import type { SignedPsbt, WalletAccountConfig } from '@omnisat/lasereyes-client/wallet'
import { base64, hex } from '@scure/base'
import { Transaction } from '@scure/btc-signer'
import { announceWallet } from '../detection/announcements'
import type {
  ConnectInfo,
  DisconnectInfo,
  ProviderCapabilities,
  ProviderMessage,
} from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

/** Unisat Wallet icon (base64 encoded SVG). */
export const UNISAT_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzE2MTYxNiIvPgo8cGF0aCBkPSJNMTYgMjRDMjAuNDE4MyAyNCAyNCAyMC40MTgzIDI0IDE2QzI0IDExLjU4MTcgMjAuNDE4MyA4IDE2IDhDMTEuNTgxNyA4IDggMTEuNTgxNyA4IDE2QzggMjAuNDE4MyAxMS41ODE3IDI0IDE2IDI0WiIgZmlsbD0iI0Y3OTMxQSIvPgo8cGF0aCBkPSJNMTYgMjBDMTguMjA5MSAyMCAyMCAxOC4yMDkxIDIwIDE2QzIwIDEzLjc5MDkgMTguMjA5MSAxMiAxNiAxMkMxMy43OTA5IDEyIDEyIDEzLjc5MDkgMTIgMTZDMTIgMTguMjA5MSAxMy43OTA5IDIwIDE2IDIwWiIgZmlsbD0iIzE2MTYxNiIvPgo8L3N2Zz4K'

/**
 * Unisat's internal network enum strings (returned by `getChain().enum`).
 *
 * @internal
 */
const UnisatNetwork = {
  MAINNET: 'BITCOIN_MAINNET',
  TESTNET: 'BITCOIN_TESTNET',
  TESTNET4: 'BITCOIN_TESTNET4',
  SIGNET: 'BITCOIN_SIGNET',
  FRACTAL_MAINNET: 'FRACTAL_BITCOIN_MAINNET',
  FRACTAL_TESTNET: 'FRACTAL_BITCOIN_TESTNET',
} as const

/**
 * Adapter for Unisat Wallet.
 *
 * @remarks
 * Normalizes Unisat's custom API to the Bitcoin Provider Standard.
 * Once Unisat implements the standard, this adapter can be removed.
 */
export class UnisatAdapter extends BaseAdapter {
  readonly walletId = 'unisat'
  readonly walletName = 'Unisat Wallet'

  /**
   * Subscribe to Unisat's raw events and re-emit normalized
   * {@link BitcoinProviderEvent}s.
   *
   * @remarks
   * Unisat emits `accountsChanged(addresses: string[])` and
   * `networkChanged(network: string)` where `network` is the legacy
   * value (`'livenet' | 'testnet'`) — not the new-style enum returned by
   * `getChain().enum`. We normalize through {@link normalizeUnisatNetwork}
   * before re-emitting so downstream listeners only see canonical
   * {@link NetworkId} values.
   *
   * The base class's pass-through default would surface `'livenet'` to
   * consumers — which is fine for Unisat-aware code but breaks
   * spec-following consumers like `connect`'s state updater.
   */
  protected override subscribeRawEvents(): void {
    const raw = this.rawProvider
    if (!raw?.on) return

    raw.on('accountsChanged', async (_addresses: string[]) => {
      // Unisat's event only carries the address list; the spec wants a
      // full {@link Account} (addresses + purposes + types + public key).
      // Re-derive via the existing handler — same normalization path as
      // `bitcoin_getAccounts`.
      try {
        const account = await this.handleGetAccounts()
        this.emitter.emit('accountsChanged', account)
      } catch {
        // Wallet likely disconnected mid-event; the `disconnect` event
        // listener will clean up.
      }
    })

    // Unisat fires two network events on every chain switch:
    //
    // - `networkChanged(network: 'livenet' | 'testnet')` — legacy. Only
    //   represents livenet/testnet; emits `'unknown'` for chains the
    //   legacy enum can't carry (testnet4, signet, fractal-*).
    // - `chainChanged({ enum: 'BITCOIN_*' })` — modern, fires for *every*
    //   chain with the full enum value.
    //
    // Verified empirically that both fire on every switch, so we only
    // subscribe to `chainChanged` — it's authoritative on its own and
    // listening to both creates a clobber race where the legacy event's
    // `'unknown'` overwrites the correct value.
    raw.on('chainChanged', (chain: { enum?: string } | string) => {
      const value = typeof chain === 'string' ? chain : (chain?.enum ?? '')
      if (!value) return
      const normalized = this.normalizeUnisatNetwork(value)
      this.emitter.emit('networkChanged', normalized)
    })

    // Pass-through for the remaining standard events. Payload shapes
    // match the spec on the Unisat side, so no remapping needed.
    raw.on('connect', (info: ConnectInfo) => this.emitter.emit('connect', info))
    raw.on('disconnect', (info: DisconnectInfo) => this.emitter.emit('disconnect', info))
    raw.on('message', (msg: ProviderMessage) => this.emitter.emit('message', msg))
  }

  async request(method: string, params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_requestAccounts':
        return this.handleRequestAccounts()

      case 'bitcoin_getAccounts':
        return this.handleGetAccounts()

      case 'bitcoin_getNetwork':
        return this.handleGetNetwork()

      case 'bitcoin_switchNetwork':
        return this.handleSwitchNetwork(params?.networkId as NetworkId)

      case 'bitcoin_signPsbt':
        return this.handleSignPsbt(params)

      case 'bitcoin_signPsbts':
        return this.handleSignPsbts(params)

      case 'bitcoin_sendBitcoin':
        return this.handleSendBitcoin(params)

      case 'bitcoin_getBalance':
        return this.handleGetBalance(params)

      case 'bitcoin_signMessage':
        return this.handleSignMessage(params)

      case 'bitcoin_pushPsbt':
        return this.handlePushPsbt(params)

      case 'bitcoin_getInscriptions':
        return this.handleGetInscriptions(params)

      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()

      default:
        this.throwMethodNotSupported(method)
    }
  }

  /**
   * Handle bitcoin_requestAccounts
   */
  private async handleRequestAccounts(): Promise<WalletAccountConfig> {
    const accounts: string[] = await this.rawProvider.requestAccounts()
    if (!accounts || accounts.length === 0) {
      throw this.createError(4001, 'User rejected account access')
    }
    const publicKey = await this.rawProvider.getPublicKey()
    return this.buildAccountData(accounts, publicKey)
  }

  /**
   * Handle bitcoin_getAccounts
   */
  private async handleGetAccounts(): Promise<WalletAccountConfig> {
    const accounts: string[] = await this.rawProvider.getAccounts()
    const publicKey: string = await this.rawProvider.getPublicKey()
    return this.buildAccountData(accounts, publicKey)
  }

  /**
   * Plain-data shape of a Unisat-flavored account reply.
   *
   * @remarks
   * RPC method returns are JSON-serializable wire data, not class
   * instances — the connector layer constructs the `WalletAccount`
   * (with `getAddress` / `getPublicKey` methods) from this shape via
   * `createWalletAccount(...)`.
   *
   * Unisat exposes one address that serves as both `'payment'` and
   * `'ordinals'` (taproot); both purposes get the same address and
   * pubkey so account-aware callers (signMessage default, account
   * balance, composed PSBT) all reach a coherent payment public key.
   */
  private buildAccountData(accounts: string[], publicKey: string): WalletAccountConfig {
    const primary = accounts[0]
    return {
      addresses: [
        // TODO: detect address type via getAddressType once Unisat exposes it.
        { address: primary, purpose: 'payment', type: AddressType.P2TR },
        { address: primary, purpose: 'ordinals', type: AddressType.P2TR },
      ],
      publicKeys: {
        payment: publicKey,
        ordinals: publicKey,
        taproot: publicKey,
      },
    }
  }

  /**
   * Handle bitcoin_getNetwork
   */
  private async handleGetNetwork(): Promise<NetworkId> {
    const chain = await this.rawProvider.getChain()
    return this.normalizeUnisatNetwork(chain.enum)
  }

  /**
   * Handle bitcoin_switchNetwork.
   *
   * @remarks
   * Returns the wallet's now-current network as a normalized
   * {@link NetworkId}. The action layer trusts this value directly —
   * no config.chains re-derivation needed.
   */
  private async handleSwitchNetwork(networkId: NetworkId): Promise<NetworkId> {
    const unisatNetwork = this.toUnisatNetwork(networkId)
    await this.rawProvider.switchChain(unisatNetwork)
    // Re-query the wallet to confirm what we actually landed on — some
    // wallets silently substitute a fallback if the requested network
    // isn't available.
    const chain = await this.rawProvider.getChain()
    return this.normalizeUnisatNetwork(chain.enum)
  }

  /**
   * Handle bitcoin_signPsbt
   */
  private async handleSignPsbt(params: any): Promise<SignedPsbt> {
    const { psbt, finalize = false, broadcast = false, inputsToSign } = params

    if (!psbt) {
      throw this.createError(-32602, 'Missing required parameter: psbt')
    }

    // Build Unisat options
    const options: any = {}
    if (finalize !== undefined) {
      options.autoFinalized = finalize
    }
    if (inputsToSign) {
      options.toSignInputs = inputsToSign
    }

    // Sign with Unisat
    const signedHex = await this.rawProvider.signPsbt(psbt, options)
    const tx = Transaction.fromPSBT(hex.decode(signedHex))

    let txId: string | undefined
    let txHex: string | undefined

    // Broadcast if requested
    if (broadcast && finalize) {
      txId = await this.rawProvider.pushPsbt(signedHex)
    }

    // Extract tx hex if finalized
    if (finalize) {
      try {
        // `extract()` throws on unfinalized inputs; Unisat's
        // `autoFinalized: true` should have finalized everything, but
        // partial PSBTs (multi-sig flows, foreign inputs) won't be —
        // swallow and leave `txHex` undefined.
        txHex = hex.encode(tx.extract())
      } catch {
        // PSBT might not be fully signed yet
      }
    }

    return {
      psbtHex: signedHex,
      psbtBase64: base64.encode(tx.toPSBT()),
      txId,
      txHex,
    }
  }

  /**
   * Handle bitcoin_signPsbts (batch signing)
   */
  private async handleSignPsbts(params: any): Promise<SignedPsbt[]> {
    const { psbts, finalize = false, broadcast = false, inputsToSign } = params

    if (!psbts || !Array.isArray(psbts)) {
      throw this.createError(-32602, 'Missing or invalid parameter: psbts')
    }

    // Build Unisat options
    const options: any = {}
    if (finalize !== undefined) {
      options.autoFinalized = finalize
    }
    if (inputsToSign) {
      options.toSignInputs = inputsToSign
    }

    // Batch sign with Unisat
    const signedPsbts = await this.rawProvider.signPsbts(psbts, options)

    // Process each signed PSBT
    return Promise.all(
      signedPsbts.map(async (signedHex: string) => {
        const tx = Transaction.fromPSBT(hex.decode(signedHex))

        let txId: string | undefined
        let txHex: string | undefined

        if (broadcast && finalize) {
          txId = await this.rawProvider.pushPsbt(signedHex)
        }

        if (finalize) {
          try {
            txHex = hex.encode(tx.extract())
          } catch {
            // PSBT might not be fully signed
          }
        }

        return {
          psbtHex: signedHex,
          psbtBase64: base64.encode(tx.toPSBT()),
          txId,
          txHex,
        }
      })
    )
  }

  /**
   * Handle bitcoin_sendBitcoin
   */
  private async handleSendBitcoin(params: any): Promise<string> {
    const { to, amount } = params

    if (!to || typeof to !== 'string') {
      throw this.createError(-32602, 'Missing or invalid parameter: to')
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw this.createError(-32602, 'Invalid parameter: amount must be positive number')
    }

    return await this.rawProvider.sendBitcoin(to, amount)
  }

  /**
   * Handle bitcoin_getBalance.
   *
   * @remarks
   * Unisat's `getBalance()` returns `{ confirmed, unconfirmed, total }`
   * for the connected wallet's address — it doesn't accept an arbitrary
   * address.
   *
   * When `params.address` is provided, we honor it only if it matches
   * one of the connected accounts. Otherwise we throw
   * `METHOD_NOT_FOUND` so the upstream `tryProvider` helper falls back
   * to the configured backend.
   */
  private async handleGetBalance(params?: { address?: string }): Promise<string> {
    const requested = params?.address
    if (requested) {
      const accounts: string[] = await this.rawProvider.getAccounts()
      if (!accounts.includes(requested)) {
        throw this.createError(
          -32601,
          'bitcoin_getBalance: wallet only tracks the connected address; ' +
            'callers should fall back to the backend for arbitrary addresses'
        )
      }
    }
    const bal = await this.rawProvider.getBalance()
    return String(bal.total)
  }

  /**
   * Handle bitcoin_signMessage
   */
  private async handleSignMessage(params: any): Promise<string> {
    const { message, protocol } = params

    if (!message || typeof message !== 'string') {
      throw this.createError(-32602, 'Missing or invalid parameter: message')
    }

    // Unisat uses 'bip322-simple' string for BIP322
    const unisatProtocol = protocol === 'bip322' ? 'bip322-simple' : protocol

    return await this.rawProvider.signMessage(message, unisatProtocol)
  }

  /**
   * Handle bitcoin_pushPsbt
   */
  private async handlePushPsbt(params: any): Promise<string> {
    const { psbt } = params

    if (!psbt) {
      throw this.createError(-32602, 'Missing required parameter: psbt')
    }

    return await this.rawProvider.pushPsbt(psbt)
  }

  /**
   * Handle bitcoin_getInscriptions
   */
  private async handleGetInscriptions(params: any): Promise<Inscription[]> {
    const { offset = 0, limit = 10 } = params

    const response = await this.rawProvider.getInscriptions(offset, limit)

    // Normalize Unisat inscription format to standard
    return response.list.map((insc: any) => this.normalizeInscription(insc))
  }

  /**
   * Build capabilities for Unisat
   */
  protected buildCapabilities(): ProviderCapabilities {
    return {
      mainnet: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_signPsbts: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_getBalance: { supported: true },
        bitcoin_switchNetwork: { supported: true },
        bitcoin_pushPsbt: { supported: true },
        bitcoin_getInscriptions: { supported: true },
      },
      testnet: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_signPsbts: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_getBalance: { supported: true },
        bitcoin_switchNetwork: { supported: true },
        bitcoin_pushPsbt: { supported: true },
        bitcoin_getInscriptions: { supported: true },
      },
      testnet4: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_signPsbts: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_getBalance: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      signet: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_getBalance: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      'fractal-mainnet': {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_getBalance: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      'fractal-testnet': {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_getBalance: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
    }
  }

  /**
   * Normalize a Unisat-side network identifier to standard {@link NetworkId}.
   *
   * @remarks
   * Handles both Unisat APIs:
   *
   * - **New-style** (`getChain().enum`): `BITCOIN_MAINNET`,
   *   `BITCOIN_TESTNET`, etc. Returned by `bitcoin_getNetwork` request.
   * - **Legacy** (`getNetwork()` / `networkChanged` event payload):
   *   `'livenet'`, `'testnet'`. Still emitted on the event channel even
   *   when the response API uses the new enum.
   */
  private normalizeUnisatNetwork(unisatValue: string): NetworkId {
    // Only the new-style enum needs mapping — both `getChain().enum` and
    // `chainChanged` emit these. Unknown values pass through verbatim so
    // downstream `NetworkNotConfiguredError` detection can fire on chains
    // we haven't catalogued.
    const map: Record<string, NetworkId> = {
      [UnisatNetwork.MAINNET]: 'mainnet',
      [UnisatNetwork.TESTNET]: 'testnet',
      [UnisatNetwork.TESTNET4]: 'testnet4',
      [UnisatNetwork.SIGNET]: 'signet',
      [UnisatNetwork.FRACTAL_MAINNET]: 'fractal-mainnet',
      [UnisatNetwork.FRACTAL_TESTNET]: 'fractal-testnet',
    }
    return map[unisatValue] ?? (unisatValue as NetworkId)
  }

  /**
   * Convert standard NetworkId to Unisat network enum
   */
  private toUnisatNetwork(networkId: NetworkId): string {
    const map: Partial<Record<NetworkId, string>> = {
      mainnet: UnisatNetwork.MAINNET,
      testnet: UnisatNetwork.TESTNET,
      testnet4: UnisatNetwork.TESTNET4,
      signet: UnisatNetwork.SIGNET,
      'fractal-mainnet': UnisatNetwork.FRACTAL_MAINNET,
      'fractal-testnet': UnisatNetwork.FRACTAL_TESTNET,
    }
    return map[networkId] || UnisatNetwork.MAINNET
  }

  /**
   * Normalize Unisat inscription to standard format
   */
  private normalizeInscription(unisatInsc: any): Inscription {
    // Unisat's inscription shape doesn't carry every field the standard
    // `Inscription` requires (no `output`, `height`); stub those defensively.
    // The location string carries `txid:vout` which we surface as `output`.
    return {
      id: unisatInsc.inscriptionId,
      inscriptionId: unisatInsc.inscriptionId,
      number: unisatInsc.inscriptionNumber,
      address: unisatInsc.address,
      contentType: unisatInsc.contentType,
      preview: unisatInsc.preview,
      content: unisatInsc.content,
      outputValue: unisatInsc.outputValue,
      location: unisatInsc.location,
      output: unisatInsc.output ?? unisatInsc.location?.split(':').slice(0, 2).join(':') ?? '',
      genesisTransaction: unisatInsc.genesisTransaction,
      height: unisatInsc.genesisHeight ?? 0,
    }
  }
}

/**
 * Loader function for Unisat adapter.
 * Detects Unisat wallet and announces it using EIP-6963 pattern.
 *
 * @remarks
 * This loader checks if Unisat wallet is available and automatically
 * announces it so it can be discovered by LaserEyesCore.
 * This can be removed once Unisat implements the Bitcoin Provider Standard.
 *
 * @returns Adapter instance if wallet is detected, null otherwise
 *
 * @example
 * ```ts
 * import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
 *
 * // Call before initializing core
 * loadUnisatWalletAdapter()
 * ```
 */
export function loadUnisatWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!(window as any).unisat) return null

  const adapter = new UnisatAdapter((window as any).unisat)

  // Announce the wallet (EIP-6963 pattern)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Unisat Wallet',
    icon: UNISAT_ICON,
    rdns: 'io.unisat.wallet',
    provider: adapter,
  })

  return adapter
}

/**
 * Detect and announce Binance Web3 Wallet.
 *
 * @remarks
 * Binance exposes a Unisat-compatible API under
 * `window.binancew3w.bitcoin`, so we reuse {@link UnisatAdapter} with a
 * different window-key check and identity. Mirrors the pattern of
 * {@link loadUnisatWalletAdapter}.
 */
export function loadBinanceWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const raw = (window as any).binancew3w?.bitcoin
  if (!raw) return null

  const adapter = new UnisatAdapter(raw)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Binance Wallet',
    rdns: 'com.binance.wallet',
    provider: adapter,
  })
  return adapter
}

/**
 * Detect and announce Wizz Wallet.
 *
 * @remarks
 * Wizz exposes a Unisat-compatible API under `window.wizz`. Same pattern
 * as {@link loadUnisatWalletAdapter}.
 */
export function loadWizzWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const raw = (window as any).wizz
  if (!raw) return null

  const adapter = new UnisatAdapter(raw)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Wizz Wallet',
    rdns: 'com.wizz.wallet',
    provider: adapter,
  })
  return adapter
}
