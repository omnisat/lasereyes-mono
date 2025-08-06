import { Psbt } from "bitcoinjs-lib";

export function estimateTxSize(psbt: Psbt) {
  const tx = psbt.extractTransaction()
  const size = tx.virtualSize
  return size
}