/**
 * OpNet connector.
 * @module connectors/op-net
 */

import { OpNetAdapter } from '../adapters/op-net'
import { OP_NET_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function opNet(): CreateConnectorFn {
  return injected({
    id: 'op-net',
    name: 'OpNet Wallet',
    icon: OP_NET_ICON,
    rdns: 'net.op_net',
    getProvider: (w) => (w as { opnet?: unknown }).opnet,
    adapter: OpNetAdapter,
  })
}
