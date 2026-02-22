import { useLaserEyes } from '../providers/hooks'

/**
 * Returns the `connect` function for initiating a wallet connection.
 *
 * @remarks
 * This is a convenience hook that selects only the `connect` method from the
 * LaserEyes context. Components using this hook will only re-render when the
 * `connect` function reference changes, not on every state update.
 *
 * @returns A function that accepts a {@link ProviderType} and returns a Promise
 * that resolves when the connection is established
 *
 * @example
 * ```tsx
 * import { UNISAT } from '@omnisat/lasereyes-core'
 *
 * const connect = useConnect()
 *
 * const handleConnect = () => connect(UNISAT)
 * ```
 */
export function useConnect() {
  return useLaserEyes(x => x.connect)
}
