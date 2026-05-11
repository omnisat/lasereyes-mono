/**
 * OKX wallet adapter.
 *
 * @remarks
 * OKX injects `window.okxwallet.bitcoin` (and `window.okxwallet.bitcoinTestnet`
 * etc. for testnets). Signing/sending bodies are stubbed; adapter shape
 * and capabilities matrix are final.
 *
 * @module adapters/okx
 */

import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    okxwallet?: {
      bitcoin?: unknown
      bitcoinTestnet?: unknown
      bitcoinSignet?: unknown
    }
  }
}

export class OkxAdapter extends BaseAdapter {
  readonly walletId = 'okx'
  readonly walletName = 'OKX Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(okx-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/okx.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_switchNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`OkxAdapter.${method}: not implemented`)
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

export function loadOkxWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const okx = window.okxwallet?.bitcoin
  if (!okx) return null

  const adapter = new OkxAdapter(okx)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'OKX Wallet',
    rdns: 'com.okx.wallet',
    provider: adapter,
  })
  return adapter
}
