/**
 * LaserEyes reactive state — five nanostore atoms.
 *
 * @remarks
 * State is split per concern. Subscribers subscribe to whichever atom
 * they care about and only re-render on that atom's changes.
 *
 * @module state
 */

import type { NetworkId } from '@omnisat/lasereyes-client'
import type { Account } from '@omnisat/lasereyes-client/wallet'
import { atom, map, type MapStore, type WritableAtom } from 'nanostores'
import type { ConnectionStatus, Connector } from './types/connector'

/**
 * The full reactive state surface of a LaserEyes config.
 *
 * @remarks
 * Each field is a separate atom so subscribers re-render on per-atom
 * changes only.
 */
export interface LaserEyesState {
  /** Connection lifecycle status. */
  $status: WritableAtom<ConnectionStatus>
  /** The currently connected account, or `undefined` when disconnected. */
  $account: WritableAtom<Account | undefined>
  /** The current network ID. */
  $networkId: WritableAtom<NetworkId>
  /** The currently active connector, or `undefined` when disconnected. */
  $connector: WritableAtom<Connector | undefined>
  /** Registry of available connectors keyed by connector ID. */
  $connectors: MapStore<Record<string, Connector>>
}

/**
 * Construct a fresh {@link LaserEyesState} with seeded defaults.
 *
 * @param initialNetworkId - Default network ID to start with (`'mainnet'` if omitted).
 */
export function createState(initialNetworkId: NetworkId = 'mainnet'): LaserEyesState {
  return {
    $status: atom<ConnectionStatus>('disconnected'),
    $account: atom<Account | undefined>(undefined),
    $networkId: atom<NetworkId>(initialNetworkId),
    $connector: atom<Connector | undefined>(undefined),
    $connectors: map<Record<string, Connector>>({}),
  }
}
