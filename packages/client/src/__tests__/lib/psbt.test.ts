import { hex } from '@scure/base'
import { p2tr, p2wpkh, Transaction } from '@scure/btc-signer'
import { describe, expect, it } from 'vitest'
import { PsbtBuildError } from '../../errors'
import { buildSendBtcPsbt } from '../../lib/build-send-btc-psbt'
import { calculateTaprootTxSize } from '../../lib/tx-size'
import type { UTXO } from '../../types'

describe('calculateTaprootTxSize', () => {
  it('computes known size for 1 taproot input, 0 non-taproot, 2 outputs', () => {
    expect(calculateTaprootTxSize(1, 0, 2)).toBe(10 + 64 + 80)
  })

  it('computes known size for 0 taproot, 1 non-taproot, 1 output', () => {
    expect(calculateTaprootTxSize(0, 1, 1)).toBe(10 + 42 + 40)
  })
})

describe('buildSendBtcPsbt — taproot inputs', () => {
  // The secp256k1 generator point's x-coordinate — a valid x-only pubkey we
  // can use as a deterministic taproot internal key. Deriving the address
  // from it (below) keeps the address and key genuinely correspondent.
  const internalXOnly = '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
  const compressed = `02${internalXOnly}` // G.y is even → 0x02 prefix
  const taprootAddress = p2tr(hex.decode(internalXOnly)).address as string
  const segwitAddress = p2wpkh(hex.decode(compressed)).address as string

  const utxo = (value: number): UTXO => ({
    txid: 'ab'.repeat(32),
    vout: 0,
    value,
    status: { confirmed: true, block_height: 0, block_hash: '', block_time: 0 },
  })

  const tapInternalKeyOf = (psbtHex: string) =>
    Transaction.fromPSBT(hex.decode(psbtHex)).getInput(0).tapInternalKey

  it('sets tapInternalKey (x-only) on a P2TR input', () => {
    const { psbtHex } = buildSendBtcPsbt({
      utxos: [utxo(100_000)],
      toAddress: taprootAddress,
      amount: 1000,
      changeAddress: taprootAddress,
      feeRate: 1,
      network: 'mainnet',
      publicKey: compressed, // 33-byte compressed — builder must x-only it
    })

    // Without this field Xverse signs nothing ("no taproot inputs signed").
    expect(tapInternalKeyOf(psbtHex)).toEqual(hex.decode(internalXOnly))
  })

  it('throws PsbtBuildError when a P2TR spend has no publicKey', () => {
    expect(() =>
      buildSendBtcPsbt({
        utxos: [utxo(100_000)],
        toAddress: taprootAddress,
        amount: 1000,
        changeAddress: taprootAddress,
        feeRate: 1,
        network: 'mainnet',
        // publicKey intentionally omitted
      })
    ).toThrow(PsbtBuildError)
  })

  it('does not set tapInternalKey on a non-taproot (P2WPKH) input', () => {
    const { psbtHex } = buildSendBtcPsbt({
      utxos: [utxo(100_000)],
      toAddress: segwitAddress,
      amount: 1000,
      changeAddress: segwitAddress,
      feeRate: 1,
      network: 'mainnet',
      // P2WPKH needs no publicKey to be built
    })

    expect(tapInternalKeyOf(psbtHex)).toBeUndefined()
  })
})
