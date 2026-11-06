'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { type SignPsbtVariables, signPsbtMutation } from '@omnisat/lasereyes-core/query'
import { useMutatorStore } from '../internal/use-mutator-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { MutationHookOptions, ResolvedRegister } from '../types'

/**
 * Sign (and optionally finalize/broadcast) a PSBT.
 *
 * @remarks
 * `data` is the `SignedPsbt` result (`psbtHex`/`psbtBase64`, plus `txId`/`txHex`
 * when broadcast). If the result was broadcast, the shared cache revalidates the
 * connected account's reads. `status === 'success'` proves `data` is present.
 *
 * @param options - Optional `{ config }` / `{ queryContext }` overrides.
 *
 * @example
 * ```tsx
 * const { signPsbtAsync } = useSignPsbt()
 * const signed = await signPsbtAsync({ psbt, options: { finalize: true, broadcast: true } })
 * ```
 */
export function useSignPsbt<config extends LaserEyesConfig = ResolvedRegister['config']>(
  options?: MutationHookOptions<config>
) {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const m = useMutatorStore(() => signPsbtMutation(config, ctx), [config, ctx])
  return Object.assign(m, {
    /** Sign, fire-and-forget. Alias of `mutate`. */
    signPsbt: (args: SignPsbtVariables) => m.mutate(args),
    /** Sign and await the `SignedPsbt`. Alias of `mutateAsync`. */
    signPsbtAsync: (args: SignPsbtVariables) => m.mutateAsync(args),
  })
}
