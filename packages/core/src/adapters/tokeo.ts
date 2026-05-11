/**
 * Tokeo wallet adapter.
 *
 * @remarks
 * Tokeo injects `window.tokeo`. Signing/sending bodies are stubbed;
 * adapter shape and capabilities matrix are final.
 *
 * @module adapters/tokeo
 */

import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    tokeo?: unknown
  }
}

export class TokeoAdapter extends BaseAdapter {
  readonly walletId = 'tokeo'
  readonly walletName = 'Tokeo Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(tokeo-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/tokeo.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`TokeoAdapter.${method}: not implemented`)
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

export function loadTokeoWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.tokeo) return null

  const adapter = new TokeoAdapter(window.tokeo)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Tokeo Wallet',
    rdns: 'app.tokeo',
    provider: adapter,
  })
  return adapter
}
