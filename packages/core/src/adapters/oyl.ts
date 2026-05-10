/**
 * OYL wallet adapter.
 *
 * @remarks
 * OYL injects `window.oyl`. Provides full read/write surface plus runes,
 * brc20, and inscription helpers. Signing/sending bodies are stubbed;
 * adapter shape and capabilities matrix are final.
 *
 * @module adapters/oyl
 */

import { OYL_ICON } from '../constants/wallet-icons'
import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    oyl?: unknown
  }
}

export class OylAdapter extends BaseAdapter {
  readonly walletId = 'oyl'
  readonly walletName = 'OYL Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(oyl-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/oyl.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_switchNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_signPsbts':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
      case 'bitcoin_pushPsbt':
      case 'bitcoin_getInscriptions':
        throw new Error(`OylAdapter.${method}: not implemented`)
      default:
        this.throwMethodNotSupported(method)
    }
  }

  protected buildCapabilities(): ProviderCapabilities {
    const base = {
      bitcoin_signMessage: { supported: true },
      bitcoin_signPsbt: { supported: true },
      bitcoin_signPsbts: { supported: true },
      bitcoin_sendBitcoin: { supported: true },
      bitcoin_switchNetwork: { supported: true },
      bitcoin_pushPsbt: { supported: true },
      bitcoin_getInscriptions: { supported: true },
    }
    return {
      mainnet: base,
      testnet: base,
      signet: base,
      regtest: base,
    }
  }
}

export function loadOylWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.oyl) return null

  const adapter = new OylAdapter(window.oyl)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'OYL Wallet',
    icon: OYL_ICON,
    rdns: 'app.oyl',
    provider: adapter,
  })
  return adapter
}
