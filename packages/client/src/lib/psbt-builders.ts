/**
 * PSBT construction utilities for Bitcoin transactions.
 * These are pure functions that build PSBTs given inputs - they don't perform I/O.
 *
 * @module lib/psbt-builders
 * @internal
 */

import { base64, hex } from '@scure/base'
import { Address, OutScript, Transaction as PsbtTransaction } from '@scure/btc-signer'
import { InsufficientFundsError, PsbtBuildError } from '../errors'
import type { NetworkType, PsbtResult, UTXO } from '../types'
import { AddressType } from '../types/psbt'
import { getAddressType, getRedeemScript } from './btc'
import { estimateTxSize, getBitcoinNetwork } from './helpers'

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
  /** Public key for the change address (needed for P2SH-P2WPKH) */
  publicKey?: string
  /** Sender's address (if different from changeAddress for taproot-only wallets) */
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
 * import { buildSendBtcPsbt } from './lib/psbt-builders'
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
  const {
    utxos,
    toAddress,
    amount,
    changeAddress,
    feeRate,
    network,
    publicKey,
    fromAddress = changeAddress,
  } = params

  if (amount <= 0) {
    throw new PsbtBuildError('Amount must be greater than 0')
  }

  if (!utxos || utxos.length === 0) {
    throw new PsbtBuildError('No UTXOs provided')
  }

  const isTaprootOnly = fromAddress === changeAddress
  const btcNetwork = getBitcoinNetwork(network)

  // Sort UTXOs by value descending (spend largest first)
  const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

  const tx = new PsbtTransaction()

  // Estimate transaction size (1 input, 0 taproot inputs, 2 outputs)
  const estTxSize = estimateTxSize(1, 0, 2)
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

    // For non-taproot addresses, add redeem script if needed
    if (!isTaprootOnly && publicKey) {
      const addrType = getAddressType(changeAddress)
      if (addrType === AddressType.P2SH_P2WPKH) {
        const redeemScript = getRedeemScript(publicKey, network)
        if (redeemScript) {
          tx.updateInput(tx.inputsLength - 1, { redeemScript })
        }
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
