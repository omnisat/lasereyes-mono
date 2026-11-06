'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { type SendBtcVariables, sendBtcMutation } from '@omnisat/lasereyes-core/query'
import { type MutationResult, useMutatorStore } from '../internal/use-mutator-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { MutationHookOptions, ResolvedRegister } from '../types'

/**
 * Result of {@link useSendBitcoin} — the discriminated {@link MutationResult}
 * plus send-specific aliases. `status === 'success'` proves `data`/`txId`.
 */
export type UseSendBitcoinResult = MutationResult<SendBtcVariables, string> & {
  /** Send BTC, fire-and-forget. Alias of `mutate`. */
  sendBitcoin: (args: SendBtcVariables) => void
  /** Send BTC and await the txid (throws on failure / user rejection). Alias of `mutateAsync`. */
  sendBitcoinAsync: (args: SendBtcVariables) => Promise<string>
  /** The last successful txid. Alias of `data`. */
  txId: string | undefined
}

/**
 * Send Bitcoin.
 *
 * @remarks
 * On success the shared cache revalidates the payment + recipient addresses'
 * balance/utxos, so subscribed `useBalance`/`useUtxos` refetch automatically.
 *
 * @param options - Optional `{ config }` / `{ queryContext }` overrides.
 *
 * @example
 * ```tsx
 * const { sendBitcoin, isLoading } = useSendBitcoin()
 * <button onClick={() => sendBitcoin({ to: 'bc1q…', amount: 10_000 })} disabled={isLoading}>Send</button>
 * ```
 */
export function useSendBitcoin<config extends LaserEyesConfig = ResolvedRegister['config']>(
  options?: MutationHookOptions<config>
): UseSendBitcoinResult {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const m = useMutatorStore(() => sendBtcMutation(config, ctx), [config, ctx])
  // Object.assign (not spread) so the discriminated-union intersection is
  // preserved: `{ ...m }` over a union erases the status correlation.
  return Object.assign(m, {
    sendBitcoin: m.mutate,
    sendBitcoinAsync: m.mutateAsync,
    txId: m.data,
  })
}
