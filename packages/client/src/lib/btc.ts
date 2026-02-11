import { Address, OutScript, p2sh, p2wpkh } from '@scure/btc-signer'
import type { NetworkType } from '../types'
import { AddressType } from '../types/psbt'
import { hexToBytes } from './bytes'
import { getBitcoinNetwork } from './helpers'

export const getAddressType = (address: string): AddressType | null => {
  // P2PKH: starts with 1 (mainnet) or m/n (testnet)
  if (
    /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
    /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
  ) {
    return AddressType.P2PKH
  }
  // P2TR: starts with bc1p (mainnet) or tb1p/bcrt1p (testnet)
  if (
    /^(bc1p)[a-zA-HJ-NP-Z0-9]{14,74}$/.test(address) ||
    /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/.test(address)
  ) {
    return AddressType.P2TR
  }
  // P2SH: starts with 3 (mainnet) or 2 (testnet)
  if (
    /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
    /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
  ) {
    return AddressType.P2SH_P2WPKH
  }
  // P2WPKH: starts with bc1q (mainnet) or tb1q/bcrt1q (testnet)
  if (
    /^(bc1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/.test(address) ||
    /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/.test(address)
  ) {
    return AddressType.P2WPKH
  }
  return null
}

export const getAddressScriptPubKey = (address: string, network: NetworkType): Uint8Array => {
  const net = getBitcoinNetwork(network)
  return OutScript.encode(Address(net).decode(address))
}

export function getRedeemScript(
  paymentPublicKey: string,
  network: NetworkType
): Uint8Array | undefined {
  const net = getBitcoinNetwork(network)
  const pubkey = hexToBytes(paymentPublicKey)
  const p2wpkhPayment = p2wpkh(pubkey, net)
  const p2shPayment = p2sh(p2wpkhPayment, net)
  return p2shPayment.redeemScript
}
