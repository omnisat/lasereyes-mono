/**
 * OYL connector.
 * @module connectors/oyl
 */

import { OylAdapter } from '../adapters/oyl'
import { OYL_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function oyl(): CreateConnectorFn {
  return injected({
    id: 'oyl',
    name: 'OYL Wallet',
    icon: OYL_ICON,
    rdns: 'app.oyl',
    getProvider: (w) => (w as { oyl?: unknown }).oyl,
    adapter: OylAdapter,
  })
}
