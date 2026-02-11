import * as bitcoin from 'bitcoinjs-lib'
import { toHex } from 'uint8array-tools'
import type { WalletProviderSignPsbtOptions } from '../../client/types'
import { MAINNET } from '../../constants'
import type { NetworkType } from '../../types'
import type { DataSourceManager } from '../data-sources/manager'
import { broadcastTx, getBitcoinNetwork } from '../helpers'
import { getRecommendedFeesMempoolSpace } from '../mempool-space'
import {
  addInputForUtxo,
  calculateTaprootTxSize,
  findXAmountOfSats,
  formatInputsToSign,
  inscriptionSats,
} from '../psbt'
import { filterSpendableUTXOs } from '../utils'

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
  signPsbt: (signPsbtOptions: WalletProviderSignPsbtOptions) => Promise<
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
  const response = await signPsbt({
    tx: '',
    psbtHex: inscriptionsSendTxHex,
    psbtBase64: inscriptonsSendTxBase64,
    finalize: true,
    broadcast: false,
    network,
  })
  if (!response) throw new Error('sign psbt failed')
  const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
  const extracted = psbt.extractTransaction()
  return await broadcastTx(extracted.toHex(), network)
}

export const createInscriptionsSendPsbt = async ({
  fromAddress,
  fromAddressPublicKey,
  fromPaymentAddress,
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
  const { fastestFee: feeRate } = await getRecommendedFeesMempoolSpace(network)
  // const utxos = await dataSourceManager.getAddressUtxos(fromPaymentAddress)
  const utxos = await dataSourceManager.getFormattedUTXOs(fromPaymentAddress)
  const { utxos: spendableUtxos } = filterSpendableUTXOs(utxos)
  // let sortedUtxos = utxos
  //   .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
  //   .filter((utxo: { value: number }) => utxo.value > 3000)
  // if (sortedUtxos.length === 0) {
  //   throw new Error('No utxos found')
  // }

  const sandshrew = dataSourceManager.getSource('sandshrew')

  if (!sandshrew || !sandshrew.batchOrdInscriptionInfo) {
    throw new Error('Sandshrew data source not found')
  }

  const inscriptions = await sandshrew?.batchOrdInscriptionInfo(inscriptionIds)

  console.log(inscriptions)

  const psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })
  // const minFee = estimateTxSize(inscriptions.length, 2, 4)
  // const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
  // let finalFee = calculatedFee
  const minTxSize = calculateTaprootTxSize(inscriptions.length, 2, 4)
  const minFee = BigInt(Math.ceil(Math.max(minTxSize * feeRate, 250)))
  let spendableUtxosGathered = {
    utxos: spendableUtxos,
    totalAmount: spendableUtxos.reduce((acc, utxo) => acc + utxo.btcValue, 0),
  }

  spendableUtxosGathered = findXAmountOfSats(
    spendableUtxosGathered.utxos,
    Number(minFee) + Number(inscriptionSats)
  )

  if (spendableUtxosGathered.utxos.length < 1) {
    throw new Error('Insufficient balance')
  }

  const newSize = calculateTaprootTxSize(spendableUtxosGathered.utxos.length, 2, 4)
  const newFee = BigInt(Math.ceil(Math.max(newSize * feeRate, 250)))
  if (spendableUtxosGathered.totalAmount < newFee) {
    spendableUtxosGathered = findXAmountOfSats(
      spendableUtxosGathered.utxos,
      Number(newFee) + Number(inscriptionSats)
    )
  }
  const finalSize = calculateTaprootTxSize(spendableUtxosGathered.utxos.length, 2, 4)
  const finalFee = BigInt(Math.ceil(Math.max(finalSize * feeRate, 250)))
  const targetInputValue = finalFee + inscriptionSats * 2n

  let totalInputValue = 0n
  const usedUTXOSet: Set<string> = new Set()

  for await (const runeOutput of inscriptions) {
    const { value, satpoint, address } = runeOutput
    const [txHash, vout] = satpoint.split(':')
    if (!value || !txHash || !vout) {
      throw new Error('Invalid satpoint or value')
    }

    const script = bitcoin.address.toOutputScript(fromAddress, getBitcoinNetwork(MAINNET))
    addInputForUtxo(psbt, {
      txHash,
      txOutputIndex: parseInt(vout, 10),
      btcValue: value,
      scriptPubKey: toHex(script),
      address: address ?? '',
    })
    totalInputValue += BigInt(value)
    usedUTXOSet.add(satpoint)

    psbt.addOutput({
      value: BigInt(value),
      address: toAddress,
    })
  }

  for (const utxo of spendableUtxosGathered.utxos) {
    // The `* 2` here is to account for the input going to the sender and the one going to the receiver
    if (totalInputValue > targetInputValue) {
      break
    }
    if (!usedUTXOSet.has(`${utxo.txHash}:${utxo.txOutputIndex.toString()}`)) {
      addInputForUtxo(psbt, utxo)
      totalInputValue += BigInt(utxo.btcValue)
      // This looks useless but it's good to have it anyways
      usedUTXOSet.add(`${utxo.txHash}:${utxo.txOutputIndex.toString()}`)
    }
  }

  const outputTotal = psbt.txOutputs.reduce((sum, o) => sum + o.value, 0n)
  const changeAmount = totalInputValue - outputTotal - finalFee

  psbt.addOutput({
    address: fromAddress,
    value: changeAmount,
  })

  const formattedPsbtTx = await formatInputsToSign({
    _psbt: psbt,
    senderPublicKey: fromAddressPublicKey,
    network: getBitcoinNetwork(network),
  })

  return { psbtBase64: formattedPsbtTx.toBase64(), psbtHex: formattedPsbtTx.toHex() }
}
