/**
 * Magic Eden connector.
 * @module connectors/magic-eden
 */

import { MagicEdenAdapter } from '../adapters/magic-eden'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function magicEden(): CreateConnectorFn {
  return injected({
    id: 'magic-eden',
    name: 'Magic Eden Wallet',
    rdns: 'io.magiceden.bitcoin',
    getProvider: w => {
      const raw = (w as { magicEden?: { bitcoin?: unknown } }).magicEden?.bitcoin
      return raw ? new MagicEdenAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true },
  })
}
