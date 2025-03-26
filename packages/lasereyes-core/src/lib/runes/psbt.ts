import * as bitcoin from 'bitcoinjs-lib'
import { createRuneMintScript, createRuneSendScript } from './scripts'
import { getRecommendedFeesMempoolSpace } from '../mempool-space'
import { MAINNET, P2SH, P2TR } from '../../constants'
import { getRuneOutpoints } from './utils'
import {
  broadcastTx,
  calculateValueOfUtxosGathered,
  estimateTxSize,
  getAddressUtxos,
  getBitcoinNetwork,
} from '../helpers'
import { getRuneById } from '../sandshrew'
import { NetworkType } from '../../types'
import { getAddressType, getRedeemScript } from '../btc'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { BaseNetwork } from '../../types/network'
import { WalletProviderSignPsbtOptions } from '../..'
// import { getAddressType, getRedeemScript } from "../btc"
// import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'

export const sendRune = async ({
  runeId,
  amount,
  ordinalAddress,
  ordinalPublicKey,
  paymentAddress,
  paymentPublicKey,
  toAddress,
  signPsbt,
  network = MAINNET,
}: {
  runeId: string
  amount: number
  ordinalAddress: string
  ordinalPublicKey: string
  paymentAddress: string
  paymentPublicKey: string
  toAddress: string
  signPsbt: (signPsbtOptions: WalletProviderSignPsbtOptions) => Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string
    }
    | undefined
  >
  network: NetworkType
}): Promise<string> => {
  try {
    const runeSendPsbt = await createRuneSendPsbt({
      fromAddress: ordinalAddress,
      fromAddressPublicKey: ordinalPublicKey,
      fromPaymentAddress: paymentAddress,
      fromPaymentPublicKey: paymentPublicKey,
      toAddress,
      runeId,
      amount,
      network,
    })

    if (!runeSendPsbt || !runeSendPsbt?.psbtHex) {
      throw new Error("couldn't get commit tx")
    }

    const runeSendTxHex = String(runeSendPsbt?.psbtHex)
    const runeSendTxBase64 = String(runeSendPsbt?.psbtBase64)
    const response = await signPsbt({
      tx: runeSendTxHex,
      psbtHex: runeSendTxHex,
      psbtBase64: runeSendTxBase64,
      finalize: true,
      broadcast: false,
      network,
    })
    if (!response) throw new Error('sign psbt failed')
    const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
    const extracted = psbt.extractTransaction()
    return await broadcastTx(extracted.toHex(), network)
  } catch (e) {
    throw e
  }
}

export const createRuneSendPsbt = async ({
  fromAddress,
  fromAddressPublicKey,
  fromPaymentAddress,
  fromPaymentPublicKey,
  toAddress,
  runeId,
  amount,
  network,
}: {
  fromAddress: string
  fromAddressPublicKey: string
  fromPaymentAddress: string
  fromPaymentPublicKey: string
  toAddress: string
  runeId: string
  amount: number
  network: NetworkType
}): Promise<{
  psbtBase64: string
  psbtHex: string
}> => {
  try {
    const { fastestFee: feeRate } =
      await getRecommendedFeesMempoolSpace(network)
    const utxos = await getAddressUtxos(fromPaymentAddress, network)
    let sortedUtxos = utxos
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
      .filter((utxo: { value: number }) => utxo.value > 3000)
    if (sortedUtxos.length === 0) {
      throw new Error('No utxos found')
    }

    let psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })

    let runeTotalSatoshis = 0
    const rune = await getRuneById(runeId)
    const outpoints = await getRuneOutpoints({ runeId, address: fromAddress })
    const amountGathered = calculateValueOfUtxosGathered(sortedUtxos)

    const minFee = estimateTxSize(outpoints.length, 2, 4)
    const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
    let finalFee = calculatedFee

    let counter = 0
    for await (const runeOutput of outpoints) {
      const { output, value, script } = runeOutput
      const txSplit = output.split(':')
      const txHash = txSplit[0]
      const txIndex = txSplit[1]
      psbt.addInput({
        hash: txHash,
        index: parseInt(txIndex),
        witnessUtxo: {
          value: BigInt(value),
          script: Buffer.from(script, 'hex'),
        },
        tapInternalKey: toXOnly(Buffer.from(fromAddressPublicKey, 'hex')),
      })

      counter++
      runeTotalSatoshis += value
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

    const script = createRuneSendScript({
      runeId: rune.id,
      amount,
      divisibility: rune.entry.divisibility,
      sendOutputIndex: 2,
      pointer: 1,
    })

    const output = { script: script, value: BigInt(0) }
    psbt.addOutput(output)

    const inscriptionSats = 546
    const changeAmount = amountGathered - (finalFee + inscriptionSats * 2)

    psbt.addOutput({
      value: BigInt(inscriptionSats),
      address: fromAddress,
    })

    psbt.addOutput({
      value: BigInt(inscriptionSats),
      address: toAddress,
    })

    psbt.addOutput({
      address: fromAddress,
      value: BigInt(changeAmount),
    })

    return { psbtBase64: psbt.toBase64(), psbtHex: psbt.toHex() }
  } catch (error) {
    throw error
  }
}

export const createRuneMintPsbt = async ({
  address,
  runeId,
}: {
  address: string
  runeId: string
}) => {
  try {
    const network: NetworkType = BaseNetwork.MAINNET
    const { fastestFee: feeRate } =
      await getRecommendedFeesMempoolSpace(network)
    const utxos = await getAddressUtxos(address, network)

    const minFee = 300
    const inscriptionSats = 546
    const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
    let finalFee = calculatedFee

    const sortedUtxos = utxos.sort(
      (a: { value: number }, b: { value: number }) => b.value - a.value
    )

    const amountRetrieved = calculateValueOfUtxosGathered(sortedUtxos)

    let psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })

    for (let i = 0; i < sortedUtxos.length; i++) {
      const script = bitcoin.address.toOutputScript(
        address,
        getBitcoinNetwork(network)
      )
      const utxo = sortedUtxos[i]
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          value: BigInt(utxo.value),
          script,
        },
      })
    }

    const script = createRuneMintScript({
      runeId: runeId,
      pointer: 1,
    })

    const output = { script: script, value: BigInt(0) }
    psbt.addOutput(output)

    const changeAmount = amountRetrieved - (finalFee + inscriptionSats)

    psbt.addOutput({
      value: BigInt(inscriptionSats),
      address: address,
    })

    psbt.addOutput({
      address: address,
      value: BigInt(changeAmount),
    })

    return { psbt: psbt.toBase64() }
  } catch (error) {
    console.log(error)
    throw error
  }
}
