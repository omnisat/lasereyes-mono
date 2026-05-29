import { type NETWORK, p2tr, type Transaction } from '@scure/btc-signer'
import { bytesToHex, hexToBytes } from './bytes'

function toXOnly(pubkey: Uint8Array): Uint8Array {
  return pubkey.subarray(1, 33)
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
