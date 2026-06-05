/**
 * `broadcastTransaction` write mutation. One file, one action.
 *
 * @remarks
 * Returns a nanoquery `MutatorStore`: `.mutate({ rawTx })` pushes an
 * already-signed raw transaction to the backend, returning the txid. A broadcast
 * changes chain state, so on success it revalidates the connected account's
 * reads (the raw tx isn't parsed for its addresses here). The address-keyed
 * selector is network-agnostic, so it also covers `{ chainId }` broadcasts onto
 * a chain other than the active one.
 *
 * @module query/broadcast-transaction
 */

import type { MutatorStore } from '@nanostores/query'
import { broadcastTransaction } from '../actions'
import type { LaserEyesConfig } from '../config'
import { defaultQueryContext, type QueryContext } from './context'
import { addressesKeySelector, connectedAccountAddresses } from './invalidate'

/** Optional `broadcastTransaction` parameters (e.g. `{ chainId }`). */
type BroadcastTransactionOptions = Parameters<typeof broadcastTransaction>[2]

/** `.mutate()` argument for {@link broadcastTransactionMutation}. */
export interface BroadcastTransactionVariables {
  /** Signed raw transaction, hex-encoded. */
  rawTx: string
  /** Optional parameters (e.g. `{ chainId }` to broadcast off the active chain). */
  options?: BroadcastTransactionOptions
}

/**
 * Mutator store wrapping {@link broadcastTransaction}. Revalidates the connected
 * account's cached reads on success; returns the broadcast txid.
 *
 * @param config - The LaserEyes config.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $broadcast = broadcastTransactionMutation(config)
 * const txId = await $broadcast.mutate({ rawTx })
 * ```
 */
export function broadcastTransactionMutation(
  config: LaserEyesConfig,
  ctx: QueryContext = defaultQueryContext
): MutatorStore<BroadcastTransactionVariables, string> {
  const [, createMutatorStore, { revalidateKeys }] = ctx
  return createMutatorStore<BroadcastTransactionVariables, string>(async ({ data }) => {
    const txId = await broadcastTransaction(config, data.rawTx, data.options)
    const addresses = connectedAccountAddresses(config)
    if (addresses.length > 0) revalidateKeys(addressesKeySelector(addresses))
    return txId
  })
}
