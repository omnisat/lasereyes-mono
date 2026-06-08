import * as query from '@omnisat/lasereyes-core/query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { map } from 'nanostores'
import { describe, expect, it, vi } from 'vitest'
import { makeConfig, wrapper } from '../test-utils'
import { useSendBitcoin } from './useSendBitcoin'

vi.mock('@omnisat/lasereyes-core/query', async orig => ({
  ...(await orig<typeof query>()),
  sendBtcMutation: vi.fn(),
}))

describe('useSendBitcoin', () => {
  it('calls the mutator with the variables and returns the txid', async () => {
    const config = makeConfig()
    const mutate = vi.fn(async () => 'txid-xyz')
    const $m = map<{ mutate: typeof mutate; data?: string; loading: boolean; error?: Error }>({
      mutate,
      loading: false,
    })
    vi.mocked(query.sendBtcMutation).mockReturnValue($m as never)

    const { result } = renderHook(() => useSendBitcoin(), { wrapper: wrapper(config) })

    let txId: string | undefined
    await act(async () => {
      txId = await result.current.sendBitcoinAsync({ to: 'bc1qdest', amount: 10_000 })
    })

    expect(mutate).toHaveBeenCalledWith({ to: 'bc1qdest', amount: 10_000 })
    expect(txId).toBe('txid-xyz')
  })

  it('reflects the mutator store data/loading state', async () => {
    const config = makeConfig()
    const $m = map<{ mutate: () => Promise<string>; data?: string; loading: boolean }>({
      mutate: async () => 'tx',
      loading: false,
    })
    vi.mocked(query.sendBtcMutation).mockReturnValue($m as never)

    const { result } = renderHook(() => useSendBitcoin(), { wrapper: wrapper(config) })
    expect(result.current.txId).toBeUndefined()

    act(() => {
      $m.setKey('data', 'tx-final')
    })
    await waitFor(() => expect(result.current.txId).toBe('tx-final'))
  })
})
