import { ripemd160 } from '@noble/hashes/ripemd160'
import { sha256 } from '@noble/hashes/sha256'
import { type NETWORK, p2tr, Script, type Transaction } from '@scure/btc-signer'
import { AddressType } from '../types/psbt'
import type { FormattedUTXO } from '../types/utxo'
import { getAddressType } from './btc'
import { bytesToHex, hexToBytes } from './bytes'

function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data))
}

function toXOnly(pubkey: Uint8Array): Uint8Array {
  return pubkey.subarray(1, 33)
}

export function calculateTaprootTxSize(
  taprootInputCount: number,
  nonTaprootInputCount: number,
  outputCount: number
): number {
  const baseTxSize = 10
  const taprootInputSize = 64
  const nonTaprootInputSize = 42
  const outputSize = 40
  const totalInputSize =
    taprootInputCount * taprootInputSize + nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize
  return baseTxSize + totalInputSize + totalOutputSize
}

export async function addInputForUtxo(
  tx: Transaction,
  utxo: Pick<FormattedUTXO, 'txHash' | 'txOutputIndex' | 'btcValue' | 'address' | 'scriptPubKey'>,
  { pubkey }: { pubkey?: string } = {}
) {
  const type = getAddressType(utxo.address)
  switch (type) {
    case AddressType.P2PKH: {
      tx.addInput({
        txid: utxo.txHash,
        index: +utxo.txOutputIndex,
      })
      break
    }
    case AddressType.P2SH_P2WPKH: {
      if (!pubkey) {
        throw new Error('Pubkey is required for nested SegWit')
      }
      const pubkeyBytes = hexToBytes(pubkey)
      const pubkeyHash = hash160(pubkeyBytes)
      const redeem = Script.encode(['OP_0', pubkeyHash])
      const redeemHash = hash160(redeem)
      tx.addInput({
        txid: utxo.txHash,
        index: +utxo.txOutputIndex,
        redeemScript: redeem,
        witnessUtxo: {
          amount: BigInt(utxo.btcValue),
          script: Script.encode(['HASH160', redeemHash, 'EQUAL']),
        },
      })
      break
    }
    default: {
      tx.addInput({
        txid: utxo.txHash,
        index: +utxo.txOutputIndex,
        witnessUtxo: {
          amount: BigInt(utxo.btcValue),
          script: hexToBytes(utxo.scriptPubKey),
        },
      })
    }
  }
}

export function findXAmountOfSats(utxos: FormattedUTXO[], target: number) {
  let totalAmount = 0
  const selectedUtxos: FormattedUTXO[] = []

  for (const utxo of utxos) {
    if (totalAmount >= target) break
    selectedUtxos.push(utxo)
    totalAmount += utxo.btcValue
  }
  return {
    utxos: selectedUtxos,
    totalAmount,
  }
}

export const formatInputsToSign = async ({
  _psbt,
  senderPublicKey,
  network,
}: {
  _psbt: Transaction
  senderPublicKey: string
  network: typeof NETWORK
}) => {
  for (let index = 0; index < _psbt.inputsLength; index++) {
    const v = _psbt.getInput(index)
    const isSigned = v.finalScriptSig || v.finalScriptWitness
    const lostInternalPubkey = !v.tapInternalKey
    if (!isSigned || lostInternalPubkey) {
      const tapInternalKey = toXOnly(hexToBytes(senderPublicKey))
      const p2trPayment = p2tr(tapInternalKey, undefined, network)
      if (v.witnessUtxo && bytesToHex(v.witnessUtxo.script) === bytesToHex(p2trPayment.script)) {
        _psbt.updateInput(index, {
          tapInternalKey,
        })
      }
    }
  }

  return _psbt
}

export const inscriptionSats = 546n
