'use client'

import { useStore } from '@nanostores/react'
import type { Connector, ConnectResult, LaserEyesConfig } from '@omnisat/lasereyes-core'
import { connect as connectAction } from '@omnisat/lasereyes-core/actions'
import { useCallback, useMemo, useState } from 'react'
import { useConfig } from '../providers/context'
import type { ConfigParameter, ResolvedRegister } from '../types'

/** Result of {@link useConnect}. */
export interface UseConnectResult {
  /** Connect to a wallet by connector id. Resolves with the connected account. */
  connect: (connectorId: string) => Promise<ConnectResult>
  /** Available connectors (registered + dynamically discovered). */
  connectors: Connector[]
  /** `true` while a connect attempt is in flight. */
  isPending: boolean
  /** The last connect error, or `null`. */
  error: Error | null
}

/**
 * Connect a wallet.
 *
 * @remarks
 * `connect(connectorId)` dispatches the core `connect` action; connection state
 * (account, status) flows through `useAccount`/`useStatus`. Local `error`/
 * `isPending` track the in-flight attempt for connect UI. `connectors` reflects
 * the resolved config's live registry (registered + EIP-6963-discovered).
 *
 * @param parameters - Optional `{ config }` override.
 *
 * @example
 * ```tsx
 * const { connect, connectors, isPending, error } = useConnect()
 * <button onClick={() => connect('unisat')} disabled={isPending}>Connect</button>
 * ```
 */
export function useConnect<config extends LaserEyesConfig = ResolvedRegister['config']>(
  parameters: ConfigParameter<config> = {}
): UseConnectResult {
  const config = useConfig(parameters)
  const registry = useStore(config.state.$connectors)
  const connectors = useMemo(() => Object.values(registry), [registry])
  const status = useStore(config.state.$connection).status
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(
    async (connectorId: string): Promise<ConnectResult> => {
      setError(null)
      try {
        return await connectAction(config, { connectorId })
      } catch (e) {
        setError(e as Error)
        throw e
      }
    },
    [config]
  )

  return { connect, connectors, isPending: status === 'connecting', error }
}
