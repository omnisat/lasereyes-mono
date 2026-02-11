import { u32 } from '@magiceden-oss/runestone-lib/dist/src/integer'
import { u128 } from '@magiceden-oss/runestone-lib/dist/src/integer/u128'
import type { Account } from '@oyl/sdk/lib/account'
import {
  type AlkaneId,
  encipher,
  encodeRunestoneProtostone,
  ProtoStone,
} from 'alkanes/lib/index.js'
import { ProtoruneRuneId } from 'alkanes/lib/protorune/protoruneruneid'
import * as bitcoin from 'bitcoinjs-lib'
import { getBitcoinNetwork } from '../../../lib/helpers'
import {
  addInputForUtxo,
  calculateTaprootTxSize,
  findXAmountOfSats,
  formatInputsToSign,
  inscriptionSats,
} from '../../../lib/psbt'
import type { NetworkType } from '../../../types'
import type { FormattedUTXO } from '../../../types/utxo'
import type { LaserEyesClient } from '../..'

export const MINIMUM_RELAY_VALUE = BigInt(546)
export const MINT_OPCODE = 77

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
  targetNumberOfAlkanes: bigint
}) => {
  const res = await client.dataSourceManager.getAlkanesByAddress(address)

  const matchingRunesWithOutpoints = res.flatMap(outpoint =>
    outpoint.runes
      .filter(
        value =>
          Number(value.rune.id.block) === Number(alkaneId.block) &&
          Number(value.rune.id.tx) === Number(alkaneId.tx)
      )
      .map(rune => ({ rune, outpoint }))
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
    if (totalBalanceBeingSent < targetNumberOfAlkanes && Number(alkane.rune.balance) > 0) {
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
        (alkane.rune.rune.divisibility === 1 ? 1 : 10 ** alkane.rune.rune.divisibility)
    }
  }
  if (totalBalanceBeingSent < targetNumberOfAlkanes) {
    throw new Error('Insuffiecient balance of alkanes.')
  }
  return { alkaneUtxos, totalSatoshis, totalBalanceBeingSent }
}

