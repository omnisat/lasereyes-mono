/**
 * Tokeo connector.
 * @module connectors/tokeo
 */

import { TokeoAdapter } from '../adapters/tokeo'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function tokeo(): CreateConnectorFn {
  return injected({
    id: 'tokeo',
    name: 'Tokeo Wallet',
    rdns: 'app.tokeo',
    getProvider: w => {
      const raw = (w as { tokeo?: unknown }).tokeo
      return raw ? new TokeoAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
