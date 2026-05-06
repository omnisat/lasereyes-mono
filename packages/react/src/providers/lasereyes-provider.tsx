'use client'

import { createLaserEyesCore, type LaserEyesCoreConfig, type LaserEyesCore } from '@omnisat/lasereyes-core'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

// ============================================================================
// Context
// ============================================================================

const CoreContext = createContext<LaserEyesCore | null>(null)

// ============================================================================
// Provider
// ============================================================================

/**
 * Root context provider for LaserEyes Bitcoin wallet integration.
 *
 * @remarks
 * Instantiates a {@link LaserEyesCore} state manager, calls `initialize()` on
 * mount, and disposes it on unmount. All descendant components can access the
 * core via {@link useLaserEyesCore}.
 *
 * Must be placed near the top of your component tree. Only one instance should
 * be rendered at a time.
 *
 * @param props.config - Optional configuration (network, data sources, connectors)
 * @param props.children - Child React nodes
 *
 * @example
 * ```tsx
 * import { LaserEyesProvider } from '@omnisat/lasereyes-react'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * const ds = createDataSource({ network: MAINNET })
 *
 * function App() {
 *   return (
 *     <LaserEyesProvider
 *       config={{
 *         network: 'mainnet',
 *         networks: { mainnet: { dataSources: [ds] } },
 *       }}
 *     >
 *       <MyWalletUI />
 *     </LaserEyesProvider>
 *   )
 * }
 * ```
 */
export default function LaserEyesProvider({
  config,
  children,
}: {
  config?: LaserEyesCoreConfig
  children: ReactNode | ReactNode[]
}) {
  const [core] = useState(() => createLaserEyesCore(config))

  useEffect(() => {
    core.initialize()
    return () => core.dispose()
  }, [core])

  return <CoreContext.Provider value={core}>{children}</CoreContext.Provider>
}

// ============================================================================
// Core hook
// ============================================================================

/**
 * Returns the {@link LaserEyesCore} instance from the nearest {@link LaserEyesProvider}.
 *
 * @remarks
 * Use this hook when you need direct access to the core — for example, to call
 * `core.connect()`, `core.disconnect()`, or `core.getClient()`.
 *
 * For most use cases, prefer the purpose-specific hooks (`useAccount`,
 * `useConnect`, `useBalance`, etc.) which subscribe to the relevant atom and
 * re-render only when that atom changes.
 *
 * @throws {Error} If called outside of a {@link LaserEyesProvider}.
 *
 * @example
 * ```tsx
 * const core = useLaserEyesCore()
 * await core.connect('io.unisat.wallet')
 * ```
 */
export function useLaserEyesCore(): LaserEyesCore {
  const core = useContext(CoreContext)
  if (!core) throw new Error('useLaserEyesCore must be used within a LaserEyesProvider')
  return core
}