export const createSendPsbt = async ({
  utxos,
  account,
  alkaneId,
  client,
  toAddress,
  amount,
  feeRate,
  fee,
}: {
  utxos: FormattedUTXO[]
  account: Account
  alkaneId: { block: string; tx: string }
  client: LaserEyesClient
  toAddress: string
  amount: bigint
  feeRate: number
  fee?: number
}) => {
  const originalGatheredUtxos = {
    utxos,
    totalAmount: utxos.reduce((acc, utxo) => acc + utxo.btcValue, 0),
  }

  const minTxSize = calculateTaprootTxSize(2, 0, 4)
  const calculatedFee = BigInt(Math.max(minTxSize * feeRate, 250))
  let finalFee = fee ? BigInt(fee) : calculatedFee

  let gatheredUtxos = findXAmountOfSats(
    originalGatheredUtxos.utxos,
    Number(finalFee) + Number(inscriptionSats) * 4
  )

  const calldata = [BigInt(2), BigInt(100), BigInt(77)]

  const protostone23 = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.message({
        protocolTag: 1n,
        pointer: 0,
        refundPointer: 0,
        calldata: encipher(calldata),
        edicts: [],
      }),
    ],
  }).encodedRunestone

  console.log('protostone23', protostone23.toString('hex'))

  if (gatheredUtxos.totalAmount < finalFee + inscriptionSats) {
    console.log('gatheredUtxos.totalAmount', gatheredUtxos.totalAmount)
    throw new Error('Insufficient Balanceeeee')
  }

  if (gatheredUtxos.utxos.length > 1) {
    const txSize = calculateTaprootTxSize(gatheredUtxos.utxos.length, 0, 4)

    finalFee = BigInt(Math.max(txSize * feeRate, 250))
    gatheredUtxos = findXAmountOfSats(
      originalGatheredUtxos.utxos,
      Number(finalFee) + Number(inscriptionSats)
    )
  }

  const targetInputValue = finalFee + inscriptionSats * 2n

  const network = client.$network.get()
  const psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) })

  const { alkaneUtxos } = await findAlkaneUtxos({
    address: account.taproot.address,
    greatestToLeast: account.spendStrategy.utxoSortGreatestToLeast,
    alkaneId,
    client,
    targetNumberOfAlkanes: amount,
  })

  if (alkaneUtxos.length === 0) {
    throw new Error('No Alkane Utxos Found')
  }

  let totalInputValue = 0n
  const usedUTXOSet: Set<string> = new Set()

  for await (const utxo of alkaneUtxos) {
    addInputForUtxo(psbt, {
      txHash: utxo.txId,
      txOutputIndex: utxo.txIndex,
      btcValue: utxo.satoshis,
      scriptPubKey: utxo.script,
      address: utxo.address,
    })
    totalInputValue += BigInt(utxo.satoshis)
    usedUTXOSet.add(`${utxo.txId}:${utxo.txIndex.toString()}`)
  }

  if (gatheredUtxos.totalAmount < targetInputValue) {
    throw new Error('Insufficient Balance')
  }

  for (const utxo of gatheredUtxos.utxos) {
    // The `* 2` here is to account for the input going to the sender and the one going to the receiver
    if (totalInputValue > targetInputValue) {
      break
    }
    if (!usedUTXOSet.has(`${utxo.txHash}:${utxo.txOutputIndex.toString()}`)) {
      addInputForUtxo(psbt, utxo)
      totalInputValue += BigInt(utxo.btcValue)
      // This looks useless but it's good to have it anyways
      usedUTXOSet.add(`${utxo.txHash}:${utxo.txOutputIndex.toString()}`)
    }
  }

  const protostone = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.message({
        protocolTag: 1n,
        edicts: [
          {
            id: new ProtoruneRuneId(u128(BigInt(alkaneId.block)), u128(BigInt(alkaneId.tx))),
            amount: u128(BigInt(amount)),
            output: u32(1n),
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

  psbt.addOutput({ script: protostone, value: 0n })

  const outputTotal = psbt.txOutputs.reduce((sum, o) => sum + o.value, 0n)
  const changeAmount = totalInputValue - outputTotal - finalFee

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

export const createMintExecutePsbt = async ({
  toAddress,
  network,
  alkaneId,
  changeAddress,
  frontendFeeAddress,
  frontendFeeAmount,
  feeRate = 1,
  spendableUtxos,
  inputAlkaneUtxos,
  senderPublicKey,
  inputData,
}: {
  toAddress: string
  network: NetworkType
  alkaneId: AlkaneId
  changeAddress: string
  frontendFeeAddress?: string
  frontendFeeAmount?: bigint
  feeRate?: number
  spendableUtxos: FormattedUTXO[]
  inputAlkaneUtxos: FormattedUTXO[]
  senderPublicKey: string
  inputData?: bigint[]
}) => {
  const calldata = [alkaneId.block, alkaneId.tx, BigInt(MINT_OPCODE), ...(inputData ?? [])]

  const protostone = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.message({
        protocolTag: 1n,
        calldata: encipher(calldata),
        pointer: 0,
        refundPointer: 0,
      }),
    ],
  }).encodedRunestone
  const bitcoinNetwork = getBitcoinNetwork(network)
  const psbt = new bitcoin.Psbt({
    network: bitcoinNetwork,
  })

  const effectiveFeeAmount =
    frontendFeeAddress && frontendFeeAmount && frontendFeeAmount >= MINIMUM_RELAY_VALUE
      ? frontendFeeAmount
      : 0n
  const spendTarget = effectiveFeeAmount + BigInt(inscriptionSats)
  function calculateSize(inputCount: number) {
    return (
      calculateTaprootTxSize(inputCount, 0, 2 + (effectiveFeeAmount > 0 ? 1 : 0)) +
      protostone.byteLength
    )
  }

  const minTxSize = calculateSize(2)
  const minFee = BigInt(Math.ceil(Math.max(minTxSize * feeRate, 250)))
  let spendableUtxosGathered = {
    utxos: spendableUtxos,
    totalAmount: spendableUtxos.reduce((acc, utxo) => acc + utxo.btcValue, 0),
  }

  spendableUtxosGathered = findXAmountOfSats(
    spendableUtxosGathered.utxos,
    Number(minFee) + Number(spendTarget)
  )

  if (spendableUtxosGathered.utxos.length < 1) {
    throw new Error('Insufficient balance')
  }
  const newSize = calculateSize(spendableUtxosGathered.utxos.length)
  const newFee = BigInt(Math.ceil(Math.max(newSize * feeRate, 250)))
  if (spendableUtxosGathered.totalAmount < newFee) {
    spendableUtxosGathered = findXAmountOfSats(
      spendableUtxosGathered.utxos,
      Number(newFee) + Number(spendTarget)
    )
  }
  const finalSize = calculateSize(spendableUtxosGathered.utxos.length)
  const finalFee = BigInt(Math.ceil(Math.max(finalSize * feeRate, 250)))
  if (spendableUtxosGathered.totalAmount < finalFee) {
    throw new Error('Insufficient balance')
  }

  for (const utxo of inputAlkaneUtxos) {
    addInputForUtxo(psbt, utxo)
  }
  for (const utxo of spendableUtxosGathered.utxos) {
    addInputForUtxo(psbt, utxo)
  }

  console.log('protostone byte length', protostone.length)

  // Add output for any output protorunes
  psbt.addOutput({
    value: BigInt(inscriptionSats),
    address: toAddress,
  })

  // OP_RETURN output
  psbt.addOutput({ script: protostone, value: 0n })

  if (frontendFeeAddress && frontendFeeAmount && frontendFeeAmount > 0) {
    psbt.addOutput({
      value: frontendFeeAmount,
      address: frontendFeeAddress,
    })
  }
  const totalAlkanesAmount = inputAlkaneUtxos
    ? inputAlkaneUtxos.reduce((acc, utxo) => acc + BigInt(utxo.btcValue), 0n)
    : 0n

  const inputsTotal = BigInt(spendableUtxosGathered.totalAmount) + totalAlkanesAmount
  const outputsTotal = psbt.txOutputs.reduce((sum, o) => sum + o.value, 0n)

  const change = inputsTotal - outputsTotal - finalFee

  if (change < 0) {
    throw new Error('Insufficient balance')
  }

  if (change >= MINIMUM_RELAY_VALUE) {
    psbt.addOutput({
      address: changeAddress,
      value: change,
    })
  }
  const formattedPsbtTx = await formatInputsToSign({
    _psbt: psbt,
    senderPublicKey,
    network: bitcoinNetwork,
  })

  return {
    psbtBase64: formattedPsbtTx.toBase64(),
    psbtHex: formattedPsbtTx.toHex(),
  }
}
