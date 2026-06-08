'use client'

import { useStore } from '@nanostores/react'
import type { Connector } from '@omnisat/lasereyes-core'
import { useMemo } from 'react'
import { useConfig } from '../providers/context'

/**
 * The available connectors — registered factories plus any wallets discovered
 * via EIP-6963-style announcement after `initialize`. Re-renders when the
 * registry changes.
 *
 * @example
 * ```tsx
 * const connectors = useConnectors()
 * connectors.map(c => <button key={c.id}>{c.name}</button>)
 * ```
 */
export function useConnectors(): Connector[] {
  const config = useConfig()
  const registry = useStore(config.state.$connectors)
  return useMemo(() => Object.values(registry), [registry])
}
