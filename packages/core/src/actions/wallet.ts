/**
 * Wallet (write/signing) actions for LaserEyes Core.
 *
 * @remarks
 * These actions always route directly to the connected connector.
 * They never fall back to a data source — signing operations require
 * an active wallet connection.
 *
 * @module actions/wallet
 */

import type {
  SignedPsbt,
  SignMessageOptions,
  SignPsbtOptions,
} from '@omnisat/lasereyes-client/wallet'
import type { LaserEyesCore } from '../core'

// ============================================================================
// Guard
// ============================================================================

function requireConnector(core: LaserEyesCore) {
  const connector = core.$connector.get()
  if (!connector) throw new Error('No wallet connected')
  return connector
}

// ============================================================================
// Wallet actions
// ============================================================================

/**
 * Send Bitcoin to an address.
 *
 * @param core - LaserEyesCore instance
 * @param to - Recipient Bitcoin address
 * @param amount - Amount to send in satoshis
 * @returns Transaction ID
 *
 * @throws {Error} If no wallet is connected or the user rejects the transaction.
 */
export async function sendBitcoin(
  core: LaserEyesCore,
  to: string,
  amount: number
): Promise<string> {
  const provider = requireConnector(core).getProvider()
  if (!provider) {
    throw new Error('No provider found')
  }
  return (await provider.request('bitcoin_sendBitcoin', { to, amount })) as string
}

/**
 * Sign a PSBT.
 *
 * @param core - LaserEyesCore instance
 * @param psbt - PSBT in hex or base64 format
 * @param options - Optional signing options (finalize, broadcast, inputsToSign)
 * @returns Signed PSBT result
 *
 * @throws {Error} If no wallet is connected or the user rejects signing.
 */
export async function signPsbt(
  core: LaserEyesCore,
  psbt: string,
  options?: SignPsbtOptions
): Promise<SignedPsbt> {
  const provider = requireConnector(core).getProvider()
  if (!provider) {
    throw new Error('No provider found')
  }
  return (await provider.request('bitcoin_signPsbt', { psbt, ...options })) as SignedPsbt
}

/**
 * Sign a message.
 *
 * @param core - LaserEyesCore instance
 * @param message - Message to sign
 * @param options - Optional signing options (address, protocol)
 * @returns Signature string
 *
 * @throws {Error} If no wallet is connected or the user rejects signing.
 */
export async function signMessage(
  core: LaserEyesCore,
  message: string,
  options?: SignMessageOptions
): Promise<string> {
  const provider = requireConnector(core).getProvider()
  if (!provider) {
    throw new Error('No provider found')
  }
  return (await provider.request('bitcoin_signMessage', { message, ...options })) as string
}

/**
 * Push (broadcast) a signed PSBT via the connected wallet.
 *
 * @remarks
 * Uses the wallet's own broadcasting endpoint via `bitcoin_pushPsbt`.
 *
 * @param core - LaserEyesCore instance
 * @param psbt - Signed PSBT in hex or base64 format
 * @returns Transaction ID
 *
 * @throws {Error} If no wallet is connected or broadcasting fails.
 */
export async function broadcastPsbt(core: LaserEyesCore, psbt: string): Promise<string> {
  const provider = requireConnector(core).getProvider()
  if (!provider) {
    throw new Error('No provider found')
  }
  return (await provider.request('bitcoin_broadcastPsbt', { psbt })) as string
}
