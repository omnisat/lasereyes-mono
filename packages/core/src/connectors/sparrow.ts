/**
 * Sparrow connector.
 * @module connectors/sparrow
 */

import { SparrowAdapter } from '../adapters/sparrow'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function sparrow(): CreateConnectorFn {
  return injected({
    id: 'sparrow',
    name: 'Sparrow Wallet',
    rdns: 'wallet.sparrow',
    getProvider: (w) => (w as { sparrow?: unknown }).sparrow,
    adapter: SparrowAdapter,
  })
}
