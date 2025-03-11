import * as bitcoin from 'bitcoinjs-lib'
import { MAINNET, P2TR } from '../../constants'
import { getBrc20SendJsonStr } from './utils'
import { NetworkType } from '../../types'
import { inscribeContent } from '../inscribe'
import { broadcastTx, getBitcoinNetwork } from '../helpers'
import { getAddressType } from '../btc'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { DataSourceManager } from '../data-sources/manager'

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
  dataSourceManager?: DataSourceManager
  network: NetworkType
}) => {
  try {
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
      contentBase64: sendInscriptionStr,
      mimeType: "application/json",
      ordinalAddress,
      paymentAddress,
      paymentPublicKey,
      signPsbt,
      dataSourceManager: dataSourceManager!,
      network,
    })

    const sendPsbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })
    const script = bitcoin.address.toOutputScript(toAddress, getBitcoinNetwork(network))
    const paymentAddressType = getAddressType(paymentAddress, network)
    sendPsbt.addInput({
      hash: inscriptionTxId,
      index: 0,
      witnessUtxo: {
        script,
        value: BigInt(546),
      },
    })

    if (paymentAddressType === P2TR) {
      sendPsbt.updateInput(0, {
        tapInternalKey: toXOnly(Buffer.from(ordinalPublicKey!, 'hex')),
      })
    }

    sendPsbt.addOutput({
      address: toAddress,
      value: BigInt(546),
    })

    const brc20SendHex = sendPsbt?.toHex()
    const brc20SendBase64 = sendPsbt?.toBase64()
    const response = await signPsbt(
      '',
      brc20SendHex,
      brc20SendBase64,
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

