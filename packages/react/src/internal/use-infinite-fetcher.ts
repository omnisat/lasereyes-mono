'use client'

import { useStore } from '@nanostores/react'
import type { FetcherStore } from '@omnisat/lasereyes-core/query'
import { computed } from 'nanostores'
import { type DependencyList, useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * The page shape this primitive accumulates — structurally the client's
 * `PaginatedResult<Item>`, redeclared here so the React package needs no direct
 * client dependency.
 */
export interface InfinitePage<Item> {
  /** Items in this page. */
  data: Item[]
  /** Cursor for the next page, or `undefined` when this is the last page. */
  nextCursor?: string | number
}

/** Lifecycle of an accumulating read. */
export type InfiniteStatus = 'idle' | 'loading' | 'success' | 'error'

/** The `@nanostores/query` fetcher-value shape for one page's store. */
interface PageValue<Item, E> {
  data?: InfinitePage<Item>
  loading?: boolean
  error?: E
}

/** Result shape returned by {@link useInfiniteFetcher} and the paginated hooks. */
export interface InfiniteResult<Item, E = Error> {
  /** All items across the pages loaded so far, flattened in order. */
  items: Item[]
  /** The raw pages loaded so far. */
  pages: InfinitePage<Item>[]
  /** Lifecycle status (driven by the first page until one lands). */
  status: InfiniteStatus
  isIdle: boolean
  /** True while the **first** page is in flight (no data yet). */
  isLoading: boolean
  /** True while **any** page is fetching, including a background revalidation. */
  isFetching: boolean
  /** True while a **subsequent** page (via {@link InfiniteResult.fetchNextPage}) is in flight. */
  isFetchingNextPage: boolean
  isSuccess: boolean
  isError: boolean
  /** The last fetch error, if any. */
  error: E | undefined
  /** `true` when the last loaded page reported a `nextCursor`. */
  hasNextPage: boolean
  /** Load the next page (no-op when {@link InfiniteResult.hasNextPage} is false or already loading). */
  fetchNextPage: () => void
  /** Collapse back to the first page and re-accumulate. */
  refetch: () => void
}

/**
 * Accumulate a cursor-paginated `FetcherStore` into an infinite-query result.
 *
 * @remarks
 * nanoquery has no infinite-query primitive, so this bridges the gap: it tracks
 * the **list of page cursors** loaded so far, builds one store per cursor, and
 * combines them into a single derived store via `computed`. Because every page's
 * store stays subscribed (through the combined store), the accumulated `items`
 * **auto-revalidate** exactly like a single-store read — a write that revalidates
 * the address's keys refreshes the whole list with no manual `refetch()`.
 *
 * `fetchNextPage` appends the last page's `nextCursor` to the list (one more
 * subscribed store); `refetch` collapses back to the first page.
 *
 * Reuse it for any paginated read (utxos today; inscriptions/runes/brc20 when
 * those land) by passing a `makeStore` that forwards the cursor into the
 * matching `getXxxQuery` builder.
 *
 * @param makeStore - Builds the page store for a given cursor. `enabled` is the
 *   master gate — forward it to the builder so a paused list never fetches.
 * @param deps - Query identity (config, ctx, address, chainId, limit). A change
 *   resets the accumulation to page one.
 * @param options.enabled - Master gate; when `false` no page fetches.
 */
export function useInfiniteFetcher<Item, E = Error>(
  makeStore: (params: {
    cursor: string | number | undefined
    enabled: boolean
  }) => FetcherStore<InfinitePage<Item>, E>,
  deps: DependencyList,
  options?: { enabled?: boolean }
): InfiniteResult<Item, E> {
  const userEnabled = options?.enabled !== false
  // The cursors identifying each page; page one's cursor is `undefined`.
  const [cursors, setCursors] = useState<(string | number | undefined)[]>([undefined])
  const cursorsKey = cursors.map(c => String(c ?? '')).join('|')

  // Collapse to page one. Used on query-identity change and by `refetch`.
  const reset = useCallback(() => setCursors([undefined]), [])
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps ARE the query identity
  useEffect(reset, deps)

  // One combined store over every page's store — so ALL pages stay subscribed
  // and a write's revalidation refreshes the accumulated items automatically.
  // Re-created only when the page set or query identity changes (cursorsKey);
  // same-key page stores hit nanoquery's cache, so this never re-fetches a page
  // that's already cached.
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps + cursorsKey + userEnabled identify the page set
  const $combined = useMemo(() => {
    const stores = cursors.map(cursor => makeStore({ cursor, enabled: userEnabled }))
    return computed(stores, (...values) => values as PageValue<Item, E>[])
  }, [...deps, cursorsKey, userEnabled])

  const pageValues = useStore($combined) as PageValue<Item, E>[]

  const items = useMemo(() => pageValues.flatMap(v => v.data?.data ?? []), [pageValues])
  const pages = useMemo(
    () => pageValues.map(v => v.data).filter((p): p is InfinitePage<Item> => p !== undefined),
    [pageValues]
  )

  const last = pageValues[pageValues.length - 1]
  const anyData = pageValues.some(v => v.data !== undefined)
  const anyLoading = pageValues.some(v => v.loading)
  const error = pageValues.find(v => v.error !== undefined)?.error
  const hasNextPage = last?.data?.nextCursor !== undefined

  // Capture the live next cursor so `fetchNextPage` reads it without a stale closure.
  const nextCursorRef = useRef<string | number | undefined>(undefined)
  nextCursorRef.current = last?.data?.nextCursor

  const fetchNextPage = useCallback(() => {
    const nc = nextCursorRef.current
    if (nc === undefined) return
    setCursors(prev => (prev[prev.length - 1] === nc ? prev : [...prev, nc]))
  }, [])

  const isFetching = anyLoading
  const isLoading = !anyData && anyLoading && error === undefined
  // A freshly-appended page is loading with no data yet (distinct from a
  // background revalidation, where the tail page keeps its data).
  const isFetchingNextPage =
    pageValues.length > 1 && (last?.loading ?? false) && last?.data === undefined

  let status: InfiniteStatus
  if (error !== undefined) status = 'error'
  else if (anyData) status = 'success'
  else if (isLoading) status = 'loading'
  else status = 'idle'

  return {
    items,
    pages,
    status,
    isIdle: status === 'idle',
    isLoading,
    isFetching,
    isFetchingNextPage,
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    hasNextPage,
    fetchNextPage,
    refetch: reset,
  }
}
