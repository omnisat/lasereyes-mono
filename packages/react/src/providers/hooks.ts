'use client'

import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LaserEyesStoreContext } from './context'
import type { LaserEyesContextType } from './types'
import { compareValues } from '../utils/comparison'
import type { LaserEyesStoreType, NetworkType } from '@kevinoyl/lasereyes-core'
import { batched, keepMount } from 'nanostores'

const defaultSelector = (x: LaserEyesContextType) => ({ ...x })

export function useLaserEyes(): LaserEyesContextType
export function useLaserEyes<T>(selector: (x: LaserEyesContextType) => T): T
export function useLaserEyes<T>(
  selector?: (x: LaserEyesContextType) => T
): T | LaserEyesContextType {
  const { $network, $store, methods, client } = useContext(
    LaserEyesStoreContext
  )

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

  const [laserEyesState, setLaserEyesState] = useState<
    ReturnType<typeof selector_>
  >(() => selector_($computedStore.get()))

  useEffect(() => {
    const unsub = $computedStore.listen((value) => {
      const selected = selector_(value)
      if (!compareValues(selected, laserEyesState)) {
        setLaserEyesState(selected)
      }
    })
    return () => unsub()
  }, [$computedStore, selector_, laserEyesState])

  return laserEyesState
}
