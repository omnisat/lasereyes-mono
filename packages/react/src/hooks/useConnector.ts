'use client'

import { useStore } from '@nanostores/react'
import type { Connector } from '@omnisat/lasereyes-core'
import { useConfig } from '../providers/context'

/**
 * A single connector. With an `id`, returns that registered connector; without
 * one, returns the currently active connector (or `undefined` when disconnected).
 *
 * @param id - Optional connector id to look up.
 *
 * @example
 * ```tsx
 * const active = useConnector()
 * const unisat = useConnector('unisat')
 * ```
 */
export function useConnector(id?: string): Connector | undefined {
  const config = useConfig()
  const conn = useStore(config.state.$connection)
  const registry = useStore(config.state.$connectors)
  return id ? registry[id] : conn.connector
}
