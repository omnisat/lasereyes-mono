import { base64, hex } from '@scure/base'

export function hexToBytes(hexStr: string): Uint8Array {
  return hex.decode(hexStr)
}

export function bytesToHex(bytes: Uint8Array): string {
  return hex.encode(bytes)
}

export function bytesToBase64(bytes: Uint8Array): string {
  return base64.encode(bytes)
}

export function reverseBytes(bytes: Uint8Array): Uint8Array {
  const reversed = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    reversed[i] = bytes[bytes.length - 1 - i]
  }
  return reversed
}
