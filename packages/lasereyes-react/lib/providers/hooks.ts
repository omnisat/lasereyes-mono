import { useContext, useMemo } from 'react'
import { LaserEyesStoreContext } from './context'
import { LaserEyesContextType } from './types'
import { batched, keepMount, onNotify } from 'nanostores'
import { useStore } from '@nanostores/react'
import { compareValues } from '../utils/comparison'

export function useLaserEyes(): LaserEyesContextType
export function useLaserEyes<T>(selector: (x: LaserEyesContextType) => T): T
export function useLaserEyes<T>(
  selector?: (x: LaserEyesContextType) => T
): T | LaserEyesContextType {
  const { $network, $store, methods } = useContext(LaserEyesStoreContext)

  const $computedStore = useMemo(() => {
    const computedStore = batched([$store, $network], (store, network) => {
      const value = {
        paymentAddress: store.paymentAddress,
        address: store.address,
        publicKey: store.publicKey,
        paymentPublicKey: store.paymentPublicKey,
        library: {},
        network,
        accounts: store.accounts,
        balance: Number(store.balance),
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
        ...methods,
      }
      if (typeof selector === 'function') {
        return selector(value)
      }
      return value
    })

    keepMount(computedStore)
    onNotify(computedStore, ({ oldValue, abort }) => {
      if (compareValues(oldValue, computedStore.value)) {
        abort()
      }
    })

    return computedStore
  }, [$network, $store, selector, methods])

  return useStore($computedStore)
}
