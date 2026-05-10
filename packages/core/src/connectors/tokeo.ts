/**
 * Tokeo connector.
 * @module connectors/tokeo
 */

import { TokeoAdapter } from '../adapters/tokeo'
import { TOKEO_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function tokeo(): CreateConnectorFn {
  return injected({
    id: 'tokeo',
    name: 'Tokeo Wallet',
    icon: TOKEO_ICON,
    rdns: 'app.tokeo',
    getProvider: (w) => (w as { tokeo?: unknown }).tokeo,
    adapter: TokeoAdapter,
  })
}
