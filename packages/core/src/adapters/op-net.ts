/**
 * OpNet wallet adapter.
 *
 * @remarks
 * OpNet injects `window.opnet`. Signing/sending bodies are stubbed;
 * adapter shape and capabilities matrix are final.
 *
 * @module adapters/op-net
 */

import { announceWallet } from '../detection/announcements'
import type { ProviderCapabilities } from '../types/provider'
import { BaseAdapter, type BitcoinProviderAdapter } from './base'

declare global {
  interface Window {
    opnet?: unknown
  }
}

export class OpNetAdapter extends BaseAdapter {
  readonly walletId = 'op-net'
  readonly walletName = 'OpNet Wallet'

  async request(method: string, _params?: { [key: string]: unknown }): Promise<unknown> {
    switch (method) {
      case 'bitcoin_getCapabilities':
        return this.buildCapabilities()
      // TODO(op-net-adapter): port handlers from baseline 0397a17:packages/core/src/client/providers/op-net.ts
      case 'bitcoin_requestAccounts':
      case 'bitcoin_getAccounts':
      case 'bitcoin_getNetwork':
      case 'bitcoin_signPsbt':
      case 'bitcoin_sendBitcoin':
      case 'bitcoin_signMessage':
        throw new Error(`OpNetAdapter.${method}: not implemented`)
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
      regtest: base,
    }
  }
}

export function loadOpNetWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.opnet) return null

  const adapter = new OpNetAdapter(window.opnet)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'OpNet Wallet',
    rdns: 'net.op_net',
    provider: adapter,
  })
  return adapter
}
