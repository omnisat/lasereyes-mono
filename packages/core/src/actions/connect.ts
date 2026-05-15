/**
 * Lifecycle: connect a wallet by connector ID.
 *
 * @remarks
 * Updates `config.state.$connection` atomically — all four fields
 * (`status`, `account`, `networkId`, `connector`) flip in a single
 * `.set({...})` call, so subscribers never observe a partial
 * transition. After a successful connect, subscribes to the connector's
 * provider-level events (`accountsChanged`, `networkChanged`,
 * `disconnect`) and propagates them into `$connection`. Subscriptions
 * persist for the lifetime of the connection and are torn down by
 * {@link disconnect}.
 *
 * @module actions/connect
 */

import type { NetworkId } from '@omnisat/lasereyes-client'
import {
  createWalletAccount,
  type WalletAccountConfig,
} from '@omnisat/lasereyes-client/wallet'
import type { LaserEyesConfig } from '../config'
import { invalidateClientCache } from '../internal'
import type { Connector, ConnectResult } from '../types/connector'
import type { BitcoinProvider } from '../types/provider'
import { getWalletClient } from '../wallet-client'

/**
 * Args for {@link connect}.
 */
export interface ConnectArgs {
  /**
   * Connector ID — the `id` field of the registered `Connector`.
   *
   * @remarks
   * Connectors are registered in `state.$connectors` under their `id`. The
   * registry includes both factories from `config.connectorFns` and any
   * announced wallets discovered after `initialize`.
   */
  connectorId: string
}

/**
 * Module-private map of `config → cleanup`. {@link disconnect} reads this
 * to tear down event subscriptions installed here.
 *
 * @internal
 */
const eventCleanups = new WeakMap<object, () => void>()

/**
 * Internal: read the event-subscription cleanup callback for a config.
 *
 * @internal
 */
export function _getConnectCleanup(config: object): (() => void) | undefined {
  return eventCleanups.get(config)
}

/**
 * Internal: clear the event-subscription cleanup callback for a config.
 *
 * @internal
 */
export function _clearConnectCleanup(config: object): void {
  eventCleanups.delete(config)
}

/**
 * Subscribe to provider events on a freshly-connected connector and
 * propagate them into config state.
 *
 * @remarks
 * Each handler writes through `$connection.setKey(...)` — only the
 * affected field changes, but the MapStore's listeners still see a
 * consistent snapshot (all other fields stay at their committed values).
 *
 * @internal
 */
function subscribeToConnectorEvents(
  config: LaserEyesConfig<any, any, any>,
  connector: Connector,
  provider: BitcoinProvider
): () => void {
  // Trust the adapter's normalized payload. The adapter's
  // `subscribeRawEvents` is the right place to normalize wallet-native
  // payloads (e.g. Unisat emits a string[] of addresses; the adapter
  // re-derives the standard wire shape — `WalletAccountConfig` — before
  // re-emitting). Construct the method-bearing `WalletAccount` here so
  // it lands on state ready to use.
  const onAccountsChanged = (data: WalletAccountConfig) => {
    // Account changed on the wallet's side. Drop the cached wallet
    // client for the current chain — it was built against the previous
    // account. The next `getWalletClient` call rebuilds and re-caches.
    const currentChain = config.state.$connection.get().networkId
    invalidateClientCache(config, currentChain)
    config.state.$connection.setKey('account', createWalletAccount(data))
  }

  const onNetworkChanged = async (payload?: NetworkId) => {
    // The adapter is responsible for normalizing the wallet's native
    // network identifier into a spec {@link NetworkId} before re-emitting
    // (each wallet has its own naming — Unisat fires `livenet`, etc.;
    // the adapter's `subscribeRawEvents` translates). Trust the payload
    // when it's a string; fall back to a re-query otherwise.
    let next: NetworkId | undefined =
      typeof payload === 'string' ? (payload as NetworkId) : undefined
    if (!next) {
      try {
        next = await connector.getNetworkId()
      } catch {
        return
      }
    }
    // Drop the cached wallet client for the prior chain — it's stale
    // (signer/account were bound to that chain's context). The next
    // `getWalletClient` rebuilds for the new chain.
    const previous = config.state.$connection.get().networkId
    if (previous && previous !== next) invalidateClientCache(config, previous)
    invalidateClientCache(config, next)
    config.state.$connection.setKey('networkId', next)

    // Eagerly rebuild + cache the wallet client for the new chain so
    // the next sync `getClient(config)` returns a wallet client
    // (carrying the connector's `getClient` overrides) instead of
    // falling through to a bare client. Mirrors the post-connect
    // pre-build in `connect()` — without this, the data-action path
    // bypasses connector overrides after every network switch.
    if (!config.client) {
      try {
        await getWalletClient(config)
      } catch {
        // Best-effort; failures surface on the next explicit call.
      }
    }
  }

  const onDisconnect = () => {
    // Atomic clear — one notification, consistent observation.
    config.state.$connection.set({
      ...config.state.$connection.get(),
      status: 'disconnected',
      account: undefined,
      connector: undefined,
    })
    // Drop every cached client — wallet-backed ones reference the now-
    // gone connection. Read-only clients can be rebuilt cheaply on
    // demand; safest to clear all and let them repopulate.
    invalidateClientCache(config)
  }

  provider.on('accountsChanged', onAccountsChanged)
  provider.on('networkChanged', onNetworkChanged)
  provider.on('disconnect', onDisconnect)

  return () => {
    provider.removeListener('accountsChanged', onAccountsChanged)
    provider.removeListener('networkChanged', onNetworkChanged)
    provider.removeListener('disconnect', onDisconnect)
  }
}

