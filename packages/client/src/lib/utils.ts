export function isBase64(str: string): boolean {
  if (str === '' || str.trim() === '') return false
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

export function isHex(str: string): boolean {
  return /^[0-9a-fA-F]+$/.test(str)
}

export function encodeVarint(value: number): number[] {
  const result: number[] = []
  let v = value
  while (v >= 0x80) {
    result.push((v & 0x7f) | 0x80)
    v >>>= 7
  }
  result.push(v)
  return result
}
