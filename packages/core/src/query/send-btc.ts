/**
 * `sendBtc` write mutation. One file, one action.
 *
 * @remarks
 * The write-side mirror of the per-action read modules: where `getXxxQuery`
 * returns a nanoquery `FetcherStore`, this returns a `MutatorStore`. Call
 * `.mutate({ to, amount })` to perform the send; the store tracks
 * `loading`/`error` like the read stores track `loading`/`data`.
 *
 * On success it **revalidates only the addresses the send touched** — the
 * spending payment address (UTXOs spent, change returned) and the recipient
 * (if the app happens to track it) — rather than the whole account. Revalidate
 * (not invalidate) so subscribers keep showing the prior balance while the
 * fresh one fetches in the background, no loading flash (wagmi's
 * `useSendTransaction` → targeted refetch).
 *
 * @module query/send-btc
 */

import type { MutatorStore } from '@nanostores/query'
import { sendBtc } from '../actions'
import type { LaserEyesConfig } from '../config'
import { defaultQueryContext, type QueryContext } from './context'
import { addressesKeySelector } from './invalidate'

/** Optional `sendBtc` parameters, less the positional `to`/`amount`. */
type SendBtcOptions = Parameters<typeof sendBtc>[3]

/** `.mutate()` argument for {@link sendBtcMutation}. */
export interface SendBtcVariables {
  /** Recipient Bitcoin address. */
  to: string
  /** Amount in satoshis. */
  amount: number
  /** Optional parameters (e.g. fee rate). */
  options?: SendBtcOptions
}

/**
 * Mutator store wrapping {@link sendBtc}. On a successful send it revalidates the
 * cached reads of the addresses the send touched (payment source + recipient);
 * the txid is returned and surfaced as the store's `data`.
 *
 * @param config - The LaserEyes config.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext} (the same
 *   cache the read stores serve from — pass a custom one only when the reads
 *   share it too).
 *
 * @example
 * ```ts
 * const $send = sendBtcMutation(config)
 * const txId = await $send.mutate({ to: 'bc1q…', amount: 10_000 })
 * ```
 */
export function sendBtcMutation(
  config: LaserEyesConfig,
  ctx: QueryContext = defaultQueryContext
): MutatorStore<SendBtcVariables, string> {
  const [, createMutatorStore, { revalidateKeys }] = ctx
  return createMutatorStore<SendBtcVariables, string>(async ({ data }) => {
    const txId = await sendBtc(config, data.to, data.amount, data.options)
    // Exactly the addresses involved: the spending payment address (UTXOs +
    // change) and the recipient. Revalidating a key with no cached/subscribed
    // store is a harmless no-op, so listing the recipient unconditionally is safe.
    const conn = config.state.$connection.get()
    const involved =
      conn.status === 'connected' ? [conn.account.getAddress('payment'), data.to] : [data.to]
    revalidateKeys(addressesKeySelector(involved))
    return txId
  })
}
