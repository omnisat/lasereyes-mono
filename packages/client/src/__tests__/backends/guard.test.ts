/**
 * Tests for the backend capability guard — a missing capability method must
 * fail with a clear {@link CapabilityNotFoundError}, not `undefined is not a
 * function`, while framework/JS probes pass through untouched.
 */

import { describe, expect, it } from 'vitest'
import { createChainBackend } from '../../backends/primitives'
import { MAINNET } from '../../chains'
import { CapabilityNotFoundError } from '../../errors'

// A base-only backend: registers `btcGetBalance`, nothing else.
const backend = createChainBackend({ network: MAINNET }).extend(() => ({
  btcGetBalance: async (_address: string) => '12345',
}))

describe('backend capability guard', () => {
  it('registered capability methods work normally', async () => {
    expect(typeof backend.btcGetBalance).toBe('function')
    await expect(backend.btcGetBalance('bc1q…')).resolves.toBe('12345')
  })

  it('calling an UNregistered capability throws CapabilityNotFoundError (not TypeError)', () => {
    // `runesGetAddressBalances` is capability-shaped but not provided here.
    const call = () =>
      (backend as unknown as { runesGetAddressBalances: () => unknown }).runesGetAddressBalances()
    expect(call).toThrow(CapabilityNotFoundError)
    expect(call).toThrow(/runesGetAddressBalances/)
    expect(call).toThrow(/rune/)
  })

  it('the guard fires across capability domains', () => {
    const b = backend as unknown as Record<string, () => unknown>
    expect(() => b.inscriptionsGetByAddress()).toThrow(CapabilityNotFoundError)
    expect(() => b.alkanesGetByAddress()).toThrow(CapabilityNotFoundError)
    expect(() => b.ordGetAddress()).toThrow(CapabilityNotFoundError)
  })

  it('built-ins and framework/JS probes pass through (no false positives)', () => {
    // Built-ins resolve normally.
    expect(backend.network.id).toBe('mainnet')
    expect(backend.getCapabilities()).toContain('btcGetBalance')
    expect(typeof backend.extend).toBe('function')

    // Promise / serialization / equality probes are NOT capability-shaped, so
    // they pass through as `undefined` rather than tripping the guard.
    const probe = backend as unknown as Record<string, unknown>
    expect(probe.then).toBeUndefined()
    expect(probe.toJSON).toBeUndefined()
    expect(probe.asymmetricMatch).toBeUndefined()
    expect(() => JSON.stringify(backend)).not.toThrow()
    // A non-capability-shaped missing key is plain `undefined` (legacy behaviour).
    expect(probe.somethingRandom).toBeUndefined()
  })
})
