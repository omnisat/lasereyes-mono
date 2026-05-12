/**
 * OYL connector.
 * @module connectors/oyl
 */

import { OylAdapter } from '../adapters/oyl'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function oyl(): CreateConnectorFn {
  return injected({
    id: 'oyl',
    name: 'OYL Wallet',
    rdns: 'app.oyl',
    getProvider: w => {
      const raw = (w as { oyl?: unknown }).oyl
      return raw ? new OylAdapter(raw) : null
    },
    // OYL is the only baseline wallet that natively exposes `pushPsbt`
    // separately from `signPsbt`'s `broadcast` flag. Route both writes.
    nativeRpc: { sendBtc: true, broadcastPsbt: true },
  })
}
