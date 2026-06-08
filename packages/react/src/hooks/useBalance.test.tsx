import * as query from '@omnisat/lasereyes-core/query'
import { act, renderHook } from '@testing-library/react'
import { map } from 'nanostores'
import { describe, expect, it, vi } from 'vitest'
import { makeConfig, wrapper } from '../test-utils'
import { useBalance } from './useBalance'

vi.mock('@omnisat/lasereyes-core/query', async orig => ({
  ...(await orig<typeof query>()),
  getAddressBalanceQuery: vi.fn(),
}))

describe('useBalance', () => {
  it('surfaces the fetcher store value and wires refetch to revalidate', () => {
    const config = makeConfig()
    const $balance = map<{ data?: string; loading: boolean; error?: Error }>({
      data: '1000',
      loading: false,
    })
    const revalidate = vi.fn()
    ;($balance as unknown as { revalidate: () => void }).revalidate = revalidate
    vi.mocked(query.getAddressBalanceQuery).mockReturnValue($balance as never)

    const { result } = renderHook(() => useBalance('bc1qexplicit'), { wrapper: wrapper(config) })

    expect(result.current.data).toBe('1000')
    expect(result.current.isFetching).toBe(false)
    expect(result.current.error).toBeUndefined()

    act(() => result.current.refetch())
    expect(revalidate).toHaveBeenCalledTimes(1)
  })

  it('re-renders when the store updates', () => {
    const config = makeConfig()
    const $balance = map<{ data?: string; loading: boolean; error?: Error }>({ loading: true })
    vi.mocked(query.getAddressBalanceQuery).mockReturnValue($balance as never)

    const { result } = renderHook(() => useBalance('bc1qexplicit'), { wrapper: wrapper(config) })
    expect(result.current.isFetching).toBe(true)
    expect(result.current.isLoading).toBe(true)

    act(() => {
      $balance.set({ data: '5000', loading: false })
    })
    expect(result.current.data).toBe('5000')
    expect(result.current.isFetching).toBe(false)
  })

  it('discriminates status: success ⇒ data present', () => {
    const config = makeConfig()
    const $balance = map<{ data?: string; loading: boolean }>({ data: '42', loading: false })
    vi.mocked(query.getAddressBalanceQuery).mockReturnValue($balance as never)

    const { result } = renderHook(() => useBalance('bc1qx'), { wrapper: wrapper(config) })
    expect(result.current.status).toBe('success')
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data).toBe('42')
  })
})

describe('useBalance — overrides (P3/P4)', () => {
  const okStore = () => map<{ data?: string; loading: boolean }>({ data: '1', loading: false })

  it('uses an explicit { config } over the provider config', () => {
    const provider = makeConfig()
    const override = makeConfig()
    vi.mocked(query.getAddressBalanceQuery).mockReturnValue(okStore() as never)

    renderHook(() => useBalance('bc1qx', { config: override }), { wrapper: wrapper(provider) })

    expect(query.getAddressBalanceQuery).toHaveBeenCalledWith(
      override,
      'bc1qx',
      expect.anything(),
      {
        chainId: undefined,
        enabled: undefined,
      }
    )
  })

  it('threads chainId + enabled into the query builder', () => {
    const config = makeConfig()
    vi.mocked(query.getAddressBalanceQuery).mockReturnValue(okStore() as never)

    renderHook(() => useBalance('bc1qx', { chainId: 'mainnet', enabled: false }), {
      wrapper: wrapper(config),
    })

    expect(query.getAddressBalanceQuery).toHaveBeenCalledWith(config, 'bc1qx', expect.anything(), {
      chainId: 'mainnet',
      enabled: false,
    })
  })

  it('uses an explicit { queryContext } over the provider cache', () => {
    const config = makeConfig()
    const customCtx = query.createQueryContext({ cache: new Map() })
    vi.mocked(query.getAddressBalanceQuery).mockReturnValue(okStore() as never)

    renderHook(() => useBalance('bc1qx', { queryContext: customCtx }), { wrapper: wrapper(config) })

    expect(query.getAddressBalanceQuery).toHaveBeenCalledWith(
      config,
      'bc1qx',
      customCtx,
      expect.anything()
    )
  })
})