/**
 * Connect to a wallet.
 *
 * @remarks
 * Looks up the connector from `state.$connectors` by `connectorId`, sets
 * `status` to `'connecting'`, and calls `connector.connect()`.
 *
 * **On success.** Atomically writes the new `{ status, account,
 * networkId, connector }` to `$connection` in one `.set()` call, so any
 * subscriber that fires sees the whole new connection consistently. If
 * `autoReconnect` is enabled, persists the ID to storage. Subscribes to
 * provider events so subsequent wallet-side changes (user switches
 * network or account in the wallet UI) propagate into state.
 *
 * **On failure.** Restores `status` to whatever it was before — the
 * attempt is a no-op for everything except `status`. wagmi behaves the
 * same way: clicking "Connect Y" while connected to X doesn't disconnect
 * from X if Y rejects.
 *
 * @returns The connection result `{ account, networkId }`.
 *
 * @throws {Error} If `connectorId` is not registered in `state.$connectors`,
 *   or if `connector.connect()` rejects.
 */
export async function connect<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  args: ConnectArgs
): Promise<ConnectResult> {
  const connector = config.state.$connectors.get()[args.connectorId]
  if (!connector) {
    throw new Error(`Connector '${args.connectorId}' is not registered`)
  }

  const prior = config.state.$connection.get()

  config.state.$connection.setKey('status', 'connecting')

  let result: ConnectResult
  try {
    result = await connector.connect()
  } catch (error) {
    // No-op for everything except `status` — restore it. Account /
    // networkId / connector / event subscriptions all stay exactly as
    // they were.
    config.state.$connection.setKey('status', prior.status)
    throw error
  }

  // Tear down any stale subscription from a prior connection only now —
  // doing it before the attempt would have stranded the previous
  // connection's event flow if the new attempt rejected.
  eventCleanups.get(config)?.()
  eventCleanups.delete(config)

  // Drop any cached read-only client for the connected chain (and any
  // prior wallet client) — we're about to build a fresh wallet client
  // for this connection.
  invalidateClientCache(config)

  // Atomic update: one notification, all four fields consistent.
  config.state.$connection.set({
    status: 'connected',
    account: result.account,
    networkId: result.networkId,
    connector,
  })

  if (config.autoReconnect) {
    config.storage.setItem('lasereyes.connectorId', connector.id)
  }

  const provider = connector.getProvider()
  if (provider) {
    eventCleanups.set(config, subscribeToConnectorEvents(config, connector, provider))
  }

  // Eagerly build the wallet client and populate the cache so
  // `getClient` (sync) returns it from the cache on subsequent calls.
  // Skipped when `config.client` is set — the user's factory wins
  // unconditionally, so caching a connector-built client would be
  // wasted work.
  if (!config.client) {
    try {
      await getWalletClient(config)
    } catch {
      // Cache pre-population is best-effort. Failures here don't fail
      // the connect — the next `getClient` / `getWalletClient` call
      // will surface the real error.
    }
  }

  connector.onConnect?.(result)
  return result
}
