/**
 * Leather connector.
 * @module connectors/leather
 */

import { LeatherAdapter } from '../adapters/leather'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function leather(): CreateConnectorFn {
  return injected({
    id: 'leather',
    name: 'Leather Wallet',
    rdns: 'io.leather',
    getProvider: (w) => (w as { LeatherProvider?: unknown }).LeatherProvider,
    adapter: LeatherAdapter,
  })
}
