import _ from 'lodash'
import { FormattedUTXO } from '../types/utxo'
import { AlkaneId } from 'alkanes'

export const isBase64 = (str: string): boolean => {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
  return base64Regex.test(str)
}

export const isHex = (str: string): boolean => {
  const hexRegex = /^[a-fA-F0-9]+$/
  return hexRegex.test(str)
}

export const encodeVarint = (bigIntValue: bigint) => {
  const bufferArray = []
  let num = bigIntValue

  do {
    let byte = num & BigInt(0x7f)
    num >>= BigInt(7)
    if (num !== BigInt(0)) {
      byte |= BigInt(0x80)
    }
    bufferArray.push(Number(byte))
  } while (num !== BigInt(0))

  return { varint: Buffer.from(bufferArray) }
}

export function omitUndefined(obj: object) {
  return _.omitBy(obj, _.isUndefined)
}

export const toBigEndian = (rawLeTxid: string) =>
  Buffer.from(rawLeTxid, 'hex').reverse().toString('hex')

export const toLittleEndian = (rawBeTxid: string) =>
  Buffer.from(rawBeTxid, 'hex').reverse().toString('hex')

export const filterSpendableUTXOs = (
  utxos: FormattedUTXO[]
): {
  utxos: FormattedUTXO[]
  totalAmount: bigint
} => {
  let totalAmount = 0n
  const selectedUTXOs: FormattedUTXO[] = []

  for (const utxo of utxos) {
    if (
      utxo.inscriptions.length <= 0 &&
      utxo.runes.length <= 0 &&
      utxo.alkanes.length <= 0 &&
      utxo.btcValue !== 546 &&
      utxo.btcValue !== 330
    ) {
      selectedUTXOs.push(utxo)
      totalAmount += BigInt(utxo.btcValue)
    }
  }

  return {
    utxos: selectedUTXOs,
    totalAmount,
  }
}

export const selectSpendableUTXOs = (
  utxos: FormattedUTXO[],
  targetAmount: bigint
): {
  utxos: FormattedUTXO[]
  totalAmount: bigint
} => {
  const spendableUTXOs = filterSpendableUTXOs(utxos)
  let selectedAmount = 0n

  spendableUTXOs.utxos.sort((a, b) => b.btcValue - a.btcValue)

  let selectedUTXOs: FormattedUTXO[] = []

  for (const utxo of spendableUTXOs.utxos) {
    selectedUTXOs.push(utxo)
    selectedAmount += BigInt(utxo.btcValue)
    if (selectedAmount >= targetAmount) break
  }

  return {
    utxos: selectedUTXOs,
    totalAmount: selectedAmount,
  }
}

function alkaneIdToString(id: AlkaneId): string {
  return `${id.block}:${id.tx}`
}

export const selectAlkanesUTXOs = (
  utxos: FormattedUTXO[],
  alkaneId: AlkaneId,
  targetAlkanesAmount: bigint
): {
  utxos: FormattedUTXO[]
  totalBtcAmount: bigint
  totalAlkanesAmount: bigint
} => {
  let totalBtcAmount = 0n
  let totalAlkanesAmount = 0n
  const selectedUTXOs: FormattedUTXO[] = []

  for (const utxo of utxos) {
    if (utxo.alkanes.length > 0) {
      const alkane = utxo.alkanes.find((a) => a.id === alkaneIdToString(alkaneId))
      if (alkane) {
        selectedUTXOs.push(utxo)
        totalBtcAmount += BigInt(utxo.btcValue)
        totalAlkanesAmount += BigInt(alkane.amount)
        if (totalAlkanesAmount >= targetAlkanesAmount) break
      }
    }
  }

  if (totalAlkanesAmount < targetAlkanesAmount) {
    throw new Error('Not enough alkanes')
  } 

  return {
    utxos: selectedUTXOs,
    totalBtcAmount,
    totalAlkanesAmount,
  }
}