import * as bitcoin from 'bitcoinjs-lib'
import { getRecommendedFeesMempoolSpace } from '../mempool-space'
import { MAINNET, P2SH, P2TR } from '../../constants'
import {
  broadcastTx,
  calculateValueOfUtxosGathered,
  estimateTxSize,
  getBitcoinNetwork,
} from '../helpers'
import { NetworkType } from '../../types'
import { getAddressType, getRedeemScript } from '../btc'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { DataSourceManager } from '../data-sources/manager'

export const sendInscriptions = async ({
  inscriptionIds,
  ordinalAddress,
  ordinalPublicKey,
  paymentAddress,
  paymentPublicKey,
  toAddress,
  signPsbt,
  dataSourceManager,
  network = MAINNET,
}: {
  inscriptionIds: string[]
  ordinalAddress: string
  ordinalPublicKey: string
  paymentAddress: string
  paymentPublicKey: string
  toAddress: string
  signPsbt: (
    tx: string,
    psbtHex: string,
    psbtBase64: string,
    finalize?: boolean,
    broadcast?: boolean,
    network?: NetworkType
  ) => Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string
    }
    | undefined
  >
  dataSourceManager: DataSourceManager
  network: NetworkType
}): Promise<string> => {
  try {
    const inscriptionsSendPsbt = await createInscriptionsSendPsbt({
      inscriptionIds,
      fromAddress: ordinalAddress,
      fromAddressPublicKey: ordinalPublicKey,
      fromPaymentAddress: paymentAddress,
      fromPaymentPublicKey: paymentPublicKey,
      dataSourceManager,
      toAddress,
      network,
    })

    if (!inscriptionsSendPsbt || !inscriptionsSendPsbt?.psbtHex) {
      throw new Error("couldn't get commit tx")
    }

    const inscriptionsSendTxHex = String(inscriptionsSendPsbt?.psbtHex)
    const inscriptonsSendTxBase64 = String(inscriptionsSendPsbt?.psbtBase64)
    const response = await signPsbt(
      '',
      inscriptionsSendTxHex,
      inscriptonsSendTxBase64,
      true,
      false,
      network
    )
    if (!response) throw new Error('sign psbt failed')
    const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
    const extracted = psbt.extractTransaction()
    return await broadcastTx(extracted.toHex(), network)
  } catch (e) {
    throw e
  }
}

export const createInscriptionsSendPsbt = async ({
  fromAddress,
  fromAddressPublicKey,
  fromPaymentAddress,
  fromPaymentPublicKey,
  toAddress,
  inscriptionIds,
  dataSourceManager,
  network,
}: {
  fromAddress: string
  fromAddressPublicKey: string
  fromPaymentAddress: string
  fromPaymentPublicKey: string
  toAddress: string
  inscriptionIds: string[]
  dataSourceManager: DataSourceManager
  network: NetworkType
}): Promise<{
  psbtBase64: string
  psbtHex: string
}> => {
  try {
    const { fastestFee: feeRate } =
      await getRecommendedFeesMempoolSpace(network)
    const utxos = await dataSourceManager.getAddressUtxos(fromPaymentAddress)
    let sortedUtxos = utxos
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
      .filter((utxo: { value: number }) => utxo.value > 3000)
    if (sortedUtxos.length === 0) {
      throw new Error('No utxos found')
    }

    const sandshrew = dataSourceManager.getSource('sandshrew')

    if (!sandshrew || !sandshrew.batchOrdInscriptionInfo) {
      throw new Error('Sandshrew data source not found')
    }

    const inscriptions = await sandshrew?.batchOrdInscriptionInfo(inscriptionIds)

    console.log(inscriptions)

    let psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })
    const amountGathered = calculateValueOfUtxosGathered(sortedUtxos)
    const minFee = estimateTxSize(inscriptions.length, 2, 4)
    const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
    let finalFee = calculatedFee

    let counter = 0
    for await (const runeOutput of inscriptions) {
      const { value, satpoint } = runeOutput
      const [txHash, vout] = satpoint.split(':')
      if (!value || !txHash || !vout) {
        throw new Error('Invalid satpoint or value')
      }

      const script = bitcoin.address.toOutputScript(fromAddress, getBitcoinNetwork(MAINNET))
      psbt.addInput({
        hash: txHash,
        index: parseInt(vout),
        witnessUtxo: {
          value: BigInt(value),
          script
        },
        tapInternalKey: toXOnly(Buffer.from(fromAddressPublicKey, 'hex')),
      })

      psbt.addOutput({
        value: BigInt(value),
        address: toAddress,
      })
      counter++
    }

    const paymentAddressType = getAddressType(fromPaymentAddress, network)
    for (let i = 0; i < sortedUtxos.length; i++) {
      const script = bitcoin.address.toOutputScript(
        fromPaymentAddress,
        getBitcoinNetwork(MAINNET)
      )
      const utxo = sortedUtxos[i]

      if (paymentAddressType === P2TR) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            value: BigInt(utxo.value),
            script,
          },
          tapInternalKey: toXOnly(Buffer.from(fromPaymentPublicKey, 'hex')),
        })
      }

      if (paymentAddressType === P2SH) {
        let redeemScript = getRedeemScript(fromPaymentPublicKey, network)
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            value: BigInt(utxo.value),
            script,
          },
          redeemScript,
        })
      }

      if (paymentAddressType === 'p2wpkh') {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            value: BigInt(utxo.value),
            script,
          },
        })
      }
    }

    const changeAmount = amountGathered - (finalFee)

    psbt.addOutput({
      address: fromAddress,
      value: BigInt(changeAmount),
    })

    return { psbtBase64: psbt.toBase64(), psbtHex: psbt.toHex() }
  } catch (error) {
    throw error
  }
}

