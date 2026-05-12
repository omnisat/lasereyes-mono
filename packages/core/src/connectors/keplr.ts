/**
 * Keplr connector (Bitcoin).
 * @module connectors/keplr
 */

import { KeplrAdapter } from '../adapters/keplr'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function keplr(): CreateConnectorFn {
  return injected({
    id: 'keplr',
    name: 'Keplr Wallet',
    rdns: 'app.keplr',
    getProvider: w => {
      const raw = (w as { keplr?: unknown }).keplr
      return raw ? new KeplrAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
