/**
 * Xverse wallet adapter.
 * Normalizes Xverse's sats-connect API to Bitcoin Provider Standard.
 *
 * @module adapters/xverse
 */

import type { NetworkId } from '@omnisat/lasereyes-client'
import { getAddressType } from '@omnisat/lasereyes-client/utils'
import type {
  AddressInfo,
  AddressPurpose,
  SignedPsbt,
  WalletAccountConfig,
} from '@omnisat/lasereyes-client/wallet'
import { base64, hex } from '@scure/base'
import { Transaction } from '@scure/btc-signer'
// Types-only — pulling the runtime barrel statically drags in
// @sats-connect/core + jsontokens + elliptic + bn.js + the whole
// browserify chain (~600 kB). Runtime is dynamically imported on first
// use; see `loadSatsConnect` below.
import type {
  BitcoinNetworkType,
  MessageSigningProtocols,
  AddressPurpose as SatsConnectAddressPurpose,
} from 'sats-connect'
import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

/**
 * Lazy-loader for the `sats-connect` runtime.
 *
 * @remarks
 * Loading sats-connect eagerly costs ~600 kB (it bundles
 * `@sats-connect/core`, `jsontokens`, `elliptic`, `bn.js`, and the
 * browserify polyfill chain). We defer the import until the first RPC
 * call, so apps that never reach an Xverse-flavored method don't pay
 * for it. The promise is memoized so subsequent calls reuse the same
 * module record.
 */
let satsConnectPromise: Promise<typeof import('sats-connect')> | null = null
function loadSatsConnect(): Promise<typeof import('sats-connect')> {
  satsConnectPromise ??= import('sats-connect')
  return satsConnectPromise
}

// String-enum values inlined so the sync code paths (network mapping,
// purpose comparison) don't need to await the dynamic import. These
// match the upstream enum definitions exactly — see
// node_modules/@sats-connect/core/dist/index.d.ts.
const SC_PURPOSE_PAYMENT: SatsConnectAddressPurpose = 'payment' as SatsConnectAddressPurpose
const SC_PURPOSE_ORDINALS: SatsConnectAddressPurpose = 'ordinals' as SatsConnectAddressPurpose
const SC_RPC_USER_REJECTION = -32000
const SC_PROTOCOL_BIP322: MessageSigningProtocols = 'BIP322' as MessageSigningProtocols
const SC_PROTOCOL_ECDSA: MessageSigningProtocols = 'ECDSA' as MessageSigningProtocols
const SC_NETWORK_MAINNET: BitcoinNetworkType = 'Mainnet' as BitcoinNetworkType
const SC_NETWORK_TESTNET: BitcoinNetworkType = 'Testnet' as BitcoinNetworkType
const SC_NETWORK_TESTNET4: BitcoinNetworkType = 'Testnet4' as BitcoinNetworkType
const SC_NETWORK_SIGNET: BitcoinNetworkType = 'Signet' as BitcoinNetworkType

/** Xverse Wallet icon (base64 encoded SVG). */
export const XVERSE_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzExMTExMSIvPgo8cGF0aCBkPSJNMTAgMTBMMTYgMTZMMjIgMTBNMjIgMjJMMTYgMTZMMTAgMjIiIHN0cm9rZT0iI0VFN0EzMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg=='

/**
 * Xverse's network identifiers (sats-connect uses these strings).
 *
 * @internal
 */
const XverseNetwork = {
  MAINNET: 'Mainnet',
  TESTNET: 'Testnet',
  TESTNET4: 'Testnet4',
  SIGNET: 'Signet',
  FRACTAL_MAINNET: 'FractalMainnet',
  FRACTAL_TESTNET: 'FractalTestnet',
} as const

/**
 * Adapter for Xverse Wallet.
 *
 * @remarks
 * Normalizes Xverse's sats-connect API to the Bitcoin Provider Standard.
 * Xverse provides separate payment and ordinals addresses.
 * Once Xverse implements the standard, this adapter can be removed.
 */
export class XverseAdapter extends BaseAdapter {
  readonly walletId = 'xverse'
  readonly walletName = 'Xverse Wallet'

