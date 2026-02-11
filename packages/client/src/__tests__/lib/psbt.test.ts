import { Transaction } from '@scure/btc-signer'
import { describe, expect, it } from 'vitest'
import { hexToBytes } from '../../lib/bytes'
import { addInputForUtxo, calculateTaprootTxSize, findXAmountOfSats } from '../../lib/psbt'
import type { FormattedUTXO } from '../../types/utxo'

const MOCK_TXID = 'aaaa'.repeat(16)
const MOCK_SCRIPT_PK = '0014751e76e8199196d454941c45d1b3a323f1433bd6'
const MOCK_PUBKEY = '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'

function makeUtxo(
  overrides: Partial<
    Pick<FormattedUTXO, 'txHash' | 'txOutputIndex' | 'btcValue' | 'address' | 'scriptPubKey'>
  > = {}
): Pick<FormattedUTXO, 'txHash' | 'txOutputIndex' | 'btcValue' | 'address' | 'scriptPubKey'> {
  return {
    txHash: MOCK_TXID,
    txOutputIndex: 0,
    btcValue: 100000,
    address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    scriptPubKey: MOCK_SCRIPT_PK,
    ...overrides,
  }
}

describe('addInputForUtxo', () => {
  it('adds P2PKH input with hash and index', async () => {
    const tx = new Transaction()
    await addInputForUtxo(tx, makeUtxo({ address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' }))
    expect(tx.inputsLength).toBe(1)
  })

  it('adds P2SH_P2WPKH input with redeemScript and witnessUtxo', async () => {
    const tx = new Transaction()
    await addInputForUtxo(tx, makeUtxo({ address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' }), {
      pubkey: MOCK_PUBKEY,
    })
    expect(tx.inputsLength).toBe(1)
    const input = tx.getInput(0)
    expect(input.redeemScript).toBeDefined()
    expect(input.witnessUtxo).toBeDefined()
  })

  it('adds P2WPKH input with witnessUtxo', async () => {
    const tx = new Transaction()
    await addInputForUtxo(tx, makeUtxo())
    expect(tx.inputsLength).toBe(1)
    const input = tx.getInput(0)
    expect(input.witnessUtxo).toBeDefined()
    expect(input.witnessUtxo!.script).toEqual(hexToBytes(MOCK_SCRIPT_PK))
  })

  it('throws when P2SH_P2WPKH without pubkey', async () => {
    const tx = new Transaction()
    await expect(
      addInputForUtxo(tx, makeUtxo({ address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' }))
    ).rejects.toThrow('Pubkey is required')
  })
})

describe('calculateTaprootTxSize', () => {
  it('computes known size for 1 taproot input, 0 non-taproot, 2 outputs', () => {
    expect(calculateTaprootTxSize(1, 0, 2)).toBe(10 + 64 + 80)
  })

  it('computes known size for 0 taproot, 1 non-taproot, 1 output', () => {
    expect(calculateTaprootTxSize(0, 1, 1)).toBe(10 + 42 + 40)
  })
})

describe('findXAmountOfSats', () => {
  const utxos: FormattedUTXO[] = [
    {
      txHash: 'a'.repeat(64),
      txOutputIndex: 0,
      btcValue: 50000,
      scriptPubKey: '',
      address: '',
      hasRunes: false,
      runes: [],
      hasAlkanes: false,
      alkanes: [],
      hasInscriptions: false,
      inscriptions: [],
    },
    {
      txHash: 'b'.repeat(64),
      txOutputIndex: 0,
      btcValue: 30000,
      scriptPubKey: '',
      address: '',
      hasRunes: false,
      runes: [],
      hasAlkanes: false,
      alkanes: [],
      hasInscriptions: false,
      inscriptions: [],
    },
    {
      txHash: 'c'.repeat(64),
      txOutputIndex: 0,
      btcValue: 20000,
      scriptPubKey: '',
      address: '',
      hasRunes: false,
      runes: [],
      hasAlkanes: false,
      alkanes: [],
      hasInscriptions: false,
      inscriptions: [],
    },
  ]

  it('selects correct subset to meet target', () => {
    const result = findXAmountOfSats(utxos, 60000)
    expect(result.utxos).toHaveLength(2)
    expect(result.totalAmount).toBe(80000)
  })

  it('returns all UTXOs when target exceeds total', () => {
    const result = findXAmountOfSats(utxos, 200000)
    expect(result.utxos).toHaveLength(3)
    expect(result.totalAmount).toBe(100000)
  })

  it('selects first UTXO when it meets target', () => {
    const result = findXAmountOfSats(utxos, 50000)
    expect(result.utxos).toHaveLength(1)
    expect(result.totalAmount).toBe(50000)
  })
})
