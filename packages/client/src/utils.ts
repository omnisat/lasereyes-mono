/**
 * Public utility functions for Bitcoin address handling, PSBT construction,
 * and data conversion. These are stable APIs safe for external consumption.
 *
 * @module utils
 */

export type { NetworkType } from './chains'
// Network helpers
export { getBitcoinNetwork } from './lib/bitcoin-network'
export type { BuildSendBtcPsbtParams } from './lib/build-send-btc-psbt'
// PSBT utilities
export { buildSendBtcPsbt } from './lib/build-send-btc-psbt'
// Conversion utilities
export { bytesToBase64, bytesToHex, hexToBytes } from './lib/bytes'
// Address utilities
export { getAddressScriptPubKey } from './lib/get-address-script-pub-key'
export { getAddressType } from './lib/get-address-type'
export { getRedeemScript } from './lib/get-redeem-script'
export { reverseBytes } from './lib/reverse-bytes'
export { calculateTaprootTxSize, estimateTxSize } from './lib/tx-size'
export { AddressType } from './types/psbt'
// Re-export types that are useful with utils
export type { FormattedUTXO } from './types/utxo'
