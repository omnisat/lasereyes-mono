/**
 * Orange connector.
 * @module connectors/orange
 */

import { OrangeAdapter } from '../adapters/orange'
import { ORANGE_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function orange(): CreateConnectorFn {
  return injected({
    id: 'orange',
    name: 'Orange Wallet',
    icon: ORANGE_ICON,
    rdns: 'app.orangewallet',
    getProvider: (w) => (w as { OrangeProvider?: unknown }).OrangeProvider,
    adapter: OrangeAdapter,
  })
}
