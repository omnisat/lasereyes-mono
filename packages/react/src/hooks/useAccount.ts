import { type DependencyList, type EffectCallback, useEffect } from 'react'
import { useLaserEyes } from '../providers/hooks'
import { compareValues } from '../utils/comparison'

/**
 * Return type for the {@link useAccount} hook.
 *
 * Returns `undefined` when no wallet is connected, otherwise provides
 * the connected wallet's address information.
 */
type UseAccountReturnType =
  | {
      /** All account addresses exposed by the connected wallet */
      addresses: string[]
      /** The payment (P2WPKH/P2SH) address */
      payment: string
      /** The ordinals/taproot address */
      ordinals: string
      /** The wallet's public key (hex-encoded) */
      publicKey: string
    }
  | undefined

/**
 * Returns the connected wallet's account addresses and public key.
 *
 * @remarks
 * Returns `undefined` when no wallet is connected. Uses a selector internally
 * for optimized re-renders -- only re-renders when address-related state changes.
 *
 * @returns The account info object, or `undefined` if no wallet is connected
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
  const { address, paymentAddress, accounts, publicKey } = useLaserEyes(
    ({ address, paymentAddress, accounts, publicKey }) => ({
      address,
      paymentAddress,
      accounts,
      publicKey,
    })
  )

  return !address
    ? undefined
    : {
        addresses: accounts,
        payment: paymentAddress,
        ordinals: address,
        publicKey,
      }
}

/**
 * Runs a side effect whenever the connected wallet's accounts change.
 *
 * @remarks
 * Subscribes to the underlying nanostore and invokes the callback when the
 * `accounts` field changes. The callback follows the same semantics as
 * `useEffect` -- it may return a cleanup function that is called before
 * the next invocation or on unmount.
 *
 * @param callback - Effect function to run when accounts change; may return a cleanup function
 * @param dependencies - Additional dependency list for the underlying `useEffect`
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
  const store = useLaserEyes(x => x.client?.$store)

  useEffect(() => {
    if (!store) return

    let unsub: ReturnType<EffectCallback>
    const stUnsub = store.subscribe((v, ov, ck) => {
      if (ck === 'accounts') {
        if (!compareValues(v.accounts, ov?.accounts)) {
          unsub?.()
          unsub = callback()
        }
      }
    })

    return () => {
      stUnsub()
      unsub?.()
    }
  }, [store, callback, ...dependencies])
}
