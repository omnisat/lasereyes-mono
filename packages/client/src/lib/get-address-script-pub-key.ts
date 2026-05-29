import { Address, OutScript } from '@scure/btc-signer'
import type { NetworkType } from '../chains'
import { getBitcoinNetwork } from './bitcoin-network'

/**
 * Derive the scriptPubKey (output script) for an address.
 *
 * Pulls `@scure/btc-signer`; keep imports of this module out of any path
 * that must stay crypto-free.
 */
export const getAddressScriptPubKey = (address: string, network: NetworkType): Uint8Array => {
  const net = getBitcoinNetwork(network)
  return OutScript.encode(Address(net).decode(address))
}
