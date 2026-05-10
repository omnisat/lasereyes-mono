/**
 * Phantom connector (Bitcoin).
 * @module connectors/phantom
 */

import { PhantomAdapter } from '../adapters/phantom'
import { PHANTOM_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function phantom(): CreateConnectorFn {
  return injected({
    id: 'phantom',
    name: 'Phantom Wallet',
    icon: PHANTOM_ICON,
    rdns: 'app.phantom',
    getProvider: (w) => (w as { phantom?: { bitcoin?: unknown } }).phantom?.bitcoin,
    adapter: PhantomAdapter,
  })
}
