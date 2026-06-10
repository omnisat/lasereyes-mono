'use client'

import { useStore } from '@nanostores/react'
import type { FetcherStore } from '@omnisat/lasereyes-core/query'
import { type DependencyList, useCallback, useMemo } from 'react'

/** Lifecycle of a read. */
export type QueryStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Discriminated result shape every read hook returns.
 *
 * @remarks
 * Discriminated on `status`, so a `status === 'success'` check **proves**
 * `data` is present (no `T | undefined`) and `status === 'error'` proves
 * `error` is present.
 *
 * Two fetch booleans, TanStack-style:
 * - **`isLoading`** — the *first* load, with no data yet (`status === 'loading'`).
 * - **`isFetching`** — *any* fetch in flight, including a background revalidation
 *   while `status === 'success'`. Use this to show a subtle "refreshing" spinner
 *   without hiding the stale data.
 */
export type QueryResult<T, E = Error> =
  | {
      status: 'idle'
      data: undefined
      error: undefined
      isFetching: false
      isIdle: true
      isLoading: false
      isSuccess: false
      isError: false
      /** Force a background revalidation of this read (keeps current data). */
      refetch: () => void
    }
  | {
      status: 'loading'
      data: T | undefined
      error: undefined
      isFetching: true
      isIdle: false
      isLoading: true
      isSuccess: false
      isError: false
      refetch: () => void
    }
  | {
      status: 'success'
      data: T
      error: undefined
      isFetching: boolean
      isIdle: false
      isLoading: false
      isSuccess: true
      isError: false
      refetch: () => void
    }
  | {
      status: 'error'
      data: T | undefined
      error: E
      isFetching: false
      isIdle: false
      isLoading: false
      isSuccess: false
      isError: true
      refetch: () => void
    }

/**
 * Bridge a query FetcherStore to React.
 *
 * @remarks
 * The store is created **once per `deps` change** via `useMemo` — a FetcherStore
 * must not be rebuilt every render (that would churn subscriptions and defeat
 * the cache). `deps` are the query arguments (config, ctx, address, …): change
 * the args → new store keyed to the new query; keep them → the same store, so
 * the cached result is reused.
 *
 * @param makeStore - Builds the FetcherStore (e.g. `() => getAddressBalanceQuery(...)`).
 * @param deps - The query args that identify the store; rebuild on change.
 */
export function useFetcherStore<T, E = Error>(
  makeStore: () => FetcherStore<T, E>,
  deps: DependencyList
): QueryResult<T, E> {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps ARE the query args by design
  const $store = useMemo(makeStore, deps)
  const value = useStore($store)
  const refetch = useCallback(() => $store.revalidate(), [$store])

  const data = value.data
  const error = value.error
  const isFetching = value.loading ?? false

  if (error !== undefined) {
    return {
      status: 'error',
      data,
      error,
      isFetching: false,
      isIdle: false,
      isLoading: false,
      isSuccess: false,
      isError: true,
      refetch,
    }
  }
  if (data !== undefined) {
    return {
      status: 'success',
      data,
      error: undefined,
      isFetching,
      isIdle: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch,
    }
  }
  if (isFetching) {
    return {
      status: 'loading',
      data: undefined,
      error: undefined,
      isFetching: true,
      isIdle: false,
      isLoading: true,
      isSuccess: false,
      isError: false,
      refetch,
    }
  }
  return {
    status: 'idle',
    data: undefined,
    error: undefined,
    isFetching: false,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    isError: false,
    refetch,
  }
}
