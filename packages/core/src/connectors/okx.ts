/**
 * OKX connector.
 * @module connectors/okx
 */

import { createOkxAdapter } from '../adapters/okx'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function okx(): CreateConnectorFn {
  return injected({
    id: 'okx',
    name: 'OKX Wallet',
    rdns: 'com.okx.wallet',
    // OKX serves mainnet (`bitcoin`) and testnet (`bitcoinTestnet`) from
    // distinct sub-providers; hand the adapter the `okxwallet` root so it
    // can pick the right one per network.
    getProvider: w => {
      const root = (w as { okxwallet?: { bitcoin?: unknown; bitcoinTestnet?: unknown } }).okxwallet
      return root?.bitcoin ? createOkxAdapter(root) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
