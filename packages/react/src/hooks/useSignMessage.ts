'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { type SignMessageVariables, signMessageMutation } from '@omnisat/lasereyes-core/query'
import { useMutatorStore } from '../internal/use-mutator-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { MutationHookOptions, ResolvedRegister } from '../types'

/**
 * Sign an arbitrary message.
 *
 * @remarks
 * Side-effect-free on chain, so no cache revalidation. `data` is the signature
 * string. `status === 'success'` proves `data` is present.
 *
 * @param options - Optional `{ config }` / `{ queryContext }` overrides.
 *
 * @example
 * ```tsx
 * const { signMessageAsync } = useSignMessage()
 * const sig = await signMessageAsync({ message: 'hello' })
 * ```
 */
export function useSignMessage<config extends LaserEyesConfig = ResolvedRegister['config']>(
  options?: MutationHookOptions<config>
) {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const m = useMutatorStore(() => signMessageMutation(config, ctx), [config, ctx])
  return Object.assign(m, {
    /** Sign, fire-and-forget. Alias of `mutate`. */
    signMessage: (args: SignMessageVariables) => m.mutate(args),
    /** Sign and await the signature string. Alias of `mutateAsync`. */
    signMessageAsync: (args: SignMessageVariables) => m.mutateAsync(args),
  })
}
