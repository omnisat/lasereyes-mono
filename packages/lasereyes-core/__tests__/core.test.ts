import { getOrangeNetwork, MAINNET, ORANGE_MAINNET } from '../src'

describe('getOrangeNetwork', () => {
  it('should return expected result', () => {
    const result = getOrangeNetwork(MAINNET)
    expect(result).toBe(ORANGE_MAINNET)
  })
})
