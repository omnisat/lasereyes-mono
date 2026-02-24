/**
 * Public utility functions for Bitcoin address handling, PSBT construction,
 * and data conversion. These are stable APIs safe for external consumption.
 *
 * @module utils
 */

// Address utilities
export { getAddressScriptPubKey, getAddressType, getRedeemScript } from './lib/btc'
// Conversion utilities
export { bytesToBase64, bytesToHex, hexToBytes, reverseBytes } from './lib/bytes'
export {
  delay,
  estimateTxSize,
  getBitcoinNetwork,
  isMainnetNetwork,
  isTestnetNetwork,
  satoshisToBTC,
} from './lib/helpers'
// PSBT utilities
export {
  addInputForUtxo,
  calculateTaprootTxSize,
  findXAmountOfSats,
  formatInputsToSign,
  inscriptionSats,
} from './lib/psbt'
export type { BuildSendBtcPsbtParams } from './lib/psbt-builders'
export { buildSendBtcPsbt } from './lib/psbt-builders'
// URL utilities
export { getMaestroUrl, getMempoolSpaceUrl, getSandshrewUrl } from './lib/urls'
export { encodeVarint, isBase64, isHex } from './lib/utils'
export type { NetworkType } from './types/network'
export { AddressType } from './types/psbt'
// Re-export types that are useful with utils
export type { FormattedUTXO } from './types/utxo'
