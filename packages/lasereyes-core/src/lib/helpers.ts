import * as bitcoin from 'bitcoinjs-lib'
import { Buffer } from 'buffer'

import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import axios from 'axios'
import { MempoolUtxo, NetworkType } from '../types'
import { getMempoolSpaceUrl } from './urls'
import * as ecc from '@bitcoinerlab/secp256k1'
import { P2PKH, P2SH, P2SH_P2WPKH, P2TR, P2WPKH, P2WSH } from '../constants'

bitcoin.initEccLib(ecc)

export const getBitcoinNetwork = (
  network:
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET
) => {
  if (network === TESTNET || network === TESTNET4 || network === SIGNET) {
    return bitcoin.networks.testnet
  } else {
    return bitcoin.networks.bitcoin
  }
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
  network:
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET
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

export const isBase64 = (str: string): boolean => {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
  return base64Regex.test(str)
}

export const isHex = (str: string): boolean => {
  const hexRegex = /^[a-fA-F0-9]+$/
  return hexRegex.test(str)
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

export async function getAddressUtxos(
  address: string,
  network:
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET
) {
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
  network:
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET,
  feeRate: number = 7
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
  let counter = 0
  for await (let utxo of sortedUtxos) {
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
      psbt.updateInput(counter, { redeemScript })
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

export function getRedeemScript(
  paymentPublicKey: string,
  network:
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET
) {
  const p2wpkh = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(paymentPublicKey, 'hex'),
    network: getBitcoinNetwork(network),
  })

  const p2sh = bitcoin.payments.p2sh({
    redeem: p2wpkh,
    network: getBitcoinNetwork(network),
  })
  return p2sh?.redeem?.output
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
  return await axios
    .post(`${getMempoolSpaceUrl(network)}/api/tx`, txHex)
    .then((res) => res.data)
}

export const getAddressType = (
  address: string,
  network: bitcoin.Network
): string => {
  try {
    const decoded = bitcoin.address.fromBase58Check(address)

    // Check the address version for P2PKH or P2SH
    if (decoded.version === network.pubKeyHash) return P2PKH
    if (decoded.version === network.scriptHash) {
      // It's a P2SH, but let's check if it wraps a SegWit script
      const script = bitcoin.script.decompile(decoded.hash)
      if (script && script.length === 2 && script[0] === bitcoin.opcodes.OP_0) {
        return P2SH_P2WPKH
      }
      return P2SH
    }
  } catch (e) {
    // If fromBase58Check fails, try Bech32 (for SegWit addresses)
    try {
      const decoded = bitcoin.address.fromBech32(address)

      // Handle Bech32-based addresses (SegWit P2WPKH, P2WSH, P2TR)
      if (decoded.version === 0 && decoded.data.length === 20) return P2WPKH
      if (decoded.version === 0 && decoded.data.length === 32) return P2WSH
      if (decoded.version === 1 && decoded.data.length === 32) return P2TR
    } catch (e2) {
      return 'unknown'
    }
  }

  return 'unknown'
}
