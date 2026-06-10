/**
 * OpNet connector.
 *
 * @remarks
 * OP_NET exposes a Unisat-compatible API under `window.opnet`, so it
 * shares {@link UnisatAdapter} and differs only in detection key and
 * identity. Mirrors the Binance/Wizz clone pattern.
 *
 * @module connectors/op-net
 */

import { UnisatAdapter } from '../adapters/unisat'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function opNet(): CreateConnectorFn {
  return injected({
    id: 'op-net',
    name: 'OpNet Wallet',
    rdns: 'net.op_net',
    getProvider: w => {
      const raw = (w as { opnet?: unknown }).opnet
      return raw ? new UnisatAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
