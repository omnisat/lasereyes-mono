/**
 * Phantom wallet adapter (Bitcoin support).
 *
 * @remarks
 * Phantom exposes Bitcoin via `window.phantom.bitcoin`. Signing/sending
 * bodies are stubbed; adapter shape and capabilities matrix are final.
 *
 * @module adapters/phantom
 */

import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    phantom?: { bitcoin?: unknown }
  }
}

export class PhantomAdapter extends BaseAdapter {
  readonly walletId = 'phantom'
  readonly walletName = 'Phantom Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(phantom-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/phantom.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`PhantomAdapter.${method}: not implemented`)
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

export function loadPhantomWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const phantom = window.phantom?.bitcoin
  if (!phantom) return null

  const adapter = new PhantomAdapter(phantom)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Phantom Wallet',
    rdns: 'app.phantom',
    provider: adapter,
  })
  return adapter
}
