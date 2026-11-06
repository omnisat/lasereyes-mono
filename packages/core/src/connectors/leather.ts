/**
 * Leather connector.
 * @module connectors/leather
 */

import { createLeatherAdapter } from '../adapters/leather'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function leather(): CreateConnectorFn {
  return injected({
    id: 'leather',
    name: 'Leather Wallet',
    rdns: 'io.leather',
    getProvider: w => {
      const raw = (w as { LeatherProvider?: unknown }).LeatherProvider
      return raw ? createLeatherAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
