/**
 * Sparrow wallet adapter.
 *
 * @remarks
 * Sparrow integrates via QR-code / file flows for hardware wallet support.
 * Browser injection key: `window.sparrow`. Signing bodies are stubbed;
 * adapter shape and capabilities matrix are final.
 *
 * @module adapters/sparrow
 */

import { SPARROW_ICON } from '../constants/wallet-icons'
import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    sparrow?: unknown
  }
}

export class SparrowAdapter extends BaseAdapter {
  readonly walletId = 'sparrow'
  readonly walletName = 'Sparrow Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(sparrow-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/sparrow.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_signMessage':
        throw new Error(`SparrowAdapter.${method}: not implemented`)
      default:
        this.throwMethodNotSupported(method)
    }
  }

  protected buildCapabilities(): ProviderCapabilities {
    const base = {
      bitcoin_signMessage: { supported: true },
      bitcoin_signPsbt: { supported: true },
    }
    return {
      mainnet: base,
      testnet: base,
      signet: base,
      regtest: base,
    }
  }
}

export function loadSparrowWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.sparrow) return null

  const adapter = new SparrowAdapter(window.sparrow)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Sparrow Wallet',
    icon: SPARROW_ICON,
    rdns: 'wallet.sparrow',
    provider: adapter,
  })
  return adapter
}
