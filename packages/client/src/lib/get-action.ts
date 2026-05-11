/**
 * `getAction` — override-aware action dispatch.
 *
 * @remarks
 * Ported from wagmi's `@wagmi/core/utils/getAction`. Resolves the best
 * implementation for a given action against a client:
 *
 * 1. The client's overridden method, looked up by `actionFn.name`.
 * 2. The client's overridden method, looked up by the explicit `name` arg
 *    (fallback for bundlers that strip `Function.prototype.name`).
 * 3. The tree-shakable free action function, called as `actionFn(client, …args)`.
 *
 * This gives composed actions a uniform dispatch mechanism: any internal
 * call to another action (e.g. `sendBitcoin` invoking `signPsbt`) goes
 * through `getAction`, so user overrides via `.extend()` cascade through
 * all composition layers automatically.
 *
 * The composition pattern (paraphrasing the wagmi authors): default
 * behavior comes from tree-shakable functions; client extensions are
 * **overrides**, not requirements. The compile-time "you must extend X
 * before Y" rule isn't needed — `getAction` falls back to the free
 * function if `X` hasn't been extended.
 *
 * @module lib/get-action
 *
 * @example Internal composition with override-cascade
 * ```ts
 * export async function sendBitcoin(client, params) {
 *   // If the user has overridden `signPsbt` on the client, this picks it up.
 *   // Otherwise, falls back to the imported free `signPsbt(client, …)`.
 *   const sign = getAction(client, signPsbt, 'signPsbt')
 *   const signed = await sign(psbtHex, { finalize: true })
 *   // …
 * }
 * ```
 */

/**
 * Resolve and return the best-available implementation of an action against
 * a client.
 *
 * @param client - The client to dispatch against.
 * @param actionFn - The free action function (the canonical implementation,
 *   tree-shakable). Called as `actionFn(client, …args)` if no client-side
 *   override is found.
 * @param name - The explicit action name. Used as a fallback when
 *   `actionFn.name` is unreliable (minifiers may strip or mangle function
 *   names). Always pass this explicitly at the call site to be safe.
 * @returns A function with the same call shape as `actionFn` minus the
 *   `client` parameter — `(…args) => Promise<T>`.
 */
export function getAction<
  client extends { [key: string]: unknown },
  args extends unknown[],
  returnType,
>(
  client: client,
  actionFn: (client: client, ...args: args) => returnType,
  name: string
): (...args: args) => returnType {
  const implicit = client[actionFn.name]
  if (typeof implicit === 'function') return implicit as (...args: args) => returnType

  const explicit = client[name]
  if (typeof explicit === 'function') return explicit as (...args: args) => returnType

  return (...args: args) => actionFn(client, ...args)
}
