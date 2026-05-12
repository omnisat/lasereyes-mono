/**
 * LaserEyes reactive state.
 *
 * @remarks
 * Two stores:
 *
 * - **`$connection`** — a single nanostore `MapStore` carrying the four
 *   tightly-coupled fields that describe the active connection
 *   (`status`, `account`, `networkId`, `connector`). Bundled so updates
 *   are atomic: `connect()` calls `$connection.set({...all four})` in one
 *   shot, subscribers fire once, no listener ever observes a partial
 *   transition. Per-key reactivity via nanostores' `listenKeys` if you
 *   only care about, say, `status`.
 *
 * - **`$connectors`** — registry of available connector instances keyed
 *   by `id`. Separate from `$connection` because it changes for a
 *   different reason (EIP-6963 announcements arrive over time;
 *   reconnects don't touch it).
 *
 * **Why one map instead of four atoms.** Earlier iterations had
 * `$status`, `$account`, `$networkId`, `$connector` as four separate
 * atoms. Connect/disconnect set them sequentially, and any subscriber
 * that read a *different* atom inside its handler saw stale values
 * mid-transition (e.g. a `$account` listener reading `$networkId` before
 * `$networkId.set()` had run). The atomic MapStore eliminates that whole
 * class of bug — there is no "in between" any more.
 *
 * @module state
 */

import type { NetworkId } from '@omnisat/lasereyes-client'
import type { Account } from '@omnisat/lasereyes-client/wallet'
import { type MapStore, map } from 'nanostores'
import type { ConnectionStatus, Connector } from './types/connector'

/**
 * The four fields that together describe the active connection.
 *
 * @remarks
 * Invariant: when `status === 'connected'`, `account`, `connector`, and
 * `networkId` are all populated. When `status === 'disconnected'`,
 * `account` and `connector` are `undefined` and `networkId` holds the
 * last-known value (or the seeded default).
 */
export interface ConnectionState {
  /** Connection lifecycle status. */
  status: ConnectionStatus
  /** The currently connected account, or `undefined` when disconnected. */
  account: Account | undefined
  /** The current network ID. */
  networkId: NetworkId
  /** The currently active connector, or `undefined` when disconnected. */
  connector: Connector | undefined
}

/**
 * The full reactive state surface of a LaserEyes config.
 */
export interface LaserEyesState {
  /**
   * Connection state — atomic.
   *
   * @remarks
   * - Read everything: `state.$connection.get()`.
   * - Set everything atomically: `state.$connection.set({...})`.
   * - Set one key: `state.$connection.setKey('status', 'connected')`.
   * - Subscribe to all changes: `state.$connection.subscribe(state => ...)`.
   * - Subscribe to specific keys: `listenKeys(state.$connection, ['status'], cb)`.
   */
  $connection: MapStore<ConnectionState>
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
    $connection: map<ConnectionState>({
      status: 'disconnected',
      account: undefined,
      networkId: initialNetworkId,
      connector: undefined,
    }),
    $connectors: map<Record<string, Connector>>({}),
  }
}