  async request(method: string, params?: { [key: string]: unknown }): Promise<unknown> {
    const p = params ?? {}

    switch (method) {
      case 'bitcoin_requestAccounts':
        return this.handleRequestAccounts()

      case 'bitcoin_getAccounts':
        return this.handleGetAccounts()

      case 'bitcoin_getNetwork':
        return this.handleGetNetwork()

      case 'bitcoin_switchNetwork':
        return this.handleSwitchNetwork(p.networkId as NetworkId)

      case 'bitcoin_signPsbt':
        return this.handleSignPsbt(p)

      case 'bitcoin_sendBitcoin':
        return this.handleSendBitcoin(p)

      case 'bitcoin_signMessage':
        return this.handleSignMessage(p)

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
    const { request } = await loadSatsConnect()
    try {
      // Try to get existing account first
      const getAccountResponse = await request('wallet_getAccount', null)
      if (getAccountResponse.status === 'success') {
        return this.buildAccountData(getAccountResponse.result.addresses)
      }
    } catch (e) {
      // Account not available, need to connect
    }

    // Request connection with both payment and ordinals addresses
    const response = await request('wallet_connect', {
      addresses: [SC_PURPOSE_PAYMENT, SC_PURPOSE_ORDINALS],
      message: 'Connecting with LaserEyes',
    })

    if (response.status === 'success') {
      return this.buildAccountData(response.result.addresses)
    }

    if (response.error.code === SC_RPC_USER_REJECTION) {
      throw this.createError(4001, 'User rejected account access')
    }

    throw this.createError(-32603, `Error connecting to Xverse: ${response.error.message}`)
  }

  /**
   * Handle bitcoin_getAccounts
   */
  private async handleGetAccounts(): Promise<WalletAccountConfig> {
    const { request } = await loadSatsConnect()
    const response = await request('wallet_getAccount', null)

    if (response.status === 'success') {
      return this.buildAccountData(response.result.addresses)
    }

    throw this.createError(-32603, `Error getting accounts: ${response.error.message}`)
  }

  /**
   * Handle bitcoin_getNetwork
   */
  private async handleGetNetwork(): Promise<NetworkId> {
    const { request } = await loadSatsConnect()
    const response = await request('wallet_getNetwork', null)

    if (response.status === 'success') {
      return this.normalizeXverseNetwork(response.result.bitcoin.name)
    }

    throw this.createError(-32603, 'Error getting network')
  }

  /**
   * Handle bitcoin_switchNetwork
   */
  private async handleSwitchNetwork(networkId: NetworkId): Promise<void> {
    const xverseNetwork = this.toSatsConnectNetwork(networkId)
    const { request } = await loadSatsConnect()
    const response = await request('wallet_changeNetwork', {
      name: xverseNetwork,
    })

    if (response.status === 'success') {
      return
    }

    throw this.createError(-32603, `Error switching network: ${response.error.message}`)
  }

  /**
   * Handle bitcoin_signPsbt
   */
  private async handleSignPsbt(params: any): Promise<SignedPsbt> {
    const { psbt, finalize = false, broadcast = false, inputsToSign } = params

    if (!psbt) {
      throw this.createError(-32602, 'Missing required parameter: psbt')
    }

    // Convert hex to base64 if needed
    let psbtBase64 = psbt
    if (!this.isBase64(psbt)) {
      // Round-trip via @scure/btc-signer so we re-encode the same PSBT
      // bytes — no signing happens here, just a format change.
      psbtBase64 = base64.encode(Transaction.fromPSBT(hex.decode(psbt)).toPSBT())
    }

    // Build signInputs map
    const signInputs: Record<string, number[]> = {}

    if (inputsToSign) {
      // Group by address
      for (const input of inputsToSign) {
        if (!signInputs[input.address]) {
          signInputs[input.address] = []
        }
        signInputs[input.address].push(input.index)
      }
    }
    // If no inputs specified, Xverse will auto-detect

    // Sign with Xverse
    const { request } = await loadSatsConnect()
    const response = await request('signPsbt', {
      psbt: psbtBase64,
      broadcast: !!broadcast,
      signInputs: Object.keys(signInputs).length > 0 ? signInputs : undefined,
    })

    if (response.status === 'error') {
      if (response.error.code === SC_RPC_USER_REJECTION) {
        throw this.createError(4001, 'User rejected the request')
      }
      throw this.createError(-32603, `Error signing PSBT: ${response.error.message}`)
    }

    const signedPsbtBase64 = response.result.psbt
    const signedPsbt = Transaction.fromPSBT(base64.decode(signedPsbtBase64))
    const signedPsbtHex = hex.encode(signedPsbt.toPSBT())

    let txHex: string | undefined
    if (finalize && !response.result.txid) {
      // Finalize if requested and not already broadcast.
      // `Transaction.finalize()` is the @scure/btc-signer analog of
      // bitcoinjs-lib's `finalizeAllInputs()` — finalizes every input.
      signedPsbt.finalize()
      txHex = hex.encode(signedPsbt.extract())
    }

    return {
      psbtHex: signedPsbtHex,
      psbtBase64: signedPsbtBase64,
      txId: response.result.txid,
      txHex,
    }
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

    const { request } = await loadSatsConnect()
    const response = await request('sendTransfer', {
      recipients: [
        {
          address: to,
          amount: amount,
        },
      ],
    })

    if (response.status === 'success') {
      return response.result.txid
    }

    if (response.error.code === SC_RPC_USER_REJECTION) {
      throw this.createError(4001, 'User rejected the request')
    }

    throw this.createError(-32603, `Error sending BTC: ${response.error.message}`)
  }

  /**
   * Handle bitcoin_signMessage
   */
  private async handleSignMessage(params: any): Promise<string> {
    const { message, address, protocol = 'ecdsa' } = params

    if (!message || typeof message !== 'string') {
      throw this.createError(-32602, 'Missing or invalid parameter: message')
    }

    // If no address specified, Xverse will use default payment address
    const { request } = await loadSatsConnect()
    const response = await request('signMessage', {
      address: address,
      message,
      protocol: protocol === 'bip322' ? SC_PROTOCOL_BIP322 : SC_PROTOCOL_ECDSA,
    })

    if (response.status === 'success') {
      return response.result.signature as string
    }

    if (response.error.code === SC_RPC_USER_REJECTION) {
      throw this.createError(4001, 'User rejected the request')
    }

    throw this.createError(-32603, `Error signing message: ${response.error.message}`)
  }

  /**
   * Build capabilities for Xverse
   */
  protected buildCapabilities(): ProviderCapabilities {
    return {
      mainnet: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      testnet: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      testnet4: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      signet: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      'fractal-mainnet': {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
      'fractal-testnet': {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_switchNetwork: { supported: true },
      },
    }
  }

  /**
   * Plain-data shape of an Xverse-flavored account reply.
   *
   * @remarks
   * RPC methods return JSON-serializable wire data, not class instances —
   * the connector layer constructs the `WalletAccount` (with method
   * surface) from this shape.
   *
   * sats-connect returns `{ address, purpose, publicKey, addressType }`
   * per entry. We map `purpose` to the standard {@link AddressPurpose},
   * capture each pubkey into the top-level `publicKeys` lookup, and
   * drop the rest (Stacks addresses, unrecognized types).
   */
  private buildAccountData(addresses: any[]): WalletAccountConfig {
    const infos: AddressInfo[] = []
    const publicKeys: Partial<Record<AddressPurpose, string>> = {}

    for (const addr of addresses) {
      let purpose: AddressPurpose
      if (addr.purpose === SC_PURPOSE_PAYMENT) {
        purpose = 'payment'
      } else if (addr.purpose === SC_PURPOSE_ORDINALS) {
        purpose = 'ordinals'
      } else {
        continue // Skip unknown purposes (Stacks, etc.)
      }

      const addrType = getAddressType(addr.address)
      if (!addrType) continue
      infos.push({ address: addr.address, purpose, type: addrType })
      if (typeof addr.publicKey === 'string') publicKeys[purpose] = addr.publicKey
    }

    return {
      addresses: infos,
      publicKeys: publicKeys as Record<AddressPurpose, string>,
    }
  }

  /**
   * Normalize Xverse network name to standard NetworkId
   */
  private normalizeXverseNetwork(xverseNetwork: string): NetworkId {
    const map: Record<string, NetworkId> = {
      [XverseNetwork.MAINNET]: 'mainnet',
      [XverseNetwork.TESTNET]: 'testnet',
      [XverseNetwork.TESTNET4]: 'testnet4',
      [XverseNetwork.SIGNET]: 'signet',
      [XverseNetwork.FRACTAL_MAINNET]: 'fractal-mainnet',
      [XverseNetwork.FRACTAL_TESTNET]: 'fractal-testnet',
    }

    // Case-insensitive match
    const normalized = xverseNetwork.toLowerCase()
    for (const [key, value] of Object.entries(map)) {
      if (key.toLowerCase() === normalized) {
        return value
      }
    }

    return 'mainnet'
  }

  /**
   * Convert standard NetworkId to sats-connect BitcoinNetworkType
   */
  private toSatsConnectNetwork(networkId: NetworkId): BitcoinNetworkType {
    const map: Partial<Record<NetworkId, BitcoinNetworkType>> = {
      mainnet: SC_NETWORK_MAINNET,
      testnet: SC_NETWORK_TESTNET,
      testnet4: SC_NETWORK_TESTNET4,
      signet: SC_NETWORK_SIGNET,
      'fractal-mainnet': SC_NETWORK_MAINNET,
      'fractal-testnet': SC_NETWORK_TESTNET,
    }

    return map[networkId] || SC_NETWORK_MAINNET
  }

  /**
   * Check if string is base64 encoded
   */
  private isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str
    } catch {
      return false
    }
  }
}

/**
 * Loader function for Xverse adapter.
 * Detects Xverse wallet and announces it using EIP-6963 pattern.
 *
 * @remarks
 * This loader checks if Xverse wallet is available and automatically
 * announces it so it can be discovered by LaserEyesCore.
 * This can be removed once Xverse implements the Bitcoin Provider Standard.
 *
 * @returns Adapter instance if wallet is detected, null otherwise
 *
 * @example
 * ```ts
 * import { loadXverseWalletAdapter } from '@omnisat/lasereyes-core/adapters/xverse'
 *
 * // Call before initializing core
 * loadXverseWalletAdapter()
 * ```
 */
export function loadXverseWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null

  // Xverse uses sats-connect library, check if it's available
  // The actual provider is injected by Xverse extension
  const xverseProviders = (window as any).XverseProviders
  if (!xverseProviders?.BitcoinProvider) return null

  // Create adapter with sats-connect as the raw provider
  // sats-connect handles the actual communication
  const adapter = new XverseAdapter(xverseProviders.BitcoinProvider)

  // Announce the wallet (EIP-6963 pattern)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Xverse Wallet',
    icon: XVERSE_ICON,
    rdns: 'app.xverse.wallet',
    provider: adapter,
  })

  return adapter
}
