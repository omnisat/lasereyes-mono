/**
 * Sparrow connector.
 * @module connectors/sparrow
 */

import { SparrowAdapter } from '../adapters/sparrow'
import { SPARROW_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function sparrow(): CreateConnectorFn {
  return injected({
    id: 'sparrow',
    name: 'Sparrow Wallet',
    icon: SPARROW_ICON,
    rdns: 'wallet.sparrow',
    getProvider: (w) => (w as { sparrow?: unknown }).sparrow,
    adapter: SparrowAdapter,
  })
}
