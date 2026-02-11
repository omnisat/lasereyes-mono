import { crypto, type Network, opcodes, type Psbt, payments, script } from 'bitcoinjs-lib'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import type { FormattedUTXO } from '../types/utxo'

export function estimateTxSize(psbt: Psbt) {
  const tx = psbt.extractTransaction()
  const size = tx.virtualSize
  return size
}

export enum AddressType {
  P2PKH = 0,
  P2TR = 1,
  P2SH_P2WPKH = 2,
  P2WPKH = 3,
}

export function calculateTaprootTxSize(
  taprootInputCount: number,
  nonTaprootInputCount: number,
  outputCount: number
): number {
  const baseTxSize = 10 // Base transaction size without inputs/outputs

  // Size contributions from inputs
  const taprootInputSize = 64 // Average size of a Taproot input (can vary)
  const nonTaprootInputSize = 42 // Average size of a non-Taproot input (can vary)

  const outputSize = 40

  const totalInputSize =
    taprootInputCount * taprootInputSize + nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize

  return baseTxSize + totalInputSize + totalOutputSize
}

export const minimumFee = ({
  taprootInputCount,
  nonTaprootInputCount,
  outputCount,
}: {
  taprootInputCount: number
  nonTaprootInputCount: number
  outputCount: number
}) => {
  return calculateTaprootTxSize(taprootInputCount, nonTaprootInputCount, outputCount)
}

export const inscriptionSats = 546n

export const addressFormats = {
  mainnet: {
    p2pkh: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2wpkh: /^(bc1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2wsh: /^(bc1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2tr: /^(bc1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
  },
  testnet: {
    p2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2wpkh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2wsh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2tr: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
  },
  signet: {
    p2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2wpkh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2wsh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2tr: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
  },
  regtest: {
    p2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2wpkh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2wsh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2tr: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
  },
} as const

export function getAddressType(address: string): AddressType | null {
  if (
    addressFormats.mainnet.p2pkh.test(address) ||
    addressFormats.testnet.p2pkh.test(address) ||
    addressFormats.regtest.p2pkh.test(address)
  ) {
    return AddressType.P2PKH
  }
  if (
    addressFormats.mainnet.p2tr.test(address) ||
    addressFormats.testnet.p2tr.test(address) ||
    addressFormats.regtest.p2tr.test(address)
  ) {
    return AddressType.P2TR
  }
  if (
    addressFormats.mainnet.p2sh.test(address) ||
    addressFormats.testnet.p2sh.test(address) ||
    addressFormats.regtest.p2sh.test(address)
  ) {
    return AddressType.P2SH_P2WPKH
  }
  if (
    addressFormats.mainnet.p2wpkh.test(address) ||
    addressFormats.testnet.p2wpkh.test(address) ||
    addressFormats.regtest.p2wpkh.test(address)
  ) {
    return AddressType.P2WPKH
  }
  return null
}

export async function addInputForUtxo(
  psbt: Psbt,
  utxo: Pick<FormattedUTXO, 'txHash' | 'txOutputIndex' | 'btcValue' | 'address' | 'scriptPubKey'>,
  {
    pubkey,
  }: {
    pubkey?: string
  } = {}
) {
  const type = getAddressType(utxo.address)
  switch (type) {
    case 0: {
      // legacy P2PKH
      // TODO: Implement this
      // const prevHex = await provider.esplora.getTxHex(utxo.txId)
      psbt.addInput({
        hash: utxo.txHash,
        index: +utxo.txOutputIndex,
        // nonWitnessUtxo: Buffer.from(prevHex, 'hex'),
      })
      break
    }
    case 2: {
      // nested SegWit
      if (!pubkey) {
        throw new Error('Pubkey is required for nested SegWit')
      }
      const redeem = script.compile([opcodes.OP_0, crypto.hash160(Buffer.from(pubkey, 'hex'))])
      psbt.addInput({
        hash: utxo.txHash,
        index: +utxo.txOutputIndex,
        redeemScript: redeem,
        witnessUtxo: {
          value: BigInt(utxo.btcValue),
          script: script.compile([opcodes.OP_HASH160, crypto.hash160(redeem), opcodes.OP_EQUAL]),
        },
      })
      break
    }
    default: {
      psbt.addInput({
        hash: utxo.txHash,
        index: +utxo.txOutputIndex,
        witnessUtxo: {
          value: BigInt(utxo.btcValue),
          script: Buffer.from(utxo.scriptPubKey, 'hex'),
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
  _psbt: Psbt
  senderPublicKey: string
  network: Network
}) => {
  let index = 0
  for await (const v of _psbt.data.inputs) {
    const isSigned = v.finalScriptSig || v.finalScriptWitness
    const lostInternalPubkey = !v.tapInternalKey
    if (!isSigned || lostInternalPubkey) {
      const tapInternalKey = toXOnly(Buffer.from(senderPublicKey, 'hex'))
      const p2tr = payments.p2tr({
        internalPubkey: tapInternalKey,
        network: network,
      })
      if (
        (v.witnessUtxo && Buffer.from(v.witnessUtxo.script).toString('hex')) ===
        (p2tr.output && Buffer.from(p2tr.output).toString('hex'))
      ) {
        _psbt.updateInput(index, {
          tapInternalKey,
        })
      }
    }
    index++
  }

  return _psbt
}
