import type { Account } from '@oyl/sdk/lib/account'
import type { LaserEyesClient } from '../index'
import { ProtoStone, encodeRunestoneProtostone } from 'alkanes/lib/index.js'
import { ProtoruneRuneId } from 'alkanes/lib/protorune/protoruneruneid'
import * as bitcoin from 'bitcoinjs-lib'
import { getBitcoinNetwork } from '../../lib/helpers'
import {
  findXAmountOfSats,
  formatInputsToSign,
  getAddressType,
  inscriptionSats,
} from '@oyl/sdk/lib/shared/utils'
import { u128 } from '@magiceden-oss/runestone-lib/dist/src/integer/u128'
import { u32 } from '@magiceden-oss/runestone-lib/dist/src/integer'
import type { GatheredUtxos } from '@oyl/sdk/lib/shared/interface'
import { minimumFee } from '@oyl/sdk/lib/btc/btc'
import type { MempoolSpaceFeeRatesResponse } from '../../types/mempool-space'

export const findAlkaneUtxos = async ({
  address,
  greatestToLeast,
  client,
  alkaneId,
  targetNumberOfAlkanes,
}: {
  address: string
  greatestToLeast: boolean
  client: LaserEyesClient
  alkaneId: { block: string; tx: string }
  targetNumberOfAlkanes: number
}) => {
  const res = await client.dataSourceManager.getAlkanesByAddress(address, '1')

  const matchingRunesWithOutpoints = res.flatMap((outpoint) =>
    outpoint.runes
      .filter(
        (value) =>
          Number(value.rune.id.block) === Number(alkaneId.block) &&
          Number(value.rune.id.tx) === Number(alkaneId.tx)
      )
      .map((rune) => ({ rune, outpoint }))
  )

  const sortedRunesWithOutpoints = matchingRunesWithOutpoints.sort((a, b) =>
    greatestToLeast
      ? Number(b.rune.balance) - Number(a.rune.balance)
      : Number(a.rune.balance) - Number(b.rune.balance)
  )

  let totalSatoshis = 0
  let totalBalanceBeingSent = 0
  const alkaneUtxos: {
    txId: string
    txIndex: number
    script: string
    address: string
    amountOfAlkanes: string
    satoshis: number
  }[] = []

  for (const alkane of sortedRunesWithOutpoints) {
    if (
      totalBalanceBeingSent < targetNumberOfAlkanes &&
      Number(alkane.rune.balance) > 0
    ) {
      const satoshis = Number(alkane.outpoint.output.value)
      alkaneUtxos.push({
        txId: alkane.outpoint.outpoint.txid,
        txIndex: alkane.outpoint.outpoint.vout,
        script: alkane.outpoint.output.script,
        address,
        amountOfAlkanes: alkane.rune.balance,
        satoshis,
        ...alkane.rune.rune,
      })
      totalSatoshis += satoshis
      totalBalanceBeingSent +=
        Number(alkane.rune.balance) /
        (alkane.rune.rune.divisibility === 1
          ? 1
          : 10 ** alkane.rune.rune.divisibility)
    }
  }
  if (totalBalanceBeingSent < targetNumberOfAlkanes) {
    throw new Error('Insuffiecient balance of alkanes.')
  }
  return { alkaneUtxos, totalSatoshis, totalBalanceBeingSent }
}

