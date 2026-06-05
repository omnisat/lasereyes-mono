/**
 * Structural sharing — `replaceEqualDeep`.
 *
 * @remarks
 * Vendored from TanStack Query (MIT). wagmi re-exports this same function as
 * `structuralSharing`; nanoquery has no equivalent, so we apply it inside our
 * fetchers. It walks the new result against the previous one and returns the
 * **old reference** for any sub-tree that's deep-equal, so consumers selecting
 * `.data` (or sub-paths of it) keep a stable identity across refetches and
 * don't re-render / recompute when the data hasn't actually changed.
 *
 * Note: nanoquery still emits a fresh `FetcherValue` wrapper on each settle, so
 * a bare `useStore($store)` re-renders regardless; the win is for consumers
 * that derive from / memoize on `data` (or its nested arrays like a UTXO set).
 *
 * @see https://github.com/TanStack/query — `replaceEqualDeep`
 * @module query/structural-sharing
 */

import type { FetcherStore } from '@nanostores/query'

function hasObjectPrototype(o: unknown): boolean {
  return Object.prototype.toString.call(o) === '[object Object]'
}

// Helpers return plain `boolean` (not type predicates) so `a`/`b` stay `any`
// inside replaceEqualDeep and index access type-checks — matching TanStack.
function isPlainArray(value: unknown): boolean {
  return Array.isArray(value) && value.length === Object.keys(value).length
}

function isPlainObject(o: unknown): boolean {
  if (!hasObjectPrototype(o)) return false
  const ctor = (o as { constructor?: unknown }).constructor
  if (ctor === undefined) return true
  const prot = (ctor as { prototype?: unknown }).prototype
  if (!hasObjectPrototype(prot)) return false
  // ES2020/biome-safe equivalent of `hasOwnProperty.call(prot, 'isPrototypeOf')`.
  if (!('isPrototypeOf' in (prot as object))) return false
  if (Object.getPrototypeOf(o) !== Object.prototype) return false
  return true
}

/**
 * Return `b`, but reuse references from `a` for any deeply-equal sub-tree.
 * If `a` and `b` are deep-equal, returns `a` itself.
 */
export function replaceEqualDeep<T>(a: unknown, b: T): T
export function replaceEqualDeep(a: any, b: any): any {
  if (a === b) return a

  const array = isPlainArray(a) && isPlainArray(b)
  if (array || (isPlainObject(a) && isPlainObject(b))) {
    const aItems = array ? a : Object.keys(a)
    const aSize = aItems.length
    const bItems = array ? b : Object.keys(b)
    const bSize = bItems.length
    const copy: any = array ? [] : {}

    let equalItems = 0
    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i]
      if (
        ((!array && aItems.includes(key)) || array) &&
        a[key] === undefined &&
        b[key] === undefined
      ) {
        copy[key] = undefined
        equalItems++
      } else {
        copy[key] = replaceEqualDeep(a[key], b[key])
        if (copy[key] === a[key] && a[key] !== undefined) equalItems++
      }
    }

    return aSize === bSize && equalItems === aSize ? a : copy
  }

  return b
}

/**
 * Wrap a fetcher so its resolved value reuses references from the store's
 * current `data` via {@link replaceEqualDeep}. Because the store and its fetcher
 * are mutually referential, pass a thunk that returns the store (created from
 * this very fetcher).
 *
 * @example
 * ```ts
 * let $s: FetcherStore<T>
 * $s = createFetcherStore<T>(key, { fetcher: withSharedData(() => $s, () => action(config)) })
 * return $s
 * ```
 */
export function withSharedData<T>(
  store: () => FetcherStore<T>,
  fetch: () => Promise<T>
): () => Promise<T> {
  return async () => replaceEqualDeep(store().get().data, await fetch())
}
