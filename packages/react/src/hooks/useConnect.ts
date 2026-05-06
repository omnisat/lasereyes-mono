import { useCallback } from 'react'
import { useLaserEyesCore } from '../providers/lasereyes-provider'

/**
 * Returns `connect` and `disconnect` functions for managing wallet connections.
 *
 * @remarks
 * `connect` accepts a connector ID (e.g. `'io.unisat.wallet'`) and resolves when
 * the connection handshake completes. `disconnect` ends the active session.
 *
 * Both functions are stable references — they will not change between renders
 * unless the underlying core instance changes.
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @returns An object with `connect(connectorId)` and `disconnect()` methods.
 *
 * @example
 * ```tsx
 * const { connect, disconnect } = useConnect()
 *
 * const handleConnect = () => connect('io.unisat.wallet')
 * const handleDisconnect = () => disconnect()
 * ```
 */
export function useConnect() {
  const core = useLaserEyesCore()
  const connect = useCallback((connectorId: string) => core.connect(connectorId), [core])
  const disconnect = useCallback(() => core.disconnect(), [core])
  return { connect, disconnect }
}
