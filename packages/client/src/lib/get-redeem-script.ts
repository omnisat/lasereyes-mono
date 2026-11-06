import { p2sh, p2wpkh } from '@scure/btc-signer'
import type { NetworkType } from '../chains'
import { getBitcoinNetwork } from './bitcoin-network'
import { hexToBytes } from './bytes'

/**
 * Build the P2SH redeem script wrapping a P2WPKH payment.
 *
 * Pulls `@scure/btc-signer`.
 */
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
