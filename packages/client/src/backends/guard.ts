/**
 * Runtime capability guard for chain backends.
 *
 * @remarks
 * A backend is a plain object of registered capability methods, so calling a
 * capability it doesn't provide (e.g. `runesGetAddressBalances` on a base-only
 * backend) would otherwise blow up as a cryptic
 * `undefined is not a function`. {@link guardBackend} wraps the backend in a
 * `Proxy` that, for an *unregistered capability-shaped* method, returns a
 * thrower so the call fails with a clear {@link CapabilityNotFoundError}.
 *
 * The guard is deliberately conservative: it only fires for keys that look
 * like a capability method (a known domain prefix) **and** aren't registered.
 * Framework / JS probes — `then`, `toJSON`, `asymmetricMatch`, symbols,
 * inherited members, etc. — don't match a capability prefix, so they pass
 * straight through and never trip it.
 *
 * @module backend/guard
 */

import { CapabilityNotFoundError } from '../errors'

/**
 * Method-name prefixes that identify a capability domain, mapped to the
 * capability *group* name used in {@link CapabilityNotFoundError}. Order
 * doesn't matter — prefixes are disjoint. `'rune'` also covers `'runes…'`,
 * `'alkane'` covers `'alkanes…'`.
 */
const CAPABILITY_GROUPS: ReadonlyArray<readonly [prefix: string, group: string]> = [
  ['rune', 'rune'],
  ['inscription', 'inscription'],
  ['alkane', 'alkane'],
  ['brc20', 'brc20'],
  ['ord', 'ord'],
  ['btc', 'base'],
]

/** The capability group a method name belongs to, or `undefined` if the name
 * isn't capability-shaped (so the guard should ignore it). */
function capabilityGroupOf(method: string): string | undefined {
  for (const [prefix, group] of CAPABILITY_GROUPS) {
    if (method.startsWith(prefix)) return group
  }
  return undefined
}

/**
 * Wrap a backend so that calling an unregistered capability method throws a
 * clear {@link CapabilityNotFoundError} instead of `undefined is not a function`.
 *
 * @param backend - The freshly-built backend object.
 * @returns A proxy with identical behaviour for everything that exists, plus
 *   the capability guard for what doesn't.
 */
export function guardBackend<T extends object>(backend: T): T {
  return new Proxy(backend, {
    get(target, key, receiver) {
      // Existing members (incl. `network`/`getCapabilities`/`extend`,
      // registered methods, and inherited props) and symbols pass through.
      if (typeof key !== 'string' || key in target) {
        return Reflect.get(target, key, receiver)
      }
      const group = capabilityGroupOf(key)
      // Not capability-shaped (`then`, `toJSON`, framework probes, …) → behave
      // like the plain object would (return `undefined`).
      if (group === undefined) return Reflect.get(target, key, receiver)
      // A capability method this backend doesn't provide: fail clearly when
      // called (a thrower, not throw-on-read, so inspection stays safe).
      return () => {
        throw new CapabilityNotFoundError(group, key)
      }
    },
  })
}
