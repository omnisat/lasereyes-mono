import { ripemd160 } from '@noble/hashes/ripemd160'
import { sha256 } from '@noble/hashes/sha256'
import { Script, type Transaction } from '@scure/btc-signer'
import { AddressType } from '../types/psbt'
import type { FormattedUTXO } from '../types/utxo'
import { hexToBytes } from './bytes'
import { getAddressType } from './get-address-type'

function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data))
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
