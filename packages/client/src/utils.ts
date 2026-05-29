/**
 * Public utility functions for Bitcoin address handling, PSBT construction,
 * and data conversion. These are stable APIs safe for external consumption.
 *
 * @module utils
 */

export type { NetworkType } from './chains'
// PSBT utilities
export { addInputForUtxo } from './lib/add-input-for-utxo'
// Network helpers
export { getBitcoinNetwork } from './lib/bitcoin-network'
export type { BuildSendBtcPsbtParams } from './lib/build-send-btc-psbt'
export { buildSendBtcPsbt } from './lib/build-send-btc-psbt'
// Conversion utilities
export { bytesToBase64, bytesToHex, hexToBytes } from './lib/bytes'
export { delay } from './lib/delay'
export { encodeVarint } from './lib/encode-varint'
export { findXAmountOfSats } from './lib/find-x-amount-of-sats'
export { formatInputsToSign } from './lib/format-inputs-to-sign'
// Address utilities
export { getAddressScriptPubKey } from './lib/get-address-script-pub-key'
export { getAddressType } from './lib/get-address-type'
export { getRedeemScript } from './lib/get-redeem-script'
export { inscriptionSats } from './lib/inscription-sats'
export { isBase64 } from './lib/is-base64'
export { isHex } from './lib/is-hex'
export { isMainnetNetwork, isTestnetNetwork } from './lib/network-predicates'
export { reverseBytes } from './lib/reverse-bytes'
export { satoshisToBTC } from './lib/satoshis-to-btc'
export { calculateTaprootTxSize, estimateTxSize } from './lib/tx-size'
// URL utilities
export { getMaestroUrl, getMempoolSpaceUrl, getSandshrewUrl } from './lib/urls'
export { AddressType } from './types/psbt'
// Re-export types that are useful with utils
export type { FormattedUTXO } from './types/utxo'
