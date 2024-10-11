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
