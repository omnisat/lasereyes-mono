import { useStore } from '@nanostores/react'
import { type DependencyList, type EffectCallback, useEffect } from 'react'
import { useLaserEyesCore } from '../providers/lasereyes-provider'

/**
 * Return type for the {@link useAccount} hook.
 *
 * Returns `undefined` when no wallet is connected, otherwise provides the
 * connected wallet's address information.
 */
type UseAccountReturnType =
  | {
      /** All account addresses exposed by the connected wallet */
      addresses: string[]
      /** The payment (P2WPKH/P2SH) address */
      payment: string
      /** The ordinals/taproot address */
      ordinals: string
      /** The wallet's public key (hex-encoded) for the payment address */
      publicKey: string
    }
  | undefined

/**
 * Returns the connected wallet's account addresses and public key.
 *
 * @remarks
 * Returns `undefined` when no wallet is connected. Subscribes directly to
 * `core.$account` via nanostores, so the component re-renders only when
 * the account atom changes.
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @returns Account info, or `undefined` if no wallet is connected.
 *
 * @example
 * ```tsx
 * const account = useAccount()
 * if (account) {
 *   console.log(account.payment)  // payment address
 *   console.log(account.ordinals) // ordinals/taproot address
 * }
 * ```
 */
export function useAccount(): UseAccountReturnType {
  const core = useLaserEyesCore()
  const account = useStore(core.$account)

  if (!account || account.length === 0) return undefined

  const paymentAddr = account.find((a) => a.purpose === 'payment')
  const ordinalsAddr = account.find((a) => a.purpose === 'ordinals') ?? paymentAddr

  return {
    addresses: account.map((a) => a.address),
    payment: paymentAddr?.address ?? '',
    ordinals: ordinalsAddr?.address ?? '',
    publicKey: paymentAddr?.publicKey ?? '',
  }
}

/**
 * Runs a side effect whenever the connected wallet's accounts change.
 *
 * @remarks
 * Subscribes to `core.$account` and invokes the callback whenever the atom
 * emits a new value. The callback follows the same semantics as `useEffect` —
 * it may return a cleanup function that is called before the next invocation
 * or on unmount.
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @param callback - Effect to run on account change; may return a cleanup function.
 * @param dependencies - Additional dependencies for the underlying `useEffect`.
 *
 * @example
 * ```tsx
 * useAccountEffect(() => {
 *   console.log('Accounts changed, refetching data...')
 *   refetchUserData()
 * }, [refetchUserData])
 * ```
 */
export function useAccountEffect(callback: EffectCallback, dependencies: DependencyList) {
  const core = useLaserEyesCore()

  useEffect(() => {
    let cleanup: ReturnType<EffectCallback>

    const unsub = core.$account.subscribe((account, prevAccount) => {
      // Only fire when the value actually changes (nanostores calls on subscribe too)
      if (account !== prevAccount) {
        cleanup?.()
        cleanup = callback()
      }
    })

    return () => {
      unsub()
      cleanup?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core, callback, ...dependencies])
}
