import type { FormattedUTXO } from '../types/utxo'

export function findXAmountOfSats(utxos: FormattedUTXO[], target: number) {
  let totalAmount = 0
  const selectedUtxos: FormattedUTXO[] = []

  for (const utxo of utxos) {
    if (totalAmount >= target) break
    selectedUtxos.push(utxo)
    totalAmount += utxo.btcValue
  }
  return {
    utxos: selectedUtxos,
    totalAmount,
  }
}
