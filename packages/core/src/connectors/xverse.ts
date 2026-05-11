/**
 * Xverse connector.
 *
 * @remarks
 * Xverse uses the `sats-connect` protocol rather than a plain
 * `window`-injected provider. Detection looks for
 * `window.XverseProviders?.BitcoinProvider`. Mobile uses a deep link
 * fallback.
 *
 * @module connectors/xverse
 */

import { XVERSE_ICON, XverseAdapter } from '../adapters/xverse'
import type { CreateConnectorFn } from '../types/connector'
import { injected } from './injected'

/**
 * Xverse Wallet connector factory.
 *
 * @example
 * ```ts
 * import { xverse } from '@omnisat/lasereyes-core'
 * createLaserEyesConfig({ connectors: [xverse()] })
 * ```
 */
export function xverse(): CreateConnectorFn {
  return injected({
    id: 'xverse',
    name: 'Xverse Wallet',
    icon: XVERSE_ICON,
    rdns: 'app.xverse.wallet',
    getProvider: (w) =>
      (w as { XverseProviders?: { BitcoinProvider?: unknown } }).XverseProviders?.BitcoinProvider,
    adapter: XverseAdapter,
  })
}
