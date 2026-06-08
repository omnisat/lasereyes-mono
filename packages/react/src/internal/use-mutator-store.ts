'use client'

import { useStore } from '@nanostores/react'
import type { MutatorStore } from '@omnisat/lasereyes-core/query'
import { type DependencyList, useMemo } from 'react'

/** Lifecycle of a mutation. */
export type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Discriminated result shape every write hook returns.
 *
 * @remarks
 * Discriminated on `status`: a `status === 'success'` check proves `data` (the
 * result, e.g. a txid) is present, and `status === 'error'` proves `error` is.
 * `mutate` / `mutateAsync` are available on every branch. `isLoading` is the
 * single in-flight flag (mutations have no background-refetch state, so there's
 * no separate `isFetching`).
 */
export type MutationResult<Data, Result, E = Error> = {
  /** Run the mutation, fire-and-forget. Errors surface on {@link MutationResult.error}. */
  mutate: (data: Data) => void
  /** Run the mutation and await the result (throws on failure). */
  mutateAsync: (data: Data) => Promise<Result>
} & (
  | {
      status: 'idle'
      data: undefined
      error: undefined
      isIdle: true
      isLoading: false
      isSuccess: false
      isError: false
    }
  | {
      status: 'loading'
      data: undefined
      error: undefined
      isIdle: false
      isLoading: true
      isSuccess: false
      isError: false
    }
  | {
      status: 'success'
      data: Result
      error: undefined
      isIdle: false
      isLoading: false
      isSuccess: true
      isError: false
    }
  | {
      status: 'error'
      data: undefined
      error: E
      isIdle: false
      isLoading: false
      isSuccess: false
      isError: true
    }
)

/**
 * Bridge a `@nanostores/query` MutatorStore to React.
 *
 * @remarks
 * One MutatorStore per hook instance (memoized by `deps`, usually `[config,
 * ctx]`). This matters: nanoquery's `throttleCalls` defaults true and drops a
 * `.mutate()` issued while the same store is still loading — so a fresh store
 * per hook instance gives natural double-submit protection without sharing
 * in-flight state across unrelated callers.
 *
 * @param makeStore - Builds the MutatorStore (e.g. `() => sendBtcMutation(...)`).
 * @param deps - Identity deps for the store (typically `[config, ctx]`).
 */
export function useMutatorStore<Data, Result, E = Error>(
  makeStore: () => MutatorStore<Data, Result, E>,
  deps: DependencyList
): MutationResult<Data, Result, E> {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps identify the store by design
  const $store = useMemo(makeStore, deps)
  const value = useStore($store)
  const mutateAsync = (data: Data): Promise<Result> =>
    (value.mutate as (d: Data) => Promise<Result>)(data)
  const mutate = (data: Data): void => {
    void mutateAsync(data)
  }
  const base = { mutate, mutateAsync }

  const data = value.data
  const error = value.error
  const isLoading = value.loading ?? false

  if (error !== undefined) {
    return {
      ...base,
      status: 'error',
      data: undefined,
      error,
      isIdle: false,
      isLoading: false,
      isSuccess: false,
      isError: true,
    }
  }
  if (isLoading) {
    return {
      ...base,
      status: 'loading',
      data: undefined,
      error: undefined,
      isIdle: false,
      isLoading: true,
      isSuccess: false,
      isError: false,
    }
  }
  if (data !== undefined) {
    return {
      ...base,
      status: 'success',
      data,
      error: undefined,
      isIdle: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    }
  }
  return {
    ...base,
    status: 'idle',
    data: undefined,
    error: undefined,
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    isError: false,
  }
}
