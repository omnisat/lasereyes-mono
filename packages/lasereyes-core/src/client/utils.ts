import { type MapStore, type WritableAtom, atom, map } from 'nanostores'
import { MAINNET } from '../constants/networks'
import {
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OYL,
  PHANTOM,
  UNISAT,
  WIZZ,
  XVERSE,
  ORANGE,
  OP_NET,
  SPARROW,
} from '../constants/wallets'
import type { NetworkType, ProviderType, Config } from '../types'
import type { LaserEyesStoreType } from './types'

export function triggerDOMShakeHack(callback: VoidFunction) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    setTimeout(() => {
      const node = document.createTextNode(' ')
      document.body.appendChild(node)
      node.remove()
      Promise.resolve().then(callback)
    }, 1500)
  }
}

export function createStores(): {
  $store: MapStore<LaserEyesStoreType>
  $network: WritableAtom<NetworkType>
  $library: WritableAtom
} {
  return {
    $store: map<LaserEyesStoreType>({
      provider: undefined,
      address: '',
      paymentAddress: '',
      publicKey: '',
      paymentPublicKey: '',
      connected: false,
      isConnecting: false,
      isInitializing: true,
      accounts: [],
      balance: undefined,
      hasProvider: {
        [LEATHER]: false,
        [UNISAT]: false,
        [MAGIC_EDEN]: false,
        [OKX]: false,
        [OP_NET]: false,
        [ORANGE]: false,
        [OYL]: false,
        [SPARROW]: true,
        [PHANTOM]: false,
        [WIZZ]: false,
        [XVERSE]: false,
      },
    }),
    $network: atom(MAINNET),
    $library: atom(undefined),
  }
}

export function createConfig(config?: Config) {
  if (!config) {
    return undefined
  }
  return {
    ...config,
  }
}

export const keysToPersist = [
  'address',
  'paymentAddress',
  'publicKey',
  'paymentPublicKey',
  'balance',
] as const

export type PersistedKey = (typeof keysToPersist)[number]

export function handleStateChangePersistence(
  walletName: ProviderType,
  newState: LaserEyesStoreType,
  changedKey: keyof LaserEyesStoreType | undefined,
  $valueStore: MapStore<Record<PersistedKey, string>>
) {
  if (newState.provider === walletName) {
    if (changedKey) {
      if (changedKey === 'balance') {
        $valueStore.setKey('balance', newState.balance?.toString() ?? '')
      } else if ((keysToPersist as readonly string[]).includes(changedKey)) {
        $valueStore.setKey(
          changedKey as PersistedKey,
          newState[changedKey]?.toString() ?? ''
        )
      }
    } else {
      $valueStore.set({
        address: newState.address,
        paymentAddress: newState.paymentAddress,
        paymentPublicKey: newState.paymentPublicKey,
        publicKey: newState.publicKey,
        balance: newState.balance?.toString() ?? '',
      })
    }
  }
}

export const fromHexString = (hexString: string): Uint8Array => {
  const matches = hexString.match(/.{1,2}/g)
  if (!matches) {
    throw new Error('Invalid hex string')
  }
  return Uint8Array.from(matches.map((byte) => Number.parseInt(byte, 16)))
}
