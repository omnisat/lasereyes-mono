/**
 * Keplr connector (Bitcoin).
 *
 * @remarks
 * Keplr exposes a Unisat-compatible Bitcoin API under
 * `window.keplr.bitcoin` (with a legacy `window.bitcoin_keplr` fallback),
 * so it shares {@link UnisatAdapter} and differs only in detection key
 * and identity. Mirrors the Binance/Wizz clone pattern.
 *
 * @module connectors/keplr
 */

import { UnisatAdapter } from '../adapters/unisat'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function keplr(): CreateConnectorFn {
  return injected({
    id: 'keplr',
    name: 'Keplr Wallet',
    rdns: 'app.keplr',
    getProvider: w => {
      const win = w as { keplr?: { bitcoin?: unknown }; bitcoin_keplr?: unknown }
      const raw = win.keplr?.bitcoin ?? win.bitcoin_keplr
      return raw ? new UnisatAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
