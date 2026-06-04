/**
 * LaserEyes reactive state.
 *
 * @remarks
 * Two stores:
 *
 * - **`$connection`** — a single nanostore carrying the four tightly-coupled
 *   fields that describe the active connection (`status`, `account`,
 *   `networkId`, `connector`). Bundled so updates are atomic: one
 *   {@link mutateConnection} call writes all changed fields in one shot,
 *   subscribers fire once, no listener ever observes a partial transition.
 *   Per-key reactivity via nanostores' `listenKeys` if you only care about,
 *   say, `status`. Exposed to consumers **read-only** — only the action
 *   layer mutates it, through {@link mutateConnection} (the wagmi-style
 *   "public state is read-only, internal seam writes" split).
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
import type { WalletAccount } from '@omnisat/lasereyes-client/wallet'
import { type MapStore, map, type ReadableAtom } from 'nanostores'
import type { ConnectionStatus, Connector } from './types/connector'

/**
 * The wide, writable connection shape — what the runtime store physically
 * holds and what {@link mutateConnection} patches. Every field is independently
 * settable here so the action layer can write partial transitions
 * (`{ status: 'connecting' }`) without satisfying a discriminated union.
 *
 * Consumers never read this shape directly: the public store narrows reads to
 * the discriminated {@link ConnectionSnapshot}. See {@link ConnectionStore}.
 *
 * @typeParam networkId - The chain-id union the active connection can hold.
 *   Defaults to the open {@link NetworkId}. A concrete config threads its
 *   configured chains' ID literals here (e.g. `'mainnet' | 'testnet4'`) so
 *   reads are precise.
 */
export interface ConnectionState<networkId extends NetworkId = NetworkId> {
  /** Connection lifecycle status. */
  status: ConnectionStatus
  /** The currently connected account, or `undefined` when disconnected. */
  account: WalletAccount | undefined
  /** The current network ID. */
  networkId: networkId
  /** The currently active connector, or `undefined` when disconnected. */
  connector: Connector | undefined
}

/**
 * The public READ snapshot of the connection — a **discriminated union on
 * `status`**, the shape every consumer sees via `get()` / `value` /
 * `subscribe` / `listen` (and `useStore`).
 *
 * @remarks
 * When `status === 'connected'`, `account` and `connector` are **guaranteed
 * populated** — `account` is a {@link WalletAccount} (with `getPublicKey()`),
 * so a `status === 'connected'` check narrows them non-null with no cast and
 * no library-type import:
 *
 * ```ts
 * const conn = config.state.$connection.get()
 * if (conn.status === 'connected') {
 *   conn.account.getPublicKey() // ✅ WalletAccount, no cast
 * }
 * ```
 *
 * Every other status leaves `account` / `connector` possibly-`undefined`: a
 * connect attempt over a prior connection keeps the old account until it
 * resolves, so `'connecting'` can't promise either presence or absence.
 * `'reconnecting'` is reserved in {@link ConnectionStatus} but not currently
 * written by the action layer; it's grouped with the non-connected members.
 *
 * This is a strict narrowing of {@link ConnectionState} (`Snapshot ⊆ State`),
 * which is what keeps the read-only narrowing in {@link ConnectionStore} sound.
 *
 * @typeParam networkId - The configured chains' ID union (see
 *   {@link ConnectionState}).
 */
export type ConnectionSnapshot<networkId extends NetworkId = NetworkId> =
  | {
      status: 'connected'
      account: WalletAccount
      networkId: networkId
      connector: Connector
    }
  | {
      status: 'disconnected' | 'connecting' | 'reconnecting'
      account: WalletAccount | undefined
      networkId: networkId
      connector: Connector | undefined
    }

/**
 * The READ-ONLY connection-store view exposed on {@link LaserEyesState}, with
 * its read surface narrowed to the configured chain-id union.
 *
 * @remarks
 * Two things are happening here, both deliberate:
 *
 * 1. **Read-only.** The type is built from nanostores' `ReadableAtom`, not
 *    `MapStore`/`WritableAtom`, so it carries no `set` / `setKey`. Consumers
 *    can `get` / `value` / `listen` / `subscribe` (and `useStore`) but cannot
 *    mutate — mutations go through the internal {@link mutateConnection} seam
 *    (mirrors wagmi: public `config.state` is a read-only surface; the store
 *    is written only internally).
 *
 * 2. **Precise reads, sound bound.** nanostores stores are **invariant** in
 *    their value (every atom has `notify(oldValue)` — a contravariant input —
 *    alongside `get` — a covariant output). If we narrowed the value outright,
 *    `…<ConnectionSnapshot<'mainnet'>>` would not be assignable to
 *    `…<ConnectionState<NetworkId>>`, so a concrete config would stop being
 *    assignable to bare `LaserEyesConfig` — breaking every action's
 *    `<const config extends LaserEyesConfig>` bound. So we narrow only the
 *    covariant **output** positions (`get` / `value` / `listen` / `subscribe`)
 *    to the discriminated {@link ConnectionSnapshot}, and leave `notify` / `lc`
 *    / `off` on the wide {@link ConnectionState}. Because `Snapshot ⊆ State`,
 *    that keeps narrow ⊆ wide, keeps the view a valid `Store` for `useStore`,
 *    and — since `StoreValue` is inferred off `get()` — gives `useStore(
 *    state.$connection)` the discriminated snapshot too.
 *
 * The net effect for consumers: reads are both network-id-precise *and*
 * status-discriminated (connected ⇒ `account: WalletAccount`), while the
 * writable seam stays wide so {@link mutateConnection} can patch single fields.
 */
