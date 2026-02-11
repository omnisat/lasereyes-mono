import { base64, hex } from '@scure/base'
import { Address, OutScript, Transaction as PsbtTransaction } from '@scure/btc-signer'
import { InsufficientFundsError, PsbtBuildError } from '../errors'
import { getAddressType, getRedeemScript } from '../lib/btc'
import { estimateTxSize, getBitcoinNetwork } from '../lib/helpers'
import type { BaseCapability, Client, FeeEstimate, PsbtResult, Transaction, UTXO } from '../types'
import { AddressType } from '../types/psbt'

export interface SendBtcParams {
  fromAddress: string
  toAddress: string
  amount: number
  paymentAddress: string
  paymentPublicKey: string
  feeRate?: number
}

export interface BtcActions {
  getBalance(address: string): Promise<string>
  getUtxos(address: string): Promise<UTXO[]>
  getRecommendedFees(): Promise<FeeEstimate>
  getTransaction(txId: string): Promise<Transaction>
  broadcastTransaction(rawTx: string): Promise<string>
  waitForTransaction(txId: string): Promise<boolean>
  createSendBtcPsbt(params: SendBtcParams): Promise<PsbtResult>
}

export function btcActions() {
  return (client: Client<BaseCapability>): BtcActions => {
    const ds = client.dataSource

    return {
      getBalance: (address: string) => ds.getBalance(address),
      getUtxos: (address: string) => ds.getUtxos(address),
      getRecommendedFees: () => ds.getRecommendedFees(),
      getTransaction: (txId: string) => ds.getTransaction(txId),
      broadcastTransaction: (rawTx: string) => ds.broadcastTransaction(rawTx),
      waitForTransaction: (txId: string) => ds.waitForTransaction(txId),

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

        const utxos = await ds.getUtxos(paymentAddress)
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
