/**
 * PSBT construction for sending BTC. Pure (no I/O), but pulls
 * `@scure/btc-signer` — keep out of crypto-free paths.
 *
 * @module lib/build-send-btc-psbt
 * @internal
 */

import { base64, hex } from '@scure/base'
import { Address, OutScript, Transaction as PsbtTransaction } from '@scure/btc-signer'
import type { NetworkType } from '../chains'
import { InsufficientFundsError, PsbtBuildError } from '../errors'
import type { PsbtResult, UTXO } from '../types'
import { AddressType } from '../types/psbt'
import { getBitcoinNetwork } from './bitcoin-network'
import { getAddressType } from './get-address-type'
import { getRedeemScript } from './get-redeem-script'
import { estimateTxSize } from './tx-size'

/**
 * Parameters for building a BTC send PSBT.
 */
export interface BuildSendBtcPsbtParams {
  /** UTXOs available for spending */
  utxos: UTXO[]
  /** Recipient's Bitcoin address */
  toAddress: string
  /** Amount to send in satoshis */
  amount: number
  /** Address to receive change */
  changeAddress: string
  /** Fee rate in sat/vB */
  feeRate: number
  /** Network type */
  network: NetworkType
  /**
   * Public key of the address being spent. Required for **P2TR** (the
   * taproot internal x-only key that becomes each input's `tapInternalKey`,
   * without which the input is unsignable) and for **P2SH-P2WPKH** (to build
   * the redeem script).
   */
  publicKey?: string
  /**
   * @deprecated No longer used — the input type is detected from
   * `changeAddress` via `getAddressType`. Kept for backward compatibility.
   */
  fromAddress?: string
}

/**
 * Builds an unsigned PSBT for sending BTC.
 *
 * @param params - PSBT construction parameters
 * @returns Unsigned PSBT in both base64 and hex formats
 *
 * @throws {PsbtBuildError} If amount is invalid or no UTXOs provided
 * @throws {InsufficientFundsError} If UTXOs cannot cover amount + fees
 *
 * @example
 * ```ts
 * import { buildSendBtcPsbt } from './lib/build-send-btc-psbt'
 *
 * const psbt = buildSendBtcPsbt({
 *   utxos: myUtxos,
 *   toAddress: 'bc1q...',
 *   amount: 10000,
 *   changeAddress: 'bc1q...',
 *   feeRate: 10,
 *   network: MAINNET,
 *   publicKey: '02...'
 * })
 * ```
 */
export function buildSendBtcPsbt(params: BuildSendBtcPsbtParams): PsbtResult {
  const { utxos, toAddress, amount, changeAddress, feeRate, network, publicKey } = params

  if (amount <= 0) {
    throw new PsbtBuildError('Amount must be greater than 0')
  }

  if (!utxos || utxos.length === 0) {
    throw new PsbtBuildError('No UTXOs provided')
  }

  const btcNetwork = getBitcoinNetwork(network)
  const addrType = getAddressType(changeAddress)

  // Taproot inputs are only signable if they carry the *internal* x-only
  // public key (`tapInternalKey`). It can't be recovered from the address —
  // that's the BIP86-tweaked output key — so the caller must supply the
  // internal key via `publicKey`. Compute it once: every input here spends
  // `changeAddress`, so they share a type.
  let tapInternalKey: Uint8Array | undefined
  if (addrType === AddressType.P2TR) {
    if (!publicKey) {
      throw new PsbtBuildError(
        'Taproot (P2TR) spend requires `publicKey` (the taproot internal pubkey) to build a signable input'
      )
    }
    // tapInternalKey is the 32-byte x-coordinate. Accept compressed (33),
    // uncompressed (65), or already-x-only (32) input.
    const pk = hex.decode(publicKey)
    tapInternalKey = pk.length === 32 ? pk : pk.slice(1, 33)
  }

  // Sort UTXOs by value descending (spend largest first)
  const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

  const tx = new PsbtTransaction()

  // Rough single-input fee estimate, shaped to the input's type.
  const isTaproot = addrType === AddressType.P2TR
  const estTxSize = estimateTxSize(isTaproot ? 1 : 0, isTaproot ? 0 : 1, 2)
  const satsNeeded = Math.floor(estTxSize * feeRate) + amount
  let amountGathered = 0

  // Add inputs until we have enough to cover amount + fees
  for (const utxo of sortedUtxos) {
    const { txid, vout, value } = utxo
    const scriptPubKey = OutScript.encode(Address(btcNetwork).decode(changeAddress))

    tx.addInput({
      txid,
      index: vout,
      witnessUtxo: {
        script: scriptPubKey,
        amount: BigInt(value),
      },
    })

    // Attach the per-input metadata the spend type needs to be signable:
    // taproot → tapInternalKey; P2SH-P2WPKH → redeemScript.
    if (tapInternalKey) {
      tx.updateInput(tx.inputsLength - 1, { tapInternalKey })
    } else if (addrType === AddressType.P2SH_P2WPKH && publicKey) {
      const redeemScript = getRedeemScript(publicKey, network)
      if (redeemScript) {
        tx.updateInput(tx.inputsLength - 1, { redeemScript })
      }
    }

    amountGathered += value
    if (amountGathered >= satsNeeded) {
      break
    }
  }

  if (amountGathered < satsNeeded) {
    throw new InsufficientFundsError(satsNeeded, amountGathered)
  }

  // Add recipient output
  tx.addOutputAddress(toAddress, BigInt(amount), btcNetwork)

  // Add change output if there's any left over
  if (amountGathered > satsNeeded) {
    tx.addOutputAddress(changeAddress, BigInt(amountGathered - satsNeeded), btcNetwork)
  }

  const psbtBytes = tx.toPSBT()
  return {
    psbtBase64: base64.encode(psbtBytes),
    psbtHex: hex.encode(psbtBytes),
  }
}