type ReadSurface = 'get' | 'value' | 'listen' | 'subscribe'
export type ConnectionStore<networkId extends NetworkId = NetworkId> = Omit<
  ReadableAtom<ConnectionState>,
  ReadSurface
> &
  Pick<ReadableAtom<ConnectionSnapshot<networkId>>, ReadSurface>

/**
 * The full reactive state surface of a LaserEyes config.
 *
 * @typeParam networkId - The configured chains' ID union, threaded from
 *   {@link LaserEyesConfig} so `$connection.get().networkId` (and
 *   `useStore($connection)`) read back as the precise union. Defaults to the
 *   open {@link NetworkId} for the bare-config case.
 */
export interface LaserEyesState<networkId extends NetworkId = NetworkId> {
  /**
   * Connection state — atomic, **read-only** to consumers.
   *
   * @remarks
   * - Read everything: `state.$connection.get()`.
   * - Subscribe to all changes: `state.$connection.subscribe(state => ...)`.
   * - Subscribe to specific keys: `listenKeys(state.$connection, ['status'], cb)`.
   * - Mutate (action layer only): {@link mutateConnection}.
   */
  $connection: ConnectionStore<networkId>
  /** Registry of available connectors keyed by connector ID. */
  $connectors: MapStore<Record<string, Connector>>
}

/**
 * Construct a fresh {@link LaserEyesState} with seeded defaults.
 *
 * @remarks
 * Pass the configured chains' ID union as the type argument (e.g.
 * `createState<'mainnet' | 'testnet4'>(...)`) to thread read-precision into
 * the connection store. The seed value is just the *default* chain (one of
 * the union members); the type argument is the full union the connection can
 * switch across.
 *
 * @param initialNetworkId - Default network ID to start with (`'mainnet'` if omitted).
 */
export function createState<const networkId extends NetworkId = NetworkId>(
  initialNetworkId: networkId = 'mainnet' as networkId
): LaserEyesState<networkId> {
  return {
    // The runtime store is a fully-writable `MapStore<ConnectionState>`; the
    // public type is the read-only narrowed view ({@link ConnectionStore}).
    // Writes happen only via {@link mutateConnection}, which casts back.
    $connection: map<ConnectionState>({
      status: 'disconnected',
      account: undefined,
      networkId: initialNetworkId,
      connector: undefined,
    }) as unknown as ConnectionStore<networkId>,
    $connectors: map<Record<string, Connector>>({}),
  }
}

/**
 * Mutate the connection store — the single internal write seam for the
 * action layer.
 *
 * @remarks
 * `LaserEyesState.$connection` is exposed read-only (no `set` / `setKey`), so
 * actions go through this helper instead of touching the store directly. The
 * patch is **merged atomically** into the current snapshot in one `set` call,
 * so subscribers fire once and never observe a partial transition (the same
 * guarantee the bundled-map design gives — see the module docblock).
 *
 * The runtime `$connection` is a fully-writable `MapStore<ConnectionState>`;
 * the read-only public type is purely a compile-time view, so casting back to
 * the writable store here is sound. `networkId` in the patch is the wide
 * {@link NetworkId} (the value a connector/adapter reports), so writers never
 * need to cast at the call site.
 *
 * @param state - The config's reactive state (`config.state`).
 * @param patch - The connection fields to change; omitted fields are kept.
 *
 * @example
 * ```ts
 * mutateConnection(config.state, { status: 'connecting' })
 * mutateConnection(config.state, { status: 'connected', account, networkId, connector })
 * ```
 */
export function mutateConnection(state: LaserEyesState, patch: Partial<ConnectionState>): void {
  const writable = state.$connection as unknown as MapStore<ConnectionState>
  writable.set({ ...writable.get(), ...patch })
}
