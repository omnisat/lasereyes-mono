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

import type { LaserEyesCore } from '../core'
import type { SignedPsbt, SignMessageOptions, SignPsbtOptions, SignPsbtsOptions } from '../types/provider'

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
  return requireConnector(core).sendBitcoin(to, amount)
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
  return requireConnector(core).signPsbt(psbt, options)
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
  return requireConnector(core).signMessage(message, options)
}

/**
 * Sign multiple PSBTs in a batch.
 *
 * @remarks
 * Delegates to the connector's provider via `bitcoin_signPsbts`.
 *
 * @param core - LaserEyesCore instance
 * @param psbts - Array of PSBTs in hex or base64 format
 * @param options - Optional batch signing options
 * @returns Array of signed PSBT results
 *
 * @throws {Error} If no wallet is connected or the user rejects signing.
 */
export async function signPsbts(
  core: LaserEyesCore,
  psbts: string[],
  options?: SignPsbtsOptions
): Promise<SignedPsbt[]> {
  const connector = requireConnector(core)
  return connector.getProvider().request({
    method: 'bitcoin_signPsbts',
    params: { psbts, ...options },
  }) as Promise<SignedPsbt[]>
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
export async function pushPsbt(core: LaserEyesCore, psbt: string): Promise<string> {
  const connector = requireConnector(core)
  return connector.getProvider().request({
    method: 'bitcoin_pushPsbt',
    params: { psbt },
  }) as Promise<string>
}
