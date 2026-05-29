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
