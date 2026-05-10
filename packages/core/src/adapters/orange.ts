/**
 * Orange wallet adapter (sats-connect-based).
 *
 * @remarks
 * Orange uses `sats-connect` similar to Xverse, but signs to its own
 * wallet flow. Detection key: `window.OrangeProvider` or rdns
 * `app.orangewallet`. Signing/sending bodies are stubbed; adapter shape
 * and capabilities matrix are final.
 *
 * @module adapters/orange
 */

import { ORANGE_ICON } from '../constants/wallet-icons'
import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    OrangeProvider?: unknown
  }
}

export class OrangeAdapter extends BaseAdapter {
  readonly walletId = 'orange'
  readonly walletName = 'Orange Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(orange-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/orange.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_switchNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`OrangeAdapter.${method}: not implemented`)
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
      signet: base,
    }
  }
}

export function loadOrangeWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.OrangeProvider) return null

  const adapter = new OrangeAdapter(window.OrangeProvider)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Orange Wallet',
    icon: ORANGE_ICON,
    rdns: 'app.orangewallet',
    provider: adapter,
  })
  return adapter
}
