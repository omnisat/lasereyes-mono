import { describe, expect, it } from 'vitest'
import { bytesToBase64, bytesToHex, hexToBytes, reverseBytes } from '../../lib/bytes'

describe('bytes utilities', () => {
  it('hexToBytes converts hex string to Uint8Array', () => {
    const bytes = hexToBytes('deadbeef')
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))
  })

  it('bytesToHex converts Uint8Array to hex string', () => {
    const hex = bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))
    expect(hex).toBe('deadbeef')
  })

  it('hexToBytes and bytesToHex are inverse operations', () => {
    const original = 'aabbccdd11223344'
    expect(bytesToHex(hexToBytes(original))).toBe(original)
  })

  it('reverseBytes reverses byte order', () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    expect(reverseBytes(bytes)).toEqual(new Uint8Array([4, 3, 2, 1]))
  })

  it('reverseBytes does not mutate original', () => {
    const bytes = new Uint8Array([1, 2, 3])
    reverseBytes(bytes)
    expect(bytes).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('bytesToBase64 encodes Uint8Array to base64', () => {
    // "Hello" in bytes
    const bytes = new Uint8Array([72, 101, 108, 108, 111])
    expect(bytesToBase64(bytes)).toBe('SGVsbG8=')
  })

  it('handles empty input', () => {
    expect(bytesToHex(new Uint8Array([]))).toBe('')
    expect(hexToBytes('')).toEqual(new Uint8Array([]))
    expect(reverseBytes(new Uint8Array([]))).toEqual(new Uint8Array([]))
  })
})
