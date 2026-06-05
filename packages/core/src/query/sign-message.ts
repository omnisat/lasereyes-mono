/**
 * `signMessage` write mutation. One file, one action.
 *
 * @remarks
 * Returns a nanoquery `MutatorStore`: `.mutate({ message })` returns the
 * signature string. Signing a message touches no chain state, so this mutation
 * performs **no invalidation** — it exists for the uniform loading/error surface
 * the read/write stores share, not for cache effects.
 *
 * @module query/sign-message
 */

import type { MutatorStore } from '@nanostores/query'
import { signMessage } from '../actions'
import type { LaserEyesConfig } from '../config'
import { defaultQueryContext, type QueryContext } from './context'

/** Optional signing options (`address`, `protocol`). */
type SignMessageOptions = Parameters<typeof signMessage>[2]

/** `.mutate()` argument for {@link signMessageMutation}. */
export interface SignMessageVariables {
  /** Message to sign. */
  message: string
  /** Optional signing options. */
  options?: SignMessageOptions
}

/**
 * Mutator store wrapping {@link signMessage}. No cache invalidation (signing a
 * message is side-effect-free on chain).
 *
 * @param config - The LaserEyes config.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $sign = signMessageMutation(config)
 * const signature = await $sign.mutate({ message: 'hello' })
 * ```
 */
export function signMessageMutation(
  config: LaserEyesConfig,
  ctx: QueryContext = defaultQueryContext
): MutatorStore<SignMessageVariables, string> {
  const [, createMutatorStore] = ctx
  return createMutatorStore<SignMessageVariables, string>(async ({ data }) =>
    signMessage(config, data.message, data.options)
  )
}
