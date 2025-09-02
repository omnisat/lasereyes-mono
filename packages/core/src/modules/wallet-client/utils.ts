import { fromBase64, fromHex, toBase64, toHex } from "uint8array-tools"
import { isBase64, isHex } from "../../lib/utils"

export function toHexPrefixed<T extends string | number | bigint | boolean | null | undefined>(str: T): `0x${string}` {
  if (!str) return '0x'
  if ((typeof str === 'string')) {
    if (str.startsWith("0x")) return str as `0x${string}`
    return `0x${str}`
  }
  return `0x${BigInt(str).toString(16)}`
}

export function psbtToHex(psbt: string): string {
  if (isHex(psbt)) return psbt;
  if (isBase64(psbt)) {
    const buffer = fromBase64(psbt)
    return toHex(buffer)
  }
  throw new Error("Invalid psbt format")
}

export function psbtToBase64(psbt: string): string {
  if (isHex(psbt)) {
    const buffer = fromHex(psbt)
    return toBase64(buffer)
  }
  if (isBase64(psbt)) return psbt;
  throw new Error("Invalid psbt format")
}

export function getDeviceInfo(): {
  isMobile: boolean
  isDesktop: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  userAgent: string
} {
  const userAgent = navigator.userAgent.toLowerCase()

  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  const isMobile = mobileRegex.test(userAgent)

  const tabletRegex = /ipad|android(?!.*mobile)|tablet/i
  const isTablet = tabletRegex.test(userAgent)

  const hasTouchScreen =
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  const hasSmallScreen = window.innerWidth <= 768

  let deviceType: 'mobile' | 'tablet' | 'desktop'
  if (isTablet) {
    deviceType = 'tablet'
  } else if (isMobile || (hasTouchScreen && hasSmallScreen)) {
    deviceType = 'mobile'
  } else {
    deviceType = 'desktop'
  }

  return {
    isMobile: deviceType === 'mobile' || deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    deviceType,
    userAgent: navigator.userAgent,
  }
}

export function isMobile(): boolean {
  return getDeviceInfo().isMobile
}

export function isDesktop(): boolean {
  return getDeviceInfo().isDesktop
}

export function getSuggestedConnectionMethod():
  | 'qr-code'
  | 'deep-link'
  | 'browser-extension'
  | 'web-wallet' {
  const deviceInfo = getDeviceInfo()

  if (deviceInfo.deviceType === 'mobile') {
    return 'deep-link'
  } else if (deviceInfo.deviceType === 'tablet') {
    return 'qr-code'
  } else {
    return 'browser-extension'
  }
}
