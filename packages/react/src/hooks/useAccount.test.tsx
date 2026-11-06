import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { connectAccount, makeConfig, PAYMENT, wrapper } from '../test-utils'
import { useAccount } from './useAccount'

describe('useAccount', () => {
  it('reports disconnected by default', () => {
    const config = makeConfig()
    const { result } = renderHook(() => useAccount(), { wrapper: wrapper(config) })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.isDisconnected).toBe(true)
    expect(result.current.paymentAddress).toBeUndefined()
    expect(result.current.addresses).toEqual([])
  })

  it('surfaces the connected account and derived addresses', () => {
    const config = makeConfig()
    const { result } = renderHook(() => useAccount(), { wrapper: wrapper(config) })

    act(() => connectAccount(config))

    expect(result.current.isConnected).toBe(true)
    expect(result.current.status).toBe('connected')
    expect(result.current.paymentAddress).toBe(PAYMENT)
    expect(result.current.address).toBe(PAYMENT)
    expect(result.current.networkId).toBe('mainnet')
    expect(result.current.connector?.id).toBe('unisat')
    expect(result.current.publicKey).toMatch(/^02/)
  })
})
