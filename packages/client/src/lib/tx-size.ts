/**
 * Transaction virtual-size estimators. Pure arithmetic, no dependencies.
 */

export function estimateTxSize(
  taprootInputCount: number,
  nonTaprootInputCount: number,
  outputCount: number
): number {
  const baseTxSize = 10
  const taprootInputSize = 57
  const nonTaprootInputSize = 41
  const outputSize = 34
  const totalInputSize =
    taprootInputCount * taprootInputSize + nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize
  return baseTxSize + totalInputSize + totalOutputSize
}

export function calculateTaprootTxSize(
  taprootInputCount: number,
  nonTaprootInputCount: number,
  outputCount: number
): number {
  const baseTxSize = 10
  const taprootInputSize = 64
  const nonTaprootInputSize = 42
  const outputSize = 40
  const totalInputSize =
    taprootInputCount * taprootInputSize + nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize
  return baseTxSize + totalInputSize + totalOutputSize
}
