import * as actions from '@omnisat/lasereyes-core/actions'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { makeConfig, wrapper } from '../test-utils'
import { useConnect } from './useConnect'

vi.mock('@omnisat/lasereyes-core/actions', async orig => ({
  ...(await orig<typeof actions>()),
  connect: vi.fn(async () => ({}) as never),
}))

describe('useConnect', () => {
  it('dispatches the connect action with the connector id', async () => {
    const config = makeConfig()
    const { result } = renderHook(() => useConnect(), { wrapper: wrapper(config) })

    expect(result.current.isPending).toBe(false)
    await act(async () => {
      await result.current.connect('unisat')
    })

    expect(actions.connect).toHaveBeenCalledWith(config, { connectorId: 'unisat' })
  })

  it('captures a connect error', async () => {
    const config = makeConfig()
    vi.mocked(actions.connect).mockRejectedValueOnce(new Error('user rejected'))
    const { result } = renderHook(() => useConnect(), { wrapper: wrapper(config) })

    await act(async () => {
      await expect(result.current.connect('unisat')).rejects.toThrow('user rejected')
    })

    expect(result.current.error?.message).toBe('user rejected')
  })
})
