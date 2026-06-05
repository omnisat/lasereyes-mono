/**
 * `signPsbt` write mutation. One file, one action.
 *
 * @remarks
 * Returns a nanoquery `MutatorStore`: `.mutate({ psbt })` signs (and optionally
 * finalizes/broadcasts) the PSBT. Signing alone changes no chain state, so the
 * cache is touched **only when the signer broadcast** — i.e. the result carries
 * a `txId`. That keeps a plain "sign for inspection" call from needlessly
 * refetching balances.
 *
 * Unlike {@link sendBtcMutation}, this can't cheaply name the addresses the
 * PSBT touched (its inputs/outputs aren't parsed here), so on broadcast it
 * revalidates the whole connected account. Still a revalidate (not invalidate)
 * to avoid a loading flash.
 *
 * @module query/sign-psbt
 */

import type { MutatorStore } from '@nanostores/query'
import { signPsbt } from '../actions'
import type { LaserEyesConfig } from '../config'
import { defaultQueryContext, type QueryContext } from './context'
import { addressesKeySelector, connectedAccountAddresses } from './invalidate'

/** Result of a sign (the wallet action's `SignedPsbt`). */
type SignPsbtResult = Awaited<ReturnType<typeof signPsbt>>
/** Optional signing options (`finalize`, `broadcast`, `inputsToSign`). */
type SignPsbtOptions = Parameters<typeof signPsbt>[2]

/** `.mutate()` argument for {@link signPsbtMutation}. */
export interface SignPsbtVariables {
  /** PSBT in hex or base64 format. */
  psbt: string
  /** Optional signing options. */
  options?: SignPsbtOptions
}

/**
 * Mutator store wrapping {@link signPsbt}. Revalidates the connected account's
 * cached reads only if the result was broadcast (`txId` present).
 *
 * @param config - The LaserEyes config.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $sign = signPsbtMutation(config)
 * const signed = await $sign.mutate({ psbt, options: { finalize: true, broadcast: true } })
 * ```
 */
export function signPsbtMutation(
  config: LaserEyesConfig,
  ctx: QueryContext = defaultQueryContext
): MutatorStore<SignPsbtVariables, SignPsbtResult> {
  const [, createMutatorStore, { revalidateKeys }] = ctx
  return createMutatorStore<SignPsbtVariables, SignPsbtResult>(async ({ data }) => {
    const result = await signPsbt(config, data.psbt, data.options)
    if (result.txId) {
      const addresses = connectedAccountAddresses(config)
      if (addresses.length > 0) revalidateKeys(addressesKeySelector(addresses))
    }
    return result
  })
}
