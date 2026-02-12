import { base64, hex } from '@scure/base'
import * as btc from '@scure/btc-signer'
import { Transaction } from '@scure/btc-signer'
import { describe, expect, it } from 'vitest'
import { btcActions } from '../../actions/btc'
import { createClient } from '../../client'
import { createChainDataSource } from '../../data-source'
import { InsufficientFundsError, PsbtBuildError } from '../../errors'
import type { BaseCapability, DataSourceContext, UTXO } from '../../types'

const mockUtxos: UTXO[] = [
  {
    txid: 'aaaa'.repeat(16),
    vout: 0,
    status: {
      confirmed: true,
      block_height: 800000,
      block_hash: 'bbbb'.repeat(16),
      block_time: 1700000000,
    },
    value: 100000,
  },
  {
    txid: 'cccc'.repeat(16),
    vout: 1,
    status: {
      confirmed: true,
      block_height: 800001,
      block_hash: 'dddd'.repeat(16),
      block_time: 1700001000,
    },
    value: 50000,
  },
]

function makeMockDs(utxos: UTXO[] = mockUtxos) {
  return createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
    group: 'base',
    methods: {
      getBalance: async (_addr: string) =>
        utxos.reduce((sum, u) => sum + BigInt(u.value), 0n).toString(),
      getUtxos: async (_addr: string) => ({ data: utxos }),
      getTransaction: async (_txId: string) => ({
        txid: 'mock',
        version: 2,
        locktime: 0,
        vin: [],
        vout: [
          {
            scriptpubkey: '',
            scriptpubkey_asm: '',
            scriptpubkey_type: '',
            scriptpubkey_address: '',
            value: 1000,
          },
        ],
        size: 100,
        weight: 400,
        fee: 300,
        status: { confirmed: true, block_height: 1, block_hash: '', block_time: 0 },
      }),
      broadcastTransaction: async (_rawTx: string) => 'txid_broadcast',
      getRecommendedFees: async () => ({ fastFee: 10, minFee: 1 }),
      getOutputValue: async (_txId: string, _vout: number) => 546 as number | null,
      waitForTransaction: async (_txId: string) => true,
    } satisfies BaseCapability,
  }))
}

const P2WPKH_ADDR = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
const PUBKEY = '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'

