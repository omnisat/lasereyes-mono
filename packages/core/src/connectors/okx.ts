/**
 * OKX connector.
 * @module connectors/okx
 */

import { OkxAdapter } from '../adapters/okx'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function okx(): CreateConnectorFn {
  return injected({
    id: 'okx',
    name: 'OKX Wallet',
    rdns: 'com.okx.wallet',
    getProvider: (w) => (w as { okxwallet?: { bitcoin?: unknown } }).okxwallet?.bitcoin,
    adapter: OkxAdapter,
  })
}
