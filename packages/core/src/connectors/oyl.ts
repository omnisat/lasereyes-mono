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
    getProvider: w => (w as { oyl?: unknown }).oyl,
    adapter: OylAdapter,
    // OYL is the only baseline wallet that natively exposes `pushPsbt`
    // separately from `signPsbt`'s `broadcast` flag. Route both writes.
    nativeRpc: { sendBtc: true, broadcastPsbt: true },
  })
}
