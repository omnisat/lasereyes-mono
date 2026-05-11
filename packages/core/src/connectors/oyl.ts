/**
 * OYL connector.
 * @module connectors/oyl
 */

import { OylAdapter } from '../adapters/oyl'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function oyl(): CreateConnectorFn {
  return injected({
    id: 'oyl',
    name: 'OYL Wallet',
    rdns: 'app.oyl',
    getProvider: (w) => (w as { oyl?: unknown }).oyl,
    adapter: OylAdapter,
  })
}
