/**
 * Orange connector.
 * @module connectors/orange
 */

import { OrangeAdapter } from '../adapters/orange'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function orange(): CreateConnectorFn {
  return injected({
    id: 'orange',
    name: 'Orange Wallet',
    rdns: 'app.orangewallet',
    getProvider: (w) => (w as { OrangeProvider?: unknown }).OrangeProvider,
    adapter: OrangeAdapter,
  })
}
