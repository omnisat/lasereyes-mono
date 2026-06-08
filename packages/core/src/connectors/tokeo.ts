/**
 * Tokeo connector.
 *
 * @remarks
 * Tokeo exposes a Unisat-compatible API under `window.tokeo.bitcoin`, so
 * it shares {@link UnisatAdapter} and differs only in detection key and
 * identity. Mirrors the Binance/Wizz clone pattern.
 *
 * @module connectors/tokeo
 */

import { UnisatAdapter } from '../adapters/unisat'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function tokeo(): CreateConnectorFn {
  return injected({
    id: 'tokeo',
    name: 'Tokeo Wallet',
    rdns: 'app.tokeo',
    getProvider: w => {
      const raw = (w as { tokeo?: { bitcoin?: unknown } }).tokeo?.bitcoin
      return raw ? new UnisatAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
