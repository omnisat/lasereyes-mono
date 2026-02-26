import { useStore } from '@nanostores/react'
import { useEffect, useState } from 'react'
import { getBalance } from '@omnisat/lasereyes-core'
import { useLaserEyesCore } from '../providers/lasereyes-provider'

/**
 * Return type for the {@link useBalance} hook.
 */
export interface UseBalanceResult {
  /** Balance in satoshis as a decimal string, or `undefined` if not yet loaded. */
  balance: string | undefined
  /** `true` while the balance fetch is in flight. */
  loading: boolean
  /** Non-null if the last fetch attempt failed. */
  error: Error | null
}

/**
 * Fetches the Bitcoin balance for an address.
 *
 * @remarks
 * Uses smart routing: tries the connected wallet's provider first, then falls
 * back to the configured data-source client. The balance is refreshed whenever
 * `address` or the active network changes.
 *
 * If `address` is omitted, the payment address of the currently connected
 * wallet is used. Returns `{ balance: undefined, loading: false, error: null }`
 * when no address is available.
 *
 * Does **not** use React Query internally — consumers can add their own caching
 * layer (e.g. TanStack Query) if needed.
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @param address - Bitcoin address to query. Defaults to the connected wallet's payment address.
 * @returns Balance, loading state, and error.
 *
 * @example
 * ```tsx
 * const { balance, loading, error } = useBalance()
 * // or for an explicit address:
 * const { balance } = useBalance('bc1q...')
 * ```
 */
export function useBalance(address?: string): UseBalanceResult {
  const core = useLaserEyesCore()
  const account = useStore(core.$account)
  const networkId = useStore(core.$networkId)

  const resolvedAddress =
    address ?? account?.find((a) => a.purpose === 'payment')?.address

  const [balance, setBalance] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!resolvedAddress) {
      setBalance(undefined)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getBalance(core, resolvedAddress)
      .then((b) => {
        if (!cancelled) {
          setBalance(b)
          setLoading(false)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [core, resolvedAddress, networkId])

  return { balance, loading, error }
}
