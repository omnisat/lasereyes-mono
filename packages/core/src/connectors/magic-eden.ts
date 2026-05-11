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
    getProvider: w => (w as { magicEden?: { bitcoin?: unknown } }).magicEden?.bitcoin,
    adapter: MagicEdenAdapter,
    nativeRpc: { sendBtc: true },
  })
}
