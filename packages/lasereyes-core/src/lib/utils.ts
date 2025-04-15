import _ from 'lodash'

export const isBase64 = (str: string): boolean => {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
  return base64Regex.test(str)
}

export const isHex = (str: string): boolean => {
  const hexRegex = /^[a-fA-F0-9]+$/
  return hexRegex.test(str)
}

export const encodeVarint = (bigIntValue: any) => {
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

export function omitUndefined(obj: any) {
  return _.omitBy(obj, _.isUndefined)
}
