/**
 * Cross-action invalidation / revalidation helpers.
 *
 * @remarks
 * The "same-key → refresh" reactivity channel (wagmi's
 * `queryClient.invalidateQueries`). Two flavours, mirroring nanoquery's two
 * cache verbs:
 *
 * - **invalidate** drops the cached value, so a mounted store flips to
 *   `loading` while it refetches. Right when the old value is known-wrong and
 *   must not be shown.
 * - **revalidate** refetches in the background while still serving the stale
 *   value (no loading flash). Right after a write, where the prior balance is a
 *   fine placeholder until the fresh one lands. The write-mutation modules
 *   prefer this.
 *
 * Selectors here are reused by both the mutators (revalidate the addresses a
 * write touched) and the standalone {@link invalidateAddress} escape hatch.
 *
 * @module query/invalidate
 */

import type { LaserEyesConfig } from '../config'
import { defaultQueryContext, type QueryContext, SEP } from './context'

/**
 * Key selector matching every cached read for `address` (balance, utxos, …).
 * The `${SEP}${address}` match is precise because addresses are
 * delimiter-bounded in every key built by the `getXxxQueryKey` helpers.
 */
export function addressKeySelector(address: string): (key: string) => boolean {
  return key => key.includes(`${SEP}${address}`)
}

/**
 * Key selector matching every cached read for any address in `addresses`.
 * Empty input matches nothing. Use to target exactly the addresses a write
 * touched, rather than the whole account.
 */
export function addressesKeySelector(addresses: readonly string[]): (key: string) => boolean {
  return key => addresses.some(addr => key.includes(`${SEP}${addr}`))
}

/**
 * Invalidate every cached read for one address (balance, utxos, …), forcing a
 * refetch in any subscribed store.
 *
 * @param address - The address whose cached reads should be dropped.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 */
export function invalidateAddress(address: string, ctx: QueryContext = defaultQueryContext): void {
  const [, , { invalidateKeys }] = ctx
  invalidateKeys(addressKeySelector(address))
}

/**
 * The currently-connected account's addresses (payment, ordinals, …), or `[]`
 * when disconnected. The broad fallback for writes that can't name the exact
 * addresses they touched (e.g. a broadcast PSBT whose inputs aren't parsed).
 *
 * @param config - The LaserEyes config whose connection state is inspected.
 */
export function connectedAccountAddresses(config: LaserEyesConfig): string[] {
  const conn = config.state.$connection.get()
  if (conn.status !== 'connected') return []
  return conn.account.addresses.map(a => a.address)
}
