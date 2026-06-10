import * as query from '@omnisat/lasereyes-core/query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { map } from 'nanostores'
import { describe, expect, it, vi } from 'vitest'
import { makeConfig, wrapper } from '../test-utils'
import { useUtxos } from './useUtxos'

vi.mock('@omnisat/lasereyes-core/query', async orig => ({
  ...(await orig<typeof query>()),
  getAddressUtxosQuery: vi.fn(),
}))

// Two pages: page 1 (cursor undefined) → one utxo + nextCursor 'c1';
// page 2 (cursor 'c1') → one utxo + no nextCursor (last page).
const page1 = map<{ data?: unknown; loading: boolean }>({
  data: { data: [{ value: 1 }], nextCursor: 'c1' },
  loading: false,
})
const page2 = map<{ data?: unknown; loading: boolean }>({
  data: { data: [{ value: 2 }], nextCursor: undefined },
  loading: false,
})
const idle = map<{ data?: unknown; loading: boolean }>({ loading: false })

describe('useUtxos (paginating)', () => {
  it('loads the first page, then accumulates the next on fetchNextPage', async () => {
    const config = makeConfig()
    vi.mocked(query.getAddressUtxosQuery).mockImplementation((_config, _addr, _ctx, opts) => {
      if (!opts?.enabled) return idle as never
      return (opts.cursor === 'c1' ? page2 : page1) as never
    })

    const { result } = renderHook(() => useUtxos('bc1qx', { limit: 10 }), {
      wrapper: wrapper(config),
    })

    // First page accumulated.
    await waitFor(() => expect(result.current.items).toHaveLength(1))
    expect(result.current.status).toBe('success')
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.isFetchingNextPage).toBe(false)

    // Load the next page → items accumulate, last page clears hasNextPage.
    act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.items).toHaveLength(2))
    expect(result.current.items).toEqual([{ value: 1 }, { value: 2 }])
    expect(result.current.hasNextPage).toBe(false)
  })

  it('auto-revalidates accumulated pages when a page store updates (no refetch)', async () => {
    const config = makeConfig()
    // Local stores so mutating below doesn't leak into the shared fixtures.
    const live = map<{ data?: unknown; loading: boolean }>({
      data: { data: [{ value: 1 }], nextCursor: undefined },
      loading: false,
    })
    const idleLocal = map<{ data?: unknown; loading: boolean }>({ loading: false })
    vi.mocked(query.getAddressUtxosQuery).mockImplementation(
      (_config, _addr, _ctx, opts) => (opts?.enabled ? live : idleLocal) as never
    )

    const { result } = renderHook(() => useUtxos('bc1qx', { limit: 10 }), {
      wrapper: wrapper(config),
    })
    await waitFor(() => expect(result.current.items).toEqual([{ value: 1 }]))

    // A background revalidation updates the still-subscribed page store →
    // items refresh with no manual refetch().
    act(() => {
      live.set({ data: { data: [{ value: 7 }], nextCursor: undefined }, loading: false })
    })
    await waitFor(() => expect(result.current.items).toEqual([{ value: 7 }]))
  })

  it('refetch() re-accumulates from page one', async () => {
    const config = makeConfig()
    vi.mocked(query.getAddressUtxosQuery).mockImplementation((_config, _addr, _ctx, opts) => {
      if (!opts?.enabled) return idle as never
      return (opts.cursor === 'c1' ? page2 : page1) as never
    })

    const { result } = renderHook(() => useUtxos('bc1qx', { limit: 10 }), {
      wrapper: wrapper(config),
    })
    await waitFor(() => expect(result.current.items).toHaveLength(1))
    act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.items).toHaveLength(2))

    // refetch drops the accumulation and re-reads from page one.
    act(() => result.current.refetch())
    await waitFor(() => expect(result.current.items).toHaveLength(1))
    expect(result.current.hasNextPage).toBe(true)
  })

  it('forwards limit + cursor into the query builder', async () => {
    const config = makeConfig()
    vi.mocked(query.getAddressUtxosQuery).mockImplementation((_config, _addr, _ctx, opts) => {
      if (!opts?.enabled) return idle as never
      return (opts.cursor === 'c1' ? page2 : page1) as never
    })

    const { result } = renderHook(() => useUtxos('bc1qx', { limit: 10 }), {
      wrapper: wrapper(config),
    })
    await waitFor(() => expect(result.current.items).toHaveLength(1))

    // First page: cursor undefined, limit threaded.
    expect(query.getAddressUtxosQuery).toHaveBeenCalledWith(
      config,
      'bc1qx',
      expect.anything(),
      expect.objectContaining({ cursor: undefined, limit: 10, enabled: true })
    )

    act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.items).toHaveLength(2))

    // Second page: cursor 'c1' from page 1's nextCursor.
    expect(query.getAddressUtxosQuery).toHaveBeenCalledWith(
      config,
      'bc1qx',
      expect.anything(),
      expect.objectContaining({ cursor: 'c1', limit: 10, enabled: true })
    )
  })
})
