/**
 * `broadcastPsbt` write mutation. One file, one action.
 *
 * @remarks
 * Returns a nanoquery `MutatorStore`: `.mutate({ psbt })` signs+finalizes (via
 * the wallet) and broadcasts in one step, returning the txid. A broadcast always
 * changes chain state, so on success it revalidates the connected account's
 * reads. Like {@link signPsbtMutation}, the touched addresses aren't parsed out
 * of the PSBT here, so it revalidates the whole connected account; revalidate
 * (not invalidate) to avoid a loading flash.
 *
 * @module query/broadcast-psbt
 */

import type { MutatorStore } from '@nanostores/query'
import { broadcastPsbt } from '../actions'
import type { LaserEyesConfig } from '../config'
import { defaultQueryContext, type QueryContext } from './context'
import { addressesKeySelector, connectedAccountAddresses } from './invalidate'

/** `.mutate()` argument for {@link broadcastPsbtMutation}. */
export interface BroadcastPsbtVariables {
  /** PSBT in hex or base64 format. */
  psbt: string
}

/**
 * Mutator store wrapping {@link broadcastPsbt}. Revalidates the connected
 * account's cached reads on success; returns the broadcast txid.
 *
 * @param config - The LaserEyes config.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $broadcast = broadcastPsbtMutation(config)
 * const txId = await $broadcast.mutate({ psbt })
 * ```
 */
export function broadcastPsbtMutation(
  config: LaserEyesConfig,
  ctx: QueryContext = defaultQueryContext
): MutatorStore<BroadcastPsbtVariables, string> {
  const [, createMutatorStore, { revalidateKeys }] = ctx
  return createMutatorStore<BroadcastPsbtVariables, string>(async ({ data }) => {
    const txId = await broadcastPsbt(config, data.psbt)
    const addresses = connectedAccountAddresses(config)
    if (addresses.length > 0) revalidateKeys(addressesKeySelector(addresses))
    return txId
  })
}
