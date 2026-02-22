import { atom, type MapStore, map, type WritableAtom } from 'nanostores'
import { MAINNET } from '../constants/networks'
import {
  BINANCE,
  KEPLR,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OP_NET,
  ORANGE,
  OYL,
  PHANTOM,
  SPARROW,
  TOKEO,
  UNISAT,
  WIZZ,
  XVERSE,
} from '../constants/wallets'
import type { Config, NetworkType, ProviderType } from '../types'
import type { LaserEyesStoreType } from './types'

/**
 * Triggers a DOM mutation to force wallet provider injection detection.
 *
 * @remarks
 * Some wallet extensions inject their providers asynchronously after the DOM loads.
 * This hack creates and removes a text node to trigger mutation observers, then
 * executes the callback in a microtask. Only runs in browser environments.
 *
 * @param callback - Function to execute after the DOM mutation, typically to finalize initialization.
 */
export function triggerDOMShakeHack(callback: () => void) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    setTimeout(() => {
      const node = document.createTextNode(' ')
      document.body.appendChild(node)
      node.remove()
      Promise.resolve().then(callback)
    }, 1500)
  }
}

/**
 * Creates the reactive nanostore instances required by {@link LaserEyesClient}.
 *
 * @returns An object containing:
 *   - `$store` - A `MapStore` holding the wallet connection state ({@link LaserEyesStoreType}).
 *   - `$network` - A `WritableAtom` holding the current {@link NetworkType}, defaulting to `MAINNET`.
 *   - `$library` - A `WritableAtom` reserved for internal library state.
 *
 * @example
 * ```ts
 * const stores = createStores()
 * const client = new LaserEyesClient(stores, config)
 * ```
 */
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
        [TOKEO]: false,
        [PHANTOM]: false,
        [WIZZ]: false,
        [XVERSE]: false,
        [KEPLR]: false,
        [BINANCE]: false,
      },
    }),
    $network: atom(MAINNET),
    $library: atom(undefined),
  }
}

/**
 * Creates a shallow copy of the provided configuration, or returns `undefined` if no config is given.
 *
 * @param config - Optional {@link Config} to copy.
 * @returns A new config object with the same properties, or `undefined`.
 *
 * @example
 * ```ts
 * const config = createConfig({ network: MAINNET })
 * ```
 */
export function createConfig(config?: Config) {
  if (!config) {
    return undefined
  }
  return {
    ...config,
  }
}

/** Keys from {@link LaserEyesStoreType} that are persisted across sessions for a given wallet provider. */
export const keysToPersist = [
  'address',
  'paymentAddress',
  'publicKey',
  'paymentPublicKey',
  'balance',
] as const

/** A key from the store that is eligible for persistence. */
export type PersistedKey = (typeof keysToPersist)[number]

/**
 * Persists wallet state changes to a value store for a specific wallet provider.
 *
 * @remarks
 * Only persists keys listed in {@link keysToPersist}. If `changedKey` is specified,
 * only that key is updated; otherwise all persistable keys are written at once.
 *
 * @param walletName - The wallet provider whose state is being persisted.
 * @param newState - The full current store state.
 * @param changedKey - The specific key that changed, or `undefined` to persist all keys.
 * @param $valueStore - The target store to write persisted values into.
 */
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
        $valueStore.setKey(changedKey as PersistedKey, newState[changedKey]?.toString() ?? '')
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

/**
 * Converts a hex-encoded string to a `Uint8Array`.
 *
 * @param hexString - The hex string to convert (e.g., "deadbeef").
 * @returns The decoded byte array.
 * @throws Error if the hex string is invalid.
 */
export const fromHexString = (hexString: string): Uint8Array => {
  const matches = hexString.match(/.{1,2}/g)
  if (!matches) {
    throw new Error('Invalid hex string')
  }
  return Uint8Array.from(matches.map(byte => Number.parseInt(byte, 16)))
}