export const createSendPsbt = async ({
  gatheredUtxos,
  account,
  alkaneId,
  client,
  toAddress,
  amount,
  feeRate,
  fee,
}: {
  gatheredUtxos: GatheredUtxos
  account: Account
  alkaneId: { block: string; tx: string }
  client: LaserEyesClient
  toAddress: string
  amount: number
  feeRate: number
  fee?: number
}) => {
  const originalGatheredUtxos = gatheredUtxos

  const minFee = minimumFee({
    taprootInputCount: 2,
    nonTaprootInputCount: 0,
    outputCount: 3,
  })
  const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
  let finalFee = fee ? fee : calculatedFee

  gatheredUtxos = findXAmountOfSats(
    originalGatheredUtxos.utxos,
    Number(finalFee) + Number(inscriptionSats)
  )

  if (gatheredUtxos.utxos.length > 1) {
    const txSize = minimumFee({
      taprootInputCount: gatheredUtxos.utxos.length,
      nonTaprootInputCount: 0,
      outputCount: 3,
    })

    finalFee = Math.max(txSize * feeRate, 250)
    gatheredUtxos = findXAmountOfSats(
      originalGatheredUtxos.utxos,
      Number(finalFee) + Number(inscriptionSats)
    )
  }

  const network = client.$network.get()
  const psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })

  const { alkaneUtxos, totalSatoshis } = await findAlkaneUtxos({
    address: account.taproot.address,
    greatestToLeast: account.spendStrategy.utxoSortGreatestToLeast,
    alkaneId,
    client,
    targetNumberOfAlkanes: amount,
  })

  if (alkaneUtxos.length === 0) {
    throw new Error('No Alkane Utxos Found')
  }

  for await (const utxo of alkaneUtxos) {
    if (getAddressType(utxo.address) === 0) {
      // TODO: Implement this
      // const previousTxHex: string = await client.dataSourceManager.(utxo.txId)
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.txIndex,
        //   nonWitnessUtxo: Buffer.from(previousTxHex, 'hex'),
      })
    }
    if (getAddressType(utxo.address) === 2) {
      const redeemScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_0,
        bitcoin.crypto.hash160(Buffer.from(account.nestedSegwit.pubkey, 'hex')),
      ])

      psbt.addInput({
        hash: utxo.txId,
        index: utxo.txIndex,
        redeemScript: redeemScript,
        witnessUtxo: {
          value: utxo.satoshis,
          script: bitcoin.script.compile([
            bitcoin.opcodes.OP_HASH160,
            bitcoin.crypto.hash160(redeemScript),
            bitcoin.opcodes.OP_EQUAL,
          ]),
        },
      })
    }
    if (
      getAddressType(utxo.address) === 1 ||
      getAddressType(utxo.address) === 3
    ) {
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.txIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.script, 'hex'),
        },
      })
    }
  }

  if (gatheredUtxos.totalAmount < finalFee + inscriptionSats * 2) {
    throw new Error('Insufficient Balance')
  }

  for (let i = 0; i < gatheredUtxos.utxos.length; i++) {
    if (getAddressType(gatheredUtxos.utxos[i].address) === 0) {
      // TODO: Implement this
      // const previousTxHex: string = await client.dataSourceManager.(utxo.txId)
      psbt.addInput({
        hash: gatheredUtxos.utxos[i].txId,
        index: gatheredUtxos.utxos[i].outputIndex,
        //   nonWitnessUtxo: Buffer.from(previousTxHex, 'hex'),
      })
    }
    if (getAddressType(gatheredUtxos.utxos[i].address) === 2) {
      const redeemScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_0,
        bitcoin.crypto.hash160(Buffer.from(account.nestedSegwit.pubkey, 'hex')),
      ])

      psbt.addInput({
        hash: gatheredUtxos.utxos[i].txId,
        index: gatheredUtxos.utxos[i].outputIndex,
        redeemScript: redeemScript,
        witnessUtxo: {
          value: gatheredUtxos.utxos[i].satoshis,
          script: bitcoin.script.compile([
            bitcoin.opcodes.OP_HASH160,
            bitcoin.crypto.hash160(redeemScript),
            bitcoin.opcodes.OP_EQUAL,
          ]),
        },
      })
    }
    if (
      getAddressType(gatheredUtxos.utxos[i].address) === 1 ||
      getAddressType(gatheredUtxos.utxos[i].address) === 3
    ) {
      psbt.addInput({
        hash: gatheredUtxos.utxos[i].txId,
        index: gatheredUtxos.utxos[i].outputIndex,
        witnessUtxo: {
          value: gatheredUtxos.utxos[i].satoshis,
          script: Buffer.from(gatheredUtxos.utxos[i].scriptPk, 'hex'),
        },
      })
    }
  }

  const protostone = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.message({
        protocolTag: 1n,
        edicts: [
          {
            id: new ProtoruneRuneId(
              u128(BigInt(alkaneId.block)),
              u128(BigInt(alkaneId.tx))
            ),
            amount: u128(BigInt(amount)),
            output: u32(BigInt(1)),
          },
        ],
        pointer: 0,
        refundPointer: 0,
        calldata: Buffer.from([]),
      }),
    ],
  }).encodedRunestone

  psbt.addOutput({
    value: inscriptionSats,
    address: account.taproot.address,
  })

  psbt.addOutput({
    value: inscriptionSats,
    address: toAddress,
  })

  const output = { script: protostone, value: 0 }

  psbt.addOutput(output)
  const changeAmount =
    gatheredUtxos.totalAmount + totalSatoshis - (finalFee + inscriptionSats * 2)

  psbt.addOutput({
    address: account[account.spendStrategy.changeAddress].address,
    value: changeAmount,
  })

  const formattedPsbtTx = await formatInputsToSign({
    _psbt: psbt,
    senderPublicKey: account.taproot.pubkey,
    network: getBitcoinNetwork(network),
  })

  return { psbt: formattedPsbtTx.toBase64() }
}

export default class AlkanesModule {
  constructor(private readonly client: LaserEyesClient) {}

  async send(id: string, amount: number, toAddress: string) {
    const { connected, address, publicKey } = this.client.$store.get()
    if (!connected) {
      throw new Error('Client is not connected')
    }

    const alkaneId = {
      block: id.split(':')[0],
      tx: id.split(':')[1],
    }
    if (!alkaneId) {
      throw new Error('Alkane not found')
    }

    const network = this.client.$network.get()
    const bitcoinNetwork = getBitcoinNetwork(network)
    const account: Account = {
      network: bitcoinNetwork,
      spendStrategy: {
        utxoSortGreatestToLeast: true,
        changeAddress: 'taproot',
        addressOrder: ['taproot', 'nestedSegwit', 'legacy', 'nativeSegwit'],
      },
      taproot: {
        address: address,
        pubkey: publicKey,
        pubKeyXOnly: publicKey.slice(2),
        hdPath: `m/84'/1'/0'/0/0`,
      },
      nestedSegwit: {
        address: address,
        pubkey: publicKey,
        hdPath: `m/84'/1'/0'/0/0`,
      },
      legacy: {
        address: address,
        pubkey: publicKey,
        hdPath: `m/49'/1'/0'/0/0`,
      },
      nativeSegwit: {
        address: address,
        pubkey: publicKey,
        hdPath: `m/84'/1'/0'/0/0`,
      },
    }
    const feeRate = await this.client.dataSourceManager.getRecommendedFees()
    const { psbt } = await createSendPsbt({
      gatheredUtxos: { utxos: [], totalAmount: 0 },
      account,
      alkaneId,
      client: this.client,
      toAddress,
      amount,
      feeRate: (feeRate as MempoolSpaceFeeRatesResponse).fastestFee,
    })

    const response = await this.client.signPsbt({ tx: psbt, broadcast: true })
    if (response?.txId) {
      return response.txId
    }
    throw new Error('Failed to sign transaction')
  }
}
