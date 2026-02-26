/**
 * Unisat wallet adapter.
 * Normalizes Unisat's API to Bitcoin Provider Standard.
 *
 * @module adapters/unisat
 */

import * as bitcoin from 'bitcoinjs-lib'
import { BaseAdapter } from './base'
import type {
  AddressInfo,
  BitcoinProviderAdapter,
  Inscription,
  ProviderCapabilities,
  RequestArguments,
  SignedPsbt,
} from '../types/provider'
import type { NetworkId } from '../types/network'
import { UnisatNetwork } from '../types/network'
import { announceWallet } from '../detection/announcements'
import { UNISAT_ICON } from '../constants/wallet-icons'

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

      case 'bitcoin_signPsbts':
        return this.handleSignPsbts(params)

      case 'bitcoin_sendBitcoin':
        return this.handleSendBitcoin(params)

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
  private async handleRequestAccounts(): Promise<AddressInfo[]> {
    const accounts = await this.rawProvider.requestAccounts()
    if (!accounts || accounts.length === 0) {
      throw this.createError(4001, 'User rejected account access')
    }

    const publicKey = await this.rawProvider.getPublicKey()

    // Unisat returns a single address that serves as both payment and ordinals
    return accounts.map((address: string) => ({
      address,
      purpose: 'payment' as const,
      type: this.detectAddressType(address),
      publicKey,
    }))
  }

  /**
   * Handle bitcoin_getAccounts
   */
  private async handleGetAccounts(): Promise<AddressInfo[]> {
    const accounts = await this.rawProvider.getAccounts()
    const publicKey = await this.rawProvider.getPublicKey()

    return accounts.map((address: string) => ({
      address,
      purpose: 'payment' as const,
      type: this.detectAddressType(address),
      publicKey,
    }))
  }

  /**
   * Handle bitcoin_getNetwork
   */
  private async handleGetNetwork(): Promise<NetworkId> {
    const chain = await this.rawProvider.getChain()
    return this.normalizeUnisatNetwork(chain.enum)
  }

  /**
   * Handle bitcoin_switchNetwork
   */
  private async handleSwitchNetwork(networkId: NetworkId): Promise<void> {
    const unisatNetwork = this.toUnisatNetwork(networkId)
    await this.rawProvider.switchChain(unisatNetwork)
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
    const psbtObj = bitcoin.Psbt.fromHex(signedHex)

    let txId: string | undefined
    let txHex: string | undefined

    // Broadcast if requested
    if (broadcast && finalize) {
      txId = await this.rawProvider.pushPsbt(signedHex)
    }

    // Extract tx hex if finalized
    if (finalize) {
      try {
        txHex = psbtObj.extractTransaction().toHex()
      } catch {
        // PSBT might not be fully signed yet
      }
    }

    return {
      psbtHex: signedHex,
      psbtBase64: psbtObj.toBase64(),
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
        const psbtObj = bitcoin.Psbt.fromHex(signedHex)

        let txId: string | undefined
        let txHex: string | undefined

        if (broadcast && finalize) {
          txId = await this.rawProvider.pushPsbt(signedHex)
        }

        if (finalize) {
          try {
            txHex = psbtObj.extractTransaction().toHex()
          } catch {
            // PSBT might not be fully signed
          }
        }

        return {
          psbtHex: signedHex,
          psbtBase64: psbtObj.toBase64(),
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
        bitcoin_switchNetwork: { supported: true },
        bitcoin_pushPsbt: { supported: true },
        bitcoin_getInscriptions: { supported: true },
      },
      testnet: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_signPsbts: { supported: true },
        bitcoin_sendBitcoin: { supported: true },
        bitcoin_switchNetwork: { supported: true },
        bitcoin_pushPsbt: { supported: true },
        bitcoin_getInscriptions: { supported: true },
      },
      testnet4: {
        bitcoin_signMessage: { supported: true },
        bitcoin_signPsbt: { supported: true },
        bitcoin_signPsbts: { supported: true },
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
   * Normalize Unisat network enum to standard NetworkId
   */
  private normalizeUnisatNetwork(unisatEnum: string): NetworkId {
    const map: Record<string, NetworkId> = {
      [UnisatNetwork.MAINNET]: 'mainnet',
      [UnisatNetwork.TESTNET]: 'testnet',
      [UnisatNetwork.TESTNET4]: 'testnet4',
      [UnisatNetwork.SIGNET]: 'signet',
      [UnisatNetwork.FRACTAL_MAINNET]: 'fractal-mainnet',
      [UnisatNetwork.FRACTAL_TESTNET]: 'fractal-testnet',
    }
    return map[unisatEnum] || 'mainnet'
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
    return {
      id: unisatInsc.inscriptionId,
      number: unisatInsc.inscriptionNumber,
      address: unisatInsc.address,
      contentType: unisatInsc.contentType,
      preview: unisatInsc.preview,
      content: unisatInsc.content,
      outputValue: unisatInsc.outputValue,
      location: unisatInsc.location,
      genesisTransaction: unisatInsc.genesisTransaction,
      timestamp: unisatInsc.timestamp,
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
