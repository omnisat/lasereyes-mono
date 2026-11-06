'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { type BroadcastPsbtVariables, broadcastPsbtMutation } from '@omnisat/lasereyes-core/query'
import { useMutatorStore } from '../internal/use-mutator-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { MutationHookOptions, ResolvedRegister } from '../types'

/**
 * Sign+finalize a PSBT and broadcast it in one step.
 *
 * @remarks
 * On success the shared cache revalidates the connected account's reads. `data`
 * is the broadcast txid. `status === 'success'` proves `data`/`txId`.
 *
 * @param options - Optional `{ config }` / `{ queryContext }` overrides.
 *
 * @example
 * ```tsx
 * const { broadcastPsbtAsync } = useBroadcastPsbt()
 * const txId = await broadcastPsbtAsync({ psbt })
 * ```
 */
export function useBroadcastPsbt<config extends LaserEyesConfig = ResolvedRegister['config']>(
  options?: MutationHookOptions<config>
) {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const m = useMutatorStore(() => broadcastPsbtMutation(config, ctx), [config, ctx])
  return Object.assign(m, {
    /** Broadcast, fire-and-forget. Alias of `mutate`. */
    broadcastPsbt: (args: BroadcastPsbtVariables) => m.mutate(args),
    /** Broadcast and await the txid. Alias of `mutateAsync`. */
    broadcastPsbtAsync: (args: BroadcastPsbtVariables) => m.mutateAsync(args),
    /** The last broadcast txid. Alias of `data`. */
    txId: m.data,
  })
}
