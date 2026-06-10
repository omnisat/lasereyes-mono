'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { dispose, initialize } from '@omnisat/lasereyes-core/actions'
import { createQueryContext } from '@omnisat/lasereyes-core/query'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { LaserEyesContext } from './context'

/**
 * Props for {@link LaserEyesProvider}.
 */
export interface LaserEyesProviderProps {
  /**
   * A config built with `createLaserEyesConfig` from `@omnisat/lasereyes-core`.
   *
   * @remarks
   * Build it once, outside React (module scope), so its identity is stable
   * across renders — the provider runs `initialize`/`dispose` keyed on it.
   */
  config: LaserEyesConfig
  children: ReactNode | ReactNode[]
}

/**
 * Root provider for LaserEyes Bitcoin wallet integration.
 *
 * @remarks
 * Config-first: you build the config yourself and pass it in. The provider
 * - exposes the config + a provider-scoped query cache to all descendant hooks,
 * - calls `initialize(config)` on mount (wiring connector discovery + optional
 *   auto-reconnect) and `dispose(config)` on unmount.
 *
 * The query cache is created once per mount (`useState` initializer), so reads
 * and writes share one cache and SSR / per-request isolation is preserved.
 *
 * @example
 * ```tsx
 * import { LaserEyesProvider } from '@omnisat/lasereyes-react'
 * import { createLaserEyesConfig, MAINNET } from '@omnisat/lasereyes-core'
 * import { unisat, xverse } from '@omnisat/lasereyes-core/connectors'
 * import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
 *
 * const config = createLaserEyesConfig({
 *   chains: [MAINNET],
 *   connectors: [unisat(), xverse()],
 *   backends: { mainnet: mempool() },
 * })
 *
 * export function App() {
 *   return (
 *     <LaserEyesProvider config={config}>
 *       <WalletUI />
 *     </LaserEyesProvider>
 *   )
 * }
 * ```
 */
export function LaserEyesProvider({ config, children }: LaserEyesProviderProps) {
  const [queryCtx] = useState(() => createQueryContext())

  useEffect(() => {
    initialize(config)
    return () => dispose(config)
  }, [config])

  const value = useMemo(() => ({ config, queryCtx }), [config, queryCtx])

  return <LaserEyesContext.Provider value={value}>{children}</LaserEyesContext.Provider>
}

export default LaserEyesProvider
