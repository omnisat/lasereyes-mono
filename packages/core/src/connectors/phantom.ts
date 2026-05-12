/**
 * Phantom connector (Bitcoin).
 * @module connectors/phantom
 */

import { PhantomAdapter } from '../adapters/phantom'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function phantom(): CreateConnectorFn {
  return injected({
    id: 'phantom',
    name: 'Phantom Wallet',
    rdns: 'app.phantom',
    getProvider: w => {
      const raw = (w as { phantom?: { bitcoin?: unknown } }).phantom?.bitcoin
      return raw ? new PhantomAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
