import { MapStore, WritableAtom, atom, map } from 'nanostores'
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
import { NetworkType } from '../types'
import { LaserEyesStoreType } from './types'

export function triggerDOMShakeHack() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    setTimeout(() => {
      const node = document.createTextNode(' ')
      document.body.appendChild(node)
      node.remove()
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
        [LEATHER]: undefined,
        [UNISAT]: undefined,
        [MAGIC_EDEN]: undefined,
        [OKX]: undefined,
        [OP_NET]: undefined,
        [ORANGE]: undefined,
        [OYL]: undefined,
        [SPARROW]: true,
        [PHANTOM]: undefined,
        [WIZZ]: undefined,
        [XVERSE]: undefined,
      },
    }),
    $network: atom(MAINNET),
    $library: atom(undefined),
  }
}

export function createConfig({ network }: { network: NetworkType }) {
  return {
    network,
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

export const fromHexString = (hexString: string): Uint8Array => {
  const matches = hexString.match(/.{1,2}/g)
  if (!matches) {
    throw new Error('Invalid hex string')
  }
  return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)))
}
