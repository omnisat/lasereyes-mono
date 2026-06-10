'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import {
  type BroadcastTransactionVariables,
  broadcastTransactionMutation,
} from '@omnisat/lasereyes-core/query'
import { useMutatorStore } from '../internal/use-mutator-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { MutationHookOptions, ResolvedRegister } from '../types'

/**
 * Broadcast an already-signed raw transaction.
 *
 * @remarks
 * On success the shared cache revalidates the connected account's reads. `data`
 * is the broadcast txid. `status === 'success'` proves `data`/`txId`.
 *
 * @param options - Optional `{ config }` / `{ queryContext }` overrides.
 *
 * @example
 * ```tsx
 * const { broadcastTransactionAsync } = useBroadcastTransaction()
 * const txId = await broadcastTransactionAsync({ rawTx })
 * ```
 */
export function useBroadcastTransaction<
  config extends LaserEyesConfig = ResolvedRegister['config'],
>(options?: MutationHookOptions<config>) {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const m = useMutatorStore(() => broadcastTransactionMutation(config, ctx), [config, ctx])
  return Object.assign(m, {
    /** Broadcast, fire-and-forget. Alias of `mutate`. */
    broadcastTransaction: (args: BroadcastTransactionVariables) => m.mutate(args),
    /** Broadcast and await the txid. Alias of `mutateAsync`. */
    broadcastTransactionAsync: (args: BroadcastTransactionVariables) => m.mutateAsync(args),
    /** The last broadcast txid. Alias of `data`. */
    txId: m.data,
  })
}
