'use client'

import type { LaserEyesStoreType, NetworkType } from '@omnisat/lasereyes-core'
import { batched, keepMount } from 'nanostores'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { compareValues } from '../utils/comparison'
import { LaserEyesStoreContext } from './context'
import type { LaserEyesContextType } from './types'

const defaultSelector = (x: LaserEyesContextType) => ({ ...x })

/**
 * Primary React hook for accessing LaserEyes wallet state and methods.
 *
 * @remarks
 * Supports a selector pattern for optimized re-renders. When a selector is
 * provided, only the selected slice of state will trigger component re-renders
 * when it changes, similar to Zustand's selector pattern.
 *
 * Without a selector, the full {@link LaserEyesContextType} is returned,
 * including wallet addresses, connection state, provider availability flags,
 * and all wallet interaction methods (connect, sign, send, etc.).
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @returns The full wallet context including state and methods
 *
 * @example
 * ```tsx
 * // Full context access
 * const { address, connect, disconnect } = useLaserEyes()
 * ```
 */
export function useLaserEyes(): LaserEyesContextType
/**
 * Primary React hook for accessing LaserEyes wallet state and methods.
 *
 * @remarks
 * When a selector is provided, only the selected slice of state will trigger
 * component re-renders when it changes, improving performance.
 *
 * @param selector - A function to pick specific values from the context
 * @returns The selected value derived from the wallet context
 *
 * @example
 * ```tsx
 * // Select a single value (optimized re-renders)
 * const address = useLaserEyes(s => s.address)
 *
 * // Select multiple values
 * const { address, balance } = useLaserEyes(s => ({
 *   address: s.address,
 *   balance: s.balance,
 * }))
 * ```
 */
export function useLaserEyes<T>(selector: (x: LaserEyesContextType) => T): T
export function useLaserEyes<T>(
  selector?: (x: LaserEyesContextType) => T
): T | LaserEyesContextType {
  const { $network, $store, methods, client } = useContext(LaserEyesStoreContext)

  const selector_ = selector ?? defaultSelector

  const selectValues = useCallback(
    (store: LaserEyesStoreType, network: NetworkType) => {
      const value = {
        paymentAddress: store.paymentAddress,
        address: store.address,
        publicKey: store.publicKey,
        paymentPublicKey: store.paymentPublicKey,
        library: {},
        network,
        client: client,
        accounts: store.accounts,
        balance: store.balance ? Number(store.balance) : undefined,
        connected: store.connected,
        isConnecting: store.isConnecting,
        isInitializing: store.isInitializing,
        provider: store.provider,
        hasLeather: store.hasProvider.leather ?? false,
        hasMagicEden: store.hasProvider['magic-eden'] ?? false,
        hasOkx: store.hasProvider.okx ?? false,
        hasOyl: store.hasProvider.oyl ?? false,
        hasOrange: store.hasProvider.orange ?? false,
        hasOpNet: store.hasProvider.op_net ?? false,
        hasPhantom: store.hasProvider.phantom ?? false,
        hasUnisat: store.hasProvider.unisat ?? false,
        hasSparrow: store.hasProvider.sparrow ?? false,
        hasWizz: store.hasProvider.wizz ?? false,
        hasXverse: store.hasProvider.xverse ?? false,
        hasTokeo: store.hasProvider.tokeo ?? false,
        hasKeplr: store.hasProvider.keplr ?? false,
        hasBinance: store.hasProvider.binance ?? false,
        ...methods,
      }
      // if (typeof selector === 'function') {
      //   return selector(value)
      // }
      return value
    },
    [client, methods]
  )

  const $computedStore = useMemo(() => {
    const store = batched([$store, $network], selectValues)
    keepMount(store)
    return store
  }, [$store, $network, selectValues])

  const [laserEyesState, setLaserEyesState] = useState<ReturnType<typeof selector_>>(() =>
    selector_($computedStore.get())
  )

  useEffect(() => {
    const unsub = $computedStore.listen(value => {
      const selected = selector_(value)
      if (!compareValues(selected, laserEyesState)) {
        setLaserEyesState(selected)
      }
    })
    return () => unsub()
  }, [$computedStore, selector_, laserEyesState])

  return laserEyesState
}
