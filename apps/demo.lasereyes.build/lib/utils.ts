import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateString(str: string, maxLength: number): string {
  if (str?.length <= maxLength) {
    return str
  } else {
    const leftHalf = str?.slice(0, Math.ceil((maxLength - 3) / 2))
    const rightHalf = str?.slice(-Math.floor((maxLength - 3) / 2))
    return leftHalf + '...' + rightHalf
  }
}

function getMultiplier(decimals: number): bigint {
  return BigInt("1" + "0".repeat(decimals))
}

function throwFault(
  message: string,
  fault: string,
  operation: string,
  value?: any
): never {
  const params: any = { fault: fault, operation: operation }
  if (value !== undefined) {
    params.value = value
  }
  throw new Error(message, {
    cause: params
  })
}

export function parseFixed(value: string, decimals?: number): bigint {
  if (decimals == null) {
    decimals = 0
  }
  const multiplier = getMultiplier(decimals)

  if (typeof value !== 'string' || !value.match(/^-?[0-9.]+$/)) {
    throwFault('invalid decimal value', 'value', value)
  }

  // Is it negative?
  const negative = value.substring(0, 1) === '-'
  if (negative) {
    value = value.substring(1)
  }

  if (value === '.') {
    throwFault('missing value', 'value', value)
  }

  // Split it into a whole and fractional part
  const comps = value.split('.')
  if (comps.length > 2) {
    throwFault('too many decimal points', 'value', value)
  }

  let whole = comps[0],
    fraction = comps[1]
  if (!whole) {
    whole = '0'
  }
  if (!fraction) {
    fraction = '0'
  }

  // Trim trailing zeros
  while (fraction[fraction.length - 1] === '0') {
    fraction = fraction.substring(0, fraction.length - 1)
  }

  // Check the fraction doesn't exceed our decimals size
  if (fraction.length > decimals) {
    throwFault(
      'fractional component exceeds decimals',
      'underflow',
      'parseFixed'
    )
  }

  // If decimals is 0, we have an empty string for fraction
  if (fraction === '') {
    fraction = '0'
  }

  // Fully pad the string with zeros to get to wei
  fraction = fraction.padEnd(decimals, '0')

  const wholeValue = BigInt(whole)
  const fractionValue = BigInt(fraction)

  let wei = wholeValue * multiplier + fractionValue

  if (negative) {
    wei = wei * BigInt(-1)
  }

  return wei
}