import { describe, expect, it } from 'vitest'
import { calculateTaprootTxSize } from '../../lib/tx-size'

describe('calculateTaprootTxSize', () => {
  it('computes known size for 1 taproot input, 0 non-taproot, 2 outputs', () => {
    expect(calculateTaprootTxSize(1, 0, 2)).toBe(10 + 64 + 80)
  })

  it('computes known size for 0 taproot, 1 non-taproot, 1 output', () => {
    expect(calculateTaprootTxSize(0, 1, 1)).toBe(10 + 42 + 40)
  })
})
