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
    getProvider: (w) => (w as { phantom?: { bitcoin?: unknown } }).phantom?.bitcoin,
    adapter: PhantomAdapter,
  })
}
