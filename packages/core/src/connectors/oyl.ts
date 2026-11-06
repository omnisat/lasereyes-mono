/**
 * OYL connector.
 * @module connectors/oyl
 */

import { createOylAdapter } from '../adapters/oyl'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function oyl(): CreateConnectorFn {
  return injected({
    id: 'oyl',
    name: 'OYL Wallet',
    rdns: 'app.oyl',
    getProvider: w => {
      const raw = (w as { oyl?: unknown }).oyl
      return raw ? createOylAdapter(raw) : null
    },
    // OYL has no single-prompt `sendBitcoin`, so BTC sends use the composed
    // PSBT path. It does expose `pushPsbt` separately from `signPsbt`'s
    // `broadcast` flag, so route `broadcastPsbt` to it natively.
    nativeRpc: { broadcastPsbt: true },
  })
}
