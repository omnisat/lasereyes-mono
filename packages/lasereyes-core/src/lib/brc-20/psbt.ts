import * as bitcoin from 'bitcoinjs-lib'
import { MAINNET, P2SH } from '../../constants'
import { getBrc20SendJsonStr } from './utils'
import type { MempoolUtxo, NetworkType } from '../../types'
import { inscribeContent } from '../inscribe'
import {
  broadcastTx,
  calculateValueOfUtxosGathered,
  getBitcoinNetwork,
} from '../helpers'
import { getAddressType, getRedeemScript } from '../btc'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { DataSourceManager } from '../data-sources/manager'
import type { WalletProviderSignPsbtOptions } from '../../client/types'

export const sendBrc20 = async ({
  ticker,
  amount,
  ordinalAddress,
  ordinalPublicKey,
  paymentAddress,
  paymentPublicKey,
  toAddress,
  signPsbt,
  dataSourceManager,
  network = MAINNET,
}: {
  ticker: string
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
  dataSourceManager?: DataSourceManager
  network: NetworkType
}) => {
  let ds: DataSourceManager | undefined
  if (!dataSourceManager) {
    ds = DataSourceManager.getInstance()
  } else {
    ds = dataSourceManager as DataSourceManager
  }

  if (!ds) {
    throw new Error('Data source not found')
  }

  if (!ds?.getAddressBrc20Balances) {
    throw new Error('Data source not found')
  }

  const addressBalance = await ds?.getAddressBrc20Balances(ordinalAddress)
  if (!addressBalance) {
    throw new Error('Address balance not found')
  }

  const sendInscriptionStr = getBrc20SendJsonStr(ticker, amount)
  const inscriptionTxId = await inscribeContent({
    contentBase64: btoa(sendInscriptionStr),
    mimeType: 'text/plain',
    ordinalAddress,
    paymentAddress,
    paymentPublicKey,
    signPsbt,
    dataSourceManager: ds,
    network,
  })

  await ds.waitForTransaction(inscriptionTxId)

  const { fastFee } = await ds.getRecommendedFees()

  const estimatedSize = 5 * 34 * 1
  const sendInscriptionSatsNeeded = Math.floor(estimatedSize * fastFee * 1)

  // delay for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000))

  const utxosGathered: MempoolUtxo[] = await ds.getAddressUtxos(paymentAddress)
  const filteredUtxos = utxosGathered
    .filter((utxo: MempoolUtxo) => utxo.value > 3000)
    .sort((a, b) => b.value - a.value)

  const amountRetrieved = calculateValueOfUtxosGathered(filteredUtxos)
  if (amountRetrieved < sendInscriptionSatsNeeded) {
    throw new Error('insufficient funds')
  }

  console.log('inscriptionTxId', inscriptionTxId)

  const sendPsbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })
  const script = bitcoin.address.toOutputScript(
    ordinalAddress,
    getBitcoinNetwork(network)
  )
  sendPsbt.addInput({
    hash: inscriptionTxId,
    index: 0,
    witnessUtxo: {
      script,
      value: BigInt(546),
    },
    tapInternalKey: toXOnly(Buffer.from(ordinalPublicKey, 'hex')),
  })
  sendPsbt.addOutput({
    address: toAddress,
    value: BigInt(546),
  })

  let counter = 0
  let accSats = 0
  for await (const utxo of filteredUtxos) {
    const paymentScript = bitcoin.address.toOutputScript(
      paymentAddress,
      getBitcoinNetwork(network)
    )
    const paymentAddressType = getAddressType(paymentAddress, network)
    sendPsbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: { value: BigInt(utxo.value), script: paymentScript },
      tapInternalKey: toXOnly(Buffer.from(paymentPublicKey, 'hex')),
    })

    if (paymentAddressType === P2SH) {
      const redeemScript = getRedeemScript(paymentPublicKey, network)
      sendPsbt.updateInput(counter, { redeemScript })
    }

    counter++
    accSats += utxo.value
    if (accSats > sendInscriptionSatsNeeded) {
      console.log('BREAKING')
      break
    }
  }

  const reimbursement = accSats - sendInscriptionSatsNeeded
  if (reimbursement > 546) {
    sendPsbt.addOutput({
      value: BigInt(reimbursement),
      address: paymentAddress,
    })
  }

  const brc20SendHex = sendPsbt?.toHex()
  const brc20SendBase64 = sendPsbt?.toBase64()
  const response = await signPsbt({
    tx: '',
    psbtHex: brc20SendHex,
    psbtBase64: brc20SendBase64,
    finalize: true,
    broadcast: true,
    network,
  })
  if (!response) throw new Error('sign psbt failed')

  const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
  const extracted = psbt.extractTransaction()
  return await broadcastTx(extracted.toHex(), network)
}
