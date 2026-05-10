/**
 * Keplr connector (Bitcoin).
 * @module connectors/keplr
 */

import { KeplrAdapter } from '../adapters/keplr'
import { KEPLR_ICON } from '../constants/wallet-icons'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

export function keplr(): CreateConnectorFn {
  return injected({
    id: 'keplr',
    name: 'Keplr Wallet',
    icon: KEPLR_ICON,
    rdns: 'app.keplr',
    getProvider: (w) => (w as { keplr?: unknown }).keplr,
    adapter: KeplrAdapter,
  })
}
