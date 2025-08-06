import * as bitcoin from 'bitcoinjs-lib'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import { getBitcoinNetwork } from './helpers'
import * as bip39 from 'bip39'
import type { NetworkType } from '../types'
import { BIP32Factory } from 'bip32'
import { getTransactionMempoolSpace } from './mempool-space'
import { P2PKH, P2SH_P2WPKH, P2SH, P2WPKH, P2WSH, P2TR } from '../constants'

const bip32 = BIP32Factory(ecc2)
bitcoin.initEccLib(ecc2)

export async function generatePrivateKey(network: NetworkType) {
  const entropy = crypto.getRandomValues(new Uint8Array(32))
  const mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy))
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root = bip32.fromSeed(seed, getBitcoinNetwork(network))
  // biome-ignore lint/style/noNonNullAssertion: root is derived from seed
  return root.derivePath("m/44'/0'/0'/0/0").privateKey!
}

export const getAddressType = (
  address: string,
  network: NetworkType
): string => {
  try {
    const btcNetwork = getBitcoinNetwork(network)
    const decoded = bitcoin.address.fromBase58Check(address)
    if (decoded.version === btcNetwork.pubKeyHash) return P2PKH
    if (decoded.version === btcNetwork.scriptHash) {
      const script = bitcoin.script.decompile(decoded.hash)
      if (script && script.length === 2 && script[0] === bitcoin.opcodes.OP_0) {
        return P2SH_P2WPKH
      }
      return P2SH
    }
  } catch {
    try {
      const decoded = bitcoin.address.fromBech32(address)
      if (decoded.version === 0 && decoded.data.length === 20) return P2WPKH
      if (decoded.version === 0 && decoded.data.length === 32) return P2WSH
      if (decoded.version === 1 && decoded.data.length === 32) return P2TR
    } catch {
      return 'unknown'
    }
  }

  return 'unknown'
}

export const getAddressScriptPubKey = (
  address: string,
  network: NetworkType
): Uint8Array => {
  const btcNetwork = getBitcoinNetwork(network)
  return bitcoin.address.toOutputScript(address, btcNetwork)
}

export function getPublicKeyHash(
  address: string,
  network: NetworkType
): Uint8Array {
  const btcNetwork = getBitcoinNetwork(network)
  const decoded = bitcoin.address.toOutputScript(address, btcNetwork)
  return decoded
}

export function getRedeemScript(
  paymentPublicKey: string,
  network: NetworkType
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

export async function waitForTransaction(
  txId: string,
  network: NetworkType
): Promise<boolean> {
  const timeout: number = 60000
  const startTime: number = Date.now()
  while (true) {
    try {
      const tx = await getTransactionMempoolSpace(txId, network)
      if (tx) {
        console.log('Transaction found in mempool:', txId)
        return true
      }

      if (Date.now() - startTime > timeout) {
        return false
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch {
      if (Date.now() - startTime > timeout) {
        return false
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

export async function getOutputValueByVOutIndex(
  commitTxId: string,
  vOut: number,
  network: NetworkType
): Promise<number | null> {
  const timeout: number = 60000
  const startTime: number = Date.now()

  while (true) {
    try {
      const rawTx = await getTransactionMempoolSpace(commitTxId, network)

      if (rawTx?.vout && rawTx.vout.length > 0) {
        return Math.floor(rawTx.vout[vOut].value)
      }

      if (Date.now() - startTime > timeout) {
        return null
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      console.error('Error fetching transaction output value:', error)
      if (Date.now() - startTime > timeout) {
        return null
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}
