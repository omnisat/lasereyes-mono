/**
 * Magic Eden wallet adapter.
 *
 * @remarks
 * Magic Eden uses `sats-connect`-style messaging via
 * `window.magicEden.bitcoin`. Signing/sending bodies are stubbed;
 * adapter shape and capabilities matrix are final.
 *
 * @module adapters/magic-eden
 */

import { MAGIC_EDEN_ICON } from '../constants/wallet-icons'
import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    magicEden?: { bitcoin?: unknown }
  }
}

export class MagicEdenAdapter extends BaseAdapter {
  readonly walletId = 'magic-eden'
  readonly walletName = 'Magic Eden Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(magic-eden-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/magic-eden.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_switchNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`MagicEdenAdapter.${method}: not implemented`)
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

export function loadMagicEdenWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const me = window.magicEden?.bitcoin
  if (!me) return null

  const adapter = new MagicEdenAdapter(me)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Magic Eden Wallet',
    icon: MAGIC_EDEN_ICON,
    rdns: 'io.magiceden.bitcoin',
    provider: adapter,
  })
  return adapter
}
