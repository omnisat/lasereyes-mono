/**
 * Xverse wallet adapter.
 * Normalizes Xverse's sats-connect API to Bitcoin Provider Standard.
 *
 * @module adapters/xverse
 */

import * as bitcoin from 'bitcoinjs-lib'
import {
  AddressPurpose as SatsConnectAddressPurpose,
  BitcoinNetworkType,
  MessageSigningProtocols,
  request as satsConnectRequest,
  RpcErrorCode,
} from 'sats-connect'
import { BaseAdapter } from './base'
import type {
  AddressInfo,
  AddressPurpose,
  BitcoinProviderAdapter,
  ProviderCapabilities,
  RequestArguments,
  SignedPsbt,
} from '../types/provider'
import type { NetworkId } from '../types/network'
import { XverseNetwork } from '../types/network'
import { announceWallet } from '../detection/announcements'
import { XVERSE_ICON } from '../constants/wallet-icons'

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

  async request(args: RequestArguments): Promise<unknown> {
    const { method, params = {} } = args

    switch (method) {
      case 'bitcoin_requestAccounts':
        return this.handleRequestAccounts()

      case 'bitcoin_getAccounts':
        return this.handleGetAccounts()

      case 'bitcoin_getNetwork':
        return this.handleGetNetwork()

      case 'bitcoin_switchNetwork':
        return this.handleSwitchNetwork(params.networkId as NetworkId)

      case 'bitcoin_signPsbt':
        return this.handleSignPsbt(params)

      case 'bitcoin_sendBitcoin':
        return this.handleSendBitcoin(params)

      case 'bitcoin_signMessage':
        return this.handleSignMessage(params)

      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()

      default:
        this.throwMethodNotSupported(method)
    }
  }

  /**
   * Handle bitcoin_requestAccounts
   */
  private async handleRequestAccounts(): Promise<AddressInfo[]> {
    try {
      // Try to get existing account first
      const getAccountResponse = await satsConnectRequest('wallet_getAccount', null)
      if (getAccountResponse.status === 'success') {
        return this.normalizeAddresses(getAccountResponse.result.addresses)
      }
    } catch (e) {
      // Account not available, need to connect
    }

    // Request connection with both payment and ordinals addresses
    const response = await satsConnectRequest('wallet_connect', {
      addresses: [SatsConnectAddressPurpose.Payment, SatsConnectAddressPurpose.Ordinals],
      message: 'Connecting with LaserEyes',
    })

    if (response.status === 'success') {
      return this.normalizeAddresses(response.result.addresses)
    }

    if (response.error.code === RpcErrorCode.USER_REJECTION) {
      throw this.createError(4001, 'User rejected account access')
    }

    throw this.createError(-32603, `Error connecting to Xverse: ${response.error.message}`)
  }

  /**
   * Handle bitcoin_getAccounts
   */
  private async handleGetAccounts(): Promise<AddressInfo[]> {
    const response = await satsConnectRequest('wallet_getAccount', null)

    if (response.status === 'success') {
      return this.normalizeAddresses(response.result.addresses)
    }

    throw this.createError(-32603, `Error getting accounts: ${response.error.message}`)
  }

  /**
   * Handle bitcoin_getNetwork
   */
  private async handleGetNetwork(): Promise<NetworkId> {
    const response = await satsConnectRequest('wallet_getNetwork', null)

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
    const response = await satsConnectRequest('wallet_changeNetwork', {
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
      const psbtObj = bitcoin.Psbt.fromHex(psbt)
      psbtBase64 = psbtObj.toBase64()
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
    const response = await satsConnectRequest('signPsbt', {
      psbt: psbtBase64,
      broadcast: !!broadcast,
      signInputs: Object.keys(signInputs).length > 0 ? signInputs : undefined,
    })

    if (response.status === 'error') {
      if (response.error.code === RpcErrorCode.USER_REJECTION) {
        throw this.createError(4001, 'User rejected the request')
      }
      throw this.createError(-32603, `Error signing PSBT: ${response.error.message}`)
    }

    const signedPsbtBase64 = response.result.psbt
    const signedPsbt = bitcoin.Psbt.fromBase64(signedPsbtBase64)
    const signedPsbtHex = signedPsbt.toHex()

    let txHex: string | undefined
    if (finalize && !response.result.txid) {
      // Finalize if requested and not already broadcast
      signedPsbt.finalizeAllInputs()
      txHex = signedPsbt.extractTransaction().toHex()
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

    const response = await satsConnectRequest('sendTransfer', {
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

    if (response.error.code === RpcErrorCode.USER_REJECTION) {
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
    const response = await satsConnectRequest('signMessage', {
      address: address,
      message,
      protocol: protocol === 'bip322' ? MessageSigningProtocols.BIP322 : MessageSigningProtocols.ECDSA,
    })

    if (response.status === 'success') {
      return response.result.signature as string
    }

    if (response.error.code === RpcErrorCode.USER_REJECTION) {
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
   * Normalize Xverse addresses to standard format
   */
  private normalizeAddresses(addresses: any[]): AddressInfo[] {
    const result: AddressInfo[] = []

    for (const addr of addresses) {
      let purpose: AddressPurpose
      if (addr.purpose === SatsConnectAddressPurpose.Payment) {
        purpose = 'payment'
      } else if (addr.purpose === SatsConnectAddressPurpose.Ordinals) {
        purpose = 'ordinals'
      } else {
        continue // Skip unknown purposes
      }

      result.push({
        address: addr.address,
        purpose,
        type: this.detectAddressType(addr.address),
        publicKey: addr.publicKey,
      })
    }

    return result
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
      mainnet: BitcoinNetworkType.Mainnet,
      testnet: BitcoinNetworkType.Testnet,
      testnet4: BitcoinNetworkType.Testnet4,
      signet: BitcoinNetworkType.Signet,
      'fractal-mainnet': BitcoinNetworkType.Mainnet,
      'fractal-testnet': BitcoinNetworkType.Testnet,
    }

    return map[networkId] || BitcoinNetworkType.Mainnet
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
