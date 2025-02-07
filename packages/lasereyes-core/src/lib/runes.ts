import { encodeRunestone, RunestoneSpec } from '@magiceden-oss/runestone-lib'
import { encodeVarint } from './utils'

export const createRuneMintScript = ({
  runeId,
}: {
  runeId: string
  pointer?: number
}) => {
  const [blockStr, txStr] = runeId.split(':')
  const runestone: RunestoneSpec = {
    mint: {
      block: BigInt(blockStr),
      tx: parseInt(txStr, 10),
    },
  }
  return encodeRunestone(runestone).encodedRunestone
}

export const createRuneEtchScript = ({
  pointer = 0,
  runeName,
  symbol,
  divisibility,
  perMintAmount,
  premine = 0,
  cap,
  turbo,
}: {
  pointer?: number
  runeName: string
  symbol: string
  divisibility?: number
  perMintAmount: number
  cap?: number
  premine?: number
  turbo?: boolean
}) => {
  const runeEtch = encodeRunestone({
    etching: {
      divisibility,
      premine: BigInt(premine),
      runeName,
      symbol,
      terms: {
        cap: cap ? BigInt(cap) : undefined,
        amount: perMintAmount ? BigInt(perMintAmount) : undefined,
      },
      turbo,
    },
    pointer,
  }).encodedRunestone
  return runeEtch
}

export const createRuneSendScript = ({
  runeId,
  amount,
  divisibility = 0,
  sendOutputIndex = 1,
  pointer = 0,
}: {
  runeId: string
  amount: number
  divisibility?: number
  sendOutputIndex?: number
  pointer: number
}) => {
  if (divisibility === 0) {
    amount = Math.floor(amount)
  }
  const pointerFlag = encodeVarint(BigInt(22)).varint
  const pointerVarint = encodeVarint(BigInt(pointer)).varint
  const bodyFlag = encodeVarint(BigInt(0)).varint
  const amountToSend = encodeVarint(BigInt(amount * 10 ** divisibility)).varint
  const encodedOutputIndex = encodeVarint(BigInt(sendOutputIndex)).varint
  const splitIdString = runeId.split(':')
  const block = Number(splitIdString[0])
  const blockTx = Number(splitIdString[1])

  const encodedBlock = encodeVarint(BigInt(block)).varint
  const encodedBlockTxNumber = encodeVarint(BigInt(blockTx)).varint

  const runeStone = Buffer.concat([
    pointerFlag,
    pointerVarint,
    bodyFlag,
    encodedBlock,
    encodedBlockTxNumber,
    amountToSend,
    encodedOutputIndex,
  ])

  let runeStoneLength: string = runeStone.byteLength.toString(16)

  if (runeStoneLength.length % 2 !== 0) {
    runeStoneLength = '0' + runeStone.byteLength.toString(16)
  }

  const script: Buffer = Buffer.concat([
    Buffer.from('6a', 'hex'),
    Buffer.from('5d', 'hex'),
    Buffer.from(runeStoneLength, 'hex'),
    runeStone,
  ])
  return script
}



