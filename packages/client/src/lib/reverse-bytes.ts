export function reverseBytes(bytes: Uint8Array): Uint8Array {
  const reversed = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    reversed[i] = bytes[bytes.length - 1 - i]
  }
  return reversed
}
