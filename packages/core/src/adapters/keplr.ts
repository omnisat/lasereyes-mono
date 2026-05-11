/**
 * Keplr wallet adapter (Bitcoin support).
 *
 * @remarks
 * Keplr is primarily a Cosmos SDK wallet but supports Bitcoin via
 * `window.keplr` chain integrations. Signing/sending bodies are stubbed;
 * adapter shape and capabilities matrix are final.
 *
 * @module adapters/keplr
 */

import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    keplr?: unknown
  }
}

export class KeplrAdapter extends BaseAdapter {
  readonly walletId = 'keplr'
  readonly walletName = 'Keplr Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(keplr-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/keplr.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`KeplrAdapter.${method}: not implemented`)
      default:
        this.throwMethodNotSupported(method)
    }
  }

  protected buildCapabilities(): ProviderCapabilities {
    const base = {
      bitcoin_signMessage: { supported: true },
      bitcoin_signPsbt: { supported: true },
      bitcoin_sendBitcoin: { supported: true },
    }
    return {
      mainnet: base,
      testnet: base,
    }
  }
}

export function loadKeplrWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.keplr) return null

  const adapter = new KeplrAdapter(window.keplr)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Keplr Wallet',
    rdns: 'app.keplr',
    provider: adapter,
  })
  return adapter
}