describe('btcActions', () => {
  it('should delegate getBalance to data source', async () => {
    const ds = makeMockDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
    const balance = await client.getBalance('bc1qtest')
    expect(balance).toBe('150000')
  })

  it('should delegate getUtxos to data source', async () => {
    const ds = makeMockDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
    const result = await client.getUtxos('bc1qtest')
    expect(result.data).toHaveLength(2)
  })

  it('should delegate getRecommendedFees to data source', async () => {
    const ds = makeMockDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
    const fees = await client.getRecommendedFees()
    expect(fees.fastFee).toBe(10)
    expect(fees.minFee).toBe(1)
  })

  it('should delegate broadcastTransaction to data source', async () => {
    const ds = makeMockDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
    const txId = await client.broadcastTransaction('rawtx')
    expect(txId).toBe('txid_broadcast')
  })

  it('should create a send BTC PSBT', async () => {
    const ds = makeMockDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
    const result = await client.createSendBtcPsbt({
      fromAddress: P2WPKH_ADDR,
      toAddress: P2WPKH_ADDR,
      amount: 10000,
      paymentAddress: P2WPKH_ADDR,
      paymentPublicKey: PUBKEY,
      feeRate: 5,
    })

    expect(result.psbtBase64).toBeTruthy()
    expect(result.psbtHex).toBeTruthy()
    expect(typeof result.psbtBase64).toBe('string')
    expect(typeof result.psbtHex).toBe('string')
  })

  it('should throw PsbtBuildError for amount <= 0', async () => {
    const ds = makeMockDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())

    await expect(
      client.createSendBtcPsbt({
        fromAddress: 'bc1qtest',
        toAddress: 'bc1qtest2',
        amount: 0,
        paymentAddress: 'bc1qtest',
        paymentPublicKey: 'pubkey',
      })
    ).rejects.toThrow(PsbtBuildError)
  })

  it('should throw InsufficientFundsError when balance too low', async () => {
    const ds = makeMockDs([
      {
        txid: 'aaaa'.repeat(16),
        vout: 0,
        status: { confirmed: true, block_height: 1, block_hash: '', block_time: 0 },
        value: 100,
      },
    ])
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())

    await expect(
      client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 1000000,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
      })
    ).rejects.toThrow(InsufficientFundsError)
  })

  it('should throw PsbtBuildError when no UTXOs found', async () => {
    const ds = makeMockDs([])
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())

    await expect(
      client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 1000,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
      })
    ).rejects.toThrow(PsbtBuildError)
  })

  describe('PSBT structure verification', () => {
    it('PSBT has correct input count with 1 sufficient UTXO', async () => {
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 10000,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
        feeRate: 5,
      })

      const tx = Transaction.fromPSBT(base64.decode(result.psbtBase64))
      expect(tx.inputsLength).toBe(1)
    })

    it('PSBT has 2 outputs when change is needed', async () => {
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 10000,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
        feeRate: 5,
      })

      const tx = Transaction.fromPSBT(base64.decode(result.psbtBase64))
      expect(tx.outputsLength).toBe(2)
    })

    it('PSBT has 1 output when no change is needed', async () => {
      // estimateTxSize(1, 0, 2) = 10 + 57 + 68 = 135
      // satsNeeded = floor(135 * 5) + amount = 675 + amount
      // We need amount + 675 === utxo value => amount = 100000 - 675 = 99325
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 99325,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
        feeRate: 5,
      })

      const tx = Transaction.fromPSBT(base64.decode(result.psbtBase64))
      expect(tx.outputsLength).toBe(1)
    })

    it('PSBT output values are correct', async () => {
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      const amount = 10000
      const feeRate = 5
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
        feeRate,
      })

      const tx = Transaction.fromPSBT(base64.decode(result.psbtBase64))
      const recipientOutput = tx.getOutput(0)
      expect(recipientOutput.amount).toBe(BigInt(amount))

      // change = gathered(100000) - satsNeeded(floor(135 * 5) + 10000) = 100000 - 10675 = 89325
      const changeOutput = tx.getOutput(1)
      expect(changeOutput.amount).toBe(BigInt(89325))
    })

    it('multiple UTXOs gathered when needed', async () => {
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      // Amount > single UTXO (100000), needs both
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 100000,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
        feeRate: 5,
      })

      const tx = Transaction.fromPSBT(base64.decode(result.psbtBase64))
      expect(tx.inputsLength).toBe(2)
    })

    it('PSBT base64 is decodable', async () => {
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 10000,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
        feeRate: 5,
      })

      expect(() => Transaction.fromPSBT(base64.decode(result.psbtBase64))).not.toThrow()
    })

    it('PSBT hex matches base64', async () => {
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 10000,
        paymentAddress: P2WPKH_ADDR,
        paymentPublicKey: PUBKEY,
        feeRate: 5,
      })

      const fromBase64 = Transaction.fromPSBT(base64.decode(result.psbtBase64))
      const fromHex = Transaction.fromPSBT(hex.decode(result.psbtHex))

      expect(fromBase64.inputsLength).toBe(fromHex.inputsLength)
      expect(fromBase64.outputsLength).toBe(fromHex.outputsLength)
      expect(fromBase64.getOutput(0).amount).toBe(fromHex.getOutput(0).amount)
    })

    it('P2SH-P2WPKH includes redeemScript', async () => {
      const pubkeyBytes = hex.decode(PUBKEY)
      const p2shPayment = btc.p2sh(btc.p2wpkh(pubkeyBytes, btc.NETWORK), btc.NETWORK)
      const p2shAddr = p2shPayment.address!
      const ds = makeMockDs()
      const client = createClient({ network: 'mainnet', dataSource: ds }).extend(btcActions())
      const result = await client.createSendBtcPsbt({
        fromAddress: P2WPKH_ADDR,
        toAddress: P2WPKH_ADDR,
        amount: 10000,
        paymentAddress: p2shAddr,
        paymentPublicKey: PUBKEY,
        feeRate: 5,
      })

      const tx = Transaction.fromPSBT(base64.decode(result.psbtBase64))
      const input = tx.getInput(0)
      expect(input.redeemScript).toBeDefined()
      expect(input.redeemScript!.length).toBeGreaterThan(0)
    })
  })
})
