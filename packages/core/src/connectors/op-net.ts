/**
 * OpNet connector.
 * @module connectors/op-net
 */

import { OpNetAdapter } from '../adapters/op-net'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function opNet(): CreateConnectorFn {
  return injected({
    id: 'op-net',
    name: 'OpNet Wallet',
    rdns: 'net.op_net',
    getProvider: (w) => (w as { opnet?: unknown }).opnet,
    adapter: OpNetAdapter,
  })
}
