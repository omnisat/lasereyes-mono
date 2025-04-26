import * as bitcoin from 'bitcoinjs-lib'

import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import axios from 'axios'
import type { MempoolUtxo, NetworkType } from '../types'
import { getMempoolSpaceUrl } from './urls'
import * as ecc from '@bitcoinerlab/secp256k1'
import { getRedeemScript } from './btc'

bitcoin.initEccLib(ecc)

export const getBitcoinNetwork = (network: NetworkType) => {
  if (network === TESTNET || network === TESTNET4 || network === SIGNET) {
    return bitcoin.networks.testnet
  }
    return bitcoin.networks.bitcoin
}

export const findOrdinalsAddress = (
  addresses: { purpose: string; address: string; publicKey: string }[]
) => {
  return addresses.find(
    ({ purpose }: { purpose: string }) => purpose === 'ordinals'
  )
}

export const findPaymentAddress = (
  addresses: { purpose: string; address: string; publicKey: string }[]
) => {
  return addresses.find(
    ({ purpose }: { purpose: string }) => purpose === 'payment'
  )
}

export const getBTCBalance = async (
  address: string,
  network: NetworkType
): Promise<bigint> => {
  try {
    const utxos: MempoolUtxo[] | undefined = await getAddressUtxos(
      address,
      network
    )
    if (!utxos) return 0n
    return utxos.reduce((acc, utxo) => acc + BigInt(utxo.value), 0n)
  } catch (error) {
    console.error('Error fetching BTC balance:', error)
    throw new Error('Failed to fetch BTC balance')
  }
}

export const satoshisToBTC = (satoshis: number): string => {
  if (Number.isNaN(satoshis) || satoshis === undefined) return '--'
  const btcValue = satoshis / 100000000
  return btcValue.toFixed(8)
}

export function estimateTxSize(
  taprootInputCount: number,
  nonTaprootInputCount: number,
  outputCount: number
): number {
  const baseTxSize = 10
  const taprootInputSize = 57
  const nonTaprootInputSize = 41
  const outputSize = 34
  const totalInputSize =
    taprootInputCount * taprootInputSize +
    nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize
  return baseTxSize + totalInputSize + totalOutputSize
}

export async function getAddressUtxos(address: string, network: NetworkType) {
  if (address.startsWith('t')) {
    if (network === MAINNET) {
      return []
    }
    if (network === FRACTAL_MAINNET) {
      return []
    }
    if (network === FRACTAL_TESTNET) {
      return []
    }
  }
  return (await axios
    .get(`${getMempoolSpaceUrl(network)}/api/address/${address}/utxo`)
    .then((response) => response.data)) as Array<MempoolUtxo>
}

export async function createSendBtcPsbt(
  address: string,
  paymentAddress: string,
  recipientAddress: string,
  amount: number,
  paymentPublicKey: string,
  network: NetworkType,
  feeRate = 7
) {
  const isTaprootOnly = address === paymentAddress
  const utxos: MempoolUtxo[] | undefined = await getAddressUtxos(
    paymentAddress,
    network
  )

  if (!utxos) {
    throw new Error('No UTXOs found')
  }

  const sortedUtxos = utxos.sort(
    (a: { value: number }, b: { value: number }) => b.value - a.value
  )

  const psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })

  const estTxSize = estimateTxSize(1, 0, 2)
  const satsNeeded = Math.floor(estTxSize * feeRate) + amount
  let amountGathered = 0
  for await (const utxo of sortedUtxos) {
    const { txid, vout, value } = utxo
    const script = bitcoin.address.toOutputScript(
      paymentAddress,
      getBitcoinNetwork(network)
    )
    psbt.addInput({
      hash: txid,
      index: vout,
      witnessUtxo: {
        script,
        value: BigInt(value),
      },
    })

    if (!isTaprootOnly) {
      const redeemScript = getRedeemScript(paymentPublicKey, network)
      psbt.updateInput(vout, { redeemScript })
    }

    amountGathered += value
    if (amountGathered >= satsNeeded) {
      break
    }
  }

  if (amountGathered < satsNeeded) {
    throw new Error('Insufficient funds')
  }

  psbt.addOutput({
    address: recipientAddress,
    value: BigInt(amount),
  })

  if (amountGathered > satsNeeded) {
    psbt.addOutput({
      address: paymentAddress,
      value: BigInt(amountGathered - satsNeeded),
    })
  }

  return {
    psbtBase64: psbt.toBase64(),
    psbtHex: psbt.toHex(),
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function calculateValueOfUtxosGathered(utxoArray: MempoolUtxo[]) {
  return utxoArray?.reduce((prev, currentValue) => prev + currentValue.value, 0)
}

export async function broadcastTx(
  txHex: string,
  network: NetworkType
): Promise<string> {
  const response = await axios.post(
    `${getMempoolSpaceUrl(network)}/api/tx`,
    txHex,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
  return response.data
}

export const isTestnetNetwork = (network: NetworkType) => {
  return network === TESTNET || network === TESTNET4 || network === SIGNET
}

export const isMainnetNetwork = (network: NetworkType) => {
  return (
    network === MAINNET ||
    network === FRACTAL_MAINNET ||
    network === FRACTAL_TESTNET
  )
}

