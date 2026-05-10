/**
 * Leather connector.
 * @module connectors/leather
 */

import { LeatherAdapter } from '../adapters/leather'
import { LEATHER_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function leather(): CreateConnectorFn {
  return injected({
    id: 'leather',
    name: 'Leather Wallet',
    icon: LEATHER_ICON,
    rdns: 'io.leather',
    getProvider: (w) => (w as { LeatherProvider?: unknown }).LeatherProvider,
    adapter: LeatherAdapter,
  })
}
