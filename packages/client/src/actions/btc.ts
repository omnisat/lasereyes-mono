import { base64, hex } from '@scure/base'
import { Address, OutScript, Transaction as PsbtTransaction } from '@scure/btc-signer'
import { InsufficientFundsError, PsbtBuildError } from '../errors'
import { getAddressType, getRedeemScript } from '../lib/btc'
import { estimateTxSize, getBitcoinNetwork } from '../lib/helpers'
import type {
  BaseCapability,
  Client,
  FeeEstimate,
  PaginatedResult,
  PsbtResult,
  Transaction,
  UTXO,
} from '../types'
import { AddressType } from '../types/psbt'

/**
 * Parameters for creating a BTC send transaction PSBT.
 */
export interface SendBtcParams {
  /** The sender's address (may differ from payment address for taproot wallets) */
  fromAddress: string
  /** The recipient's Bitcoin address */
  toAddress: string
  /** The amount to send in satoshis */
  amount: number
  /** The address used to fund the transaction and receive change */
  paymentAddress: string
  /** The public key of the payment address, used for redeem script generation */
  paymentPublicKey: string
  /** The fee rate in sat/vB (defaults to 7 if not provided) */
  feeRate?: number
}

/**
 * Action methods for core Bitcoin operations.
 *
 * @remarks
 * These actions require a data source with {@link BaseCapability} methods.
 */
export interface BtcActions {
  /** Retrieves the confirmed balance for an address in satoshis (as a string). */
  btcGetBalance(address: string): Promise<string>
  /** Retrieves the list of unspent transaction outputs for an address. */
  btcGetAddressUtxos(address: string): Promise<PaginatedResult<UTXO>>
  /** Fetches the current recommended fee rates from the data source. */
  btcGetRecommendedFees(): Promise<FeeEstimate>
  /** Retrieves full transaction details by transaction ID. */
  btcGetTransaction(txId: string): Promise<Transaction>
  /** Broadcasts a signed raw transaction hex to the Bitcoin network. Returns the transaction ID. */
  btcBroadcastTransaction(rawTx: string): Promise<string>
  /** Polls until the given transaction is confirmed on-chain. Returns `true` when confirmed. */
  btcWaitForTransaction(txId: string): Promise<boolean>
  /**
   * Builds an unsigned PSBT for sending BTC from one address to another.
   *
   * @param params - The send parameters including addresses, amount, and fee rate
   * @returns The unsigned PSBT in both base64 and hex encodings
   *
   * @throws {@link PsbtBuildError} If the amount is invalid or no UTXOs are found
   * @throws {@link InsufficientFundsError} If available UTXOs cannot cover the amount plus fees
   */
  createSendBtcPsbt(params: SendBtcParams): Promise<PsbtResult>
}

/**
 * Creates a BTC action group factory for use with {@link Client.extend | client.extend()}.
 *
 * Provides core Bitcoin operations such as balance queries, UTXO listing, fee estimation,
 * transaction broadcasting, and PSBT construction.
 *
 * @returns A factory function that produces {@link BtcActions} when given a client
 *
 * @example
 * ```ts
 * import { createClient } from '@omnisat/lasereyes-client'
 * import { btcActions } from '@omnisat/lasereyes-client/actions/btc'
 *
 * const client = createClient({ network: MAINNET, dataSource: ds })
 *   .extend(btcActions())
 *
 * const balance = await client.btcGetBalance('bc1q...')
 * const { psbtBase64 } = await client.createSendBtcPsbt({
 *   fromAddress: 'bc1q...',
 *   toAddress: 'bc1q...',
 *   amount: 10000,
 *   paymentAddress: 'bc1q...',
 *   paymentPublicKey: '02...',
 * })
 * ```
 */
export function btcActions() {
  return (client: Client<BaseCapability>): BtcActions => {
    const ds = client.dataSource

    return {
      btcGetBalance: (address: string) => ds.btcGetBalance(address),
      btcGetAddressUtxos: (address: string) => ds.btcGetAddressUtxos(address),
      btcGetRecommendedFees: () => ds.btcGetRecommendedFees(),
      btcGetTransaction: (txId: string) => ds.btcGetTransaction(txId),
      btcBroadcastTransaction: (rawTx: string) => ds.btcBroadcastTransaction(rawTx),
      btcWaitForTransaction: (txId: string) => ds.btcWaitForTransaction(txId),

      async createSendBtcPsbt(params: SendBtcParams): Promise<PsbtResult> {
        const {
          fromAddress,
          toAddress,
          amount,
          paymentAddress,
          paymentPublicKey,
          feeRate = 7,
        } = params

        if (amount <= 0) {
          throw new PsbtBuildError('Amount must be greater than 0')
        }

        const isTaprootOnly = fromAddress === paymentAddress
        const network = client.network
        const btcNetwork = getBitcoinNetwork(network)

        const { data: utxos } = await ds.btcGetAddressUtxos(paymentAddress)
        if (!utxos || utxos.length === 0) {
          throw new PsbtBuildError('No UTXOs found for payment address')
        }

        const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

        const tx = new PsbtTransaction()

        const estTxSize = estimateTxSize(1, 0, 2)
        const satsNeeded = Math.floor(estTxSize * feeRate) + amount
        let amountGathered = 0

        for (const utxo of sortedUtxos) {
          const { txid, vout, value } = utxo
          const scriptPubKey = OutScript.encode(Address(btcNetwork).decode(paymentAddress))

          tx.addInput({
            txid,
            index: vout,
            witnessUtxo: {
              script: scriptPubKey,
              amount: BigInt(value),
            },
          })

          if (!isTaprootOnly) {
            const addrType = getAddressType(paymentAddress)
            if (addrType === AddressType.P2SH_P2WPKH) {
              const redeemScript = getRedeemScript(paymentPublicKey, network)
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

        tx.addOutputAddress(toAddress, BigInt(amount), btcNetwork)

        if (amountGathered > satsNeeded) {
          tx.addOutputAddress(paymentAddress, BigInt(amountGathered - satsNeeded), btcNetwork)
        }

        const psbtBytes = tx.toPSBT()
        return {
          psbtBase64: base64.encode(psbtBytes),
          psbtHex: hex.encode(psbtBytes),
        }
      },
    }
  }
}
