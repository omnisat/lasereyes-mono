'use client'

import { useStore } from '@nanostores/react'
import type { ConnectionStatus, LaserEyesConfig } from '@omnisat/lasereyes-core'
import { useConfig } from '../providers/context'
import type { ConfigParameter, ResolvedRegister } from '../types'

/**
 * The current connection status (`connected` / `connecting` / `reconnecting` /
 * `disconnected`). A thin subscription for components that only care about the
 * lifecycle flag.
 *
 * @param parameters - Optional `{ config }` override.
 *
 * @example
 * ```tsx
 * const status = useStatus()
 * ```
 */
export function useStatus<config extends LaserEyesConfig = ResolvedRegister['config']>(
  parameters: ConfigParameter<config> = {}
): ConnectionStatus {
  const config = useConfig(parameters)
  return useStore(config.state.$connection).status
}
