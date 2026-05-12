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
    getProvider: w => {
      const raw = (w as { OrangeProvider?: unknown }).OrangeProvider
      return raw ? new OrangeAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
