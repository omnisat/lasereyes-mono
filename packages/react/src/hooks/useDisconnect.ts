'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { disconnect as disconnectAction } from '@omnisat/lasereyes-core/actions'
import { useCallback } from 'react'
import { useConfig } from '../providers/context'
import type { ConfigParameter, ResolvedRegister } from '../types'

/** Result of {@link useDisconnect}. */
export interface UseDisconnectResult {
  /** Disconnect the active wallet and clear connection state. */
  disconnect: () => Promise<void>
}

/**
 * Disconnect the active wallet.
 *
 * @param parameters - Optional `{ config }` override.
 *
 * @example
 * ```tsx
 * const { disconnect } = useDisconnect()
 * <button onClick={() => disconnect()}>Disconnect</button>
 * ```
 */
export function useDisconnect<config extends LaserEyesConfig = ResolvedRegister['config']>(
  parameters: ConfigParameter<config> = {}
): UseDisconnectResult {
  const config = useConfig(parameters)
  const disconnect = useCallback(async () => {
    await disconnectAction(config)
  }, [config])
  return { disconnect }
}
