/**
 * Orange connector.
 * @module connectors/orange
 */

import { createOrangeAdapter } from '../adapters/orange'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function orange(): CreateConnectorFn {
  return injected({
    id: 'orange',
    name: 'Orange Wallet',
    rdns: 'app.orangewallet',
    getProvider: w => {
      const raw = (w as { OrangeWalletProviders?: { OrangeBitcoinProvider?: unknown } })
        .OrangeWalletProviders?.OrangeBitcoinProvider
      return raw ? createOrangeAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
