/**
 * Leather wallet adapter.
 *
 * @remarks
 * Leather injects `window.LeatherProvider`. Signing/sending bodies are
 * stubbed pending implementation; the adapter shape and capabilities
 * matrix are final.
 *
 * @module adapters/leather
 */

import { LEATHER_ICON } from '../constants/wallet-icons'
import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    LeatherProvider?: unknown
  }
}

export class LeatherAdapter extends BaseAdapter {
  readonly walletId = 'leather'
  readonly walletName = 'Leather Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(leather-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/leather.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_switchNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`LeatherAdapter.${method}: not implemented`)
      default:
        this.throwMethodNotSupported(method)
    }
  }

  protected buildCapabilities(): ProviderCapabilities {
    const base = {
      bitcoin_signMessage: { supported: true },
      bitcoin_signPsbt: { supported: true },
      bitcoin_sendBitcoin: { supported: true },
      bitcoin_switchNetwork: { supported: true },
    }
    return {
      mainnet: base,
      testnet: base,
      testnet4: base,
      signet: base,
    }
  }
}

/**
 * Detect Leather and announce it for discovery.
 *
 * @returns The adapter if Leather is installed, null otherwise.
 */
export function loadLeatherWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.LeatherProvider) return null

  const adapter = new LeatherAdapter(window.LeatherProvider)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Leather Wallet',
    icon: LEATHER_ICON,
    rdns: 'io.leather',
    provider: adapter,
  })
  return adapter
}
