/**
 * Wallet (write/signing) actions over `LaserEyesConfig`.
 *
 * @remarks
 * These actions always go directly through the active connector's
 * provider — they never fall back to a data source, because signing
 * requires keys that only the wallet has.
 *
 * Phase 10's keystone introduces a typed `getWalletClient(config)` that
 * wraps these via the client package's `walletBtcActions()` / `signingActions()`
 * — at which point users can also work with a typed wallet client. These
 * lower-level free functions remain available for callers who don't need
 * the full typed surface.
 *
 * All actions thread `<const config extends LaserEyesConfig<any, any, any>>`.
 *
 * @module actions/wallet
 */

import type { SignedPsbt, SignMessageOptions, SignPsbtOptions } from '@omnisat/lasereyes-client/wallet'
import type { LaserEyesConfig } from '../config'
import { resolveConnector } from '../internal'

/**
 * Send Bitcoin to an address.
 *
 * @param config - The LaserEyes config.
 * @param to - Recipient Bitcoin address.
 * @param amount - Amount in satoshis.
 * @returns Transaction ID.
 *
 * @throws {Error} If no wallet is connected or the user rejects.
 */
export async function sendBitcoin<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  to: string,
  amount: number
): Promise<string> {
  const provider = resolveConnector(config).getProvider()
  if (!provider) throw new Error('Active connector has no provider')
  return (await provider.request('bitcoin_sendBitcoin', { to, amount })) as string
}

/**
 * Sign a PSBT.
 *
 * @param config - The LaserEyes config.
 * @param psbt - PSBT in hex or base64 format.
 * @param options - Optional signing options (`finalize`, `broadcast`, `inputsToSign`).
 * @returns The signed PSBT result.
 *
 * @throws {Error} If no wallet is connected or the user rejects signing.
 */
export async function signPsbt<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  psbt: string,
  options?: SignPsbtOptions
): Promise<SignedPsbt> {
  const provider = resolveConnector(config).getProvider()
  if (!provider) throw new Error('Active connector has no provider')
  return (await provider.request('bitcoin_signPsbt', { psbt, ...options })) as SignedPsbt
}

/**
 * Sign a message.
 *
 * @param config - The LaserEyes config.
 * @param message - Message to sign.
 * @param options - Optional signing options (`address`, `protocol`).
 * @returns The signature string.
 *
 * @throws {Error} If no wallet is connected or the user rejects signing.
 */
export async function signMessage<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  message: string,
  options?: SignMessageOptions
): Promise<string> {
  const provider = resolveConnector(config).getProvider()
  if (!provider) throw new Error('Active connector has no provider')
  return (await provider.request('bitcoin_signMessage', { message, ...options })) as string
}

/**
 * Push (broadcast) a signed PSBT via the connected wallet.
 *
 * @remarks
 * Uses the wallet's broadcasting endpoint via `bitcoin_pushPsbt`. The
 * client-only `broadcastTransaction(config, rawTx)` is the alternative
 * if you want to broadcast directly through the configured data source
 * instead of the wallet.
 *
 * @returns Transaction ID.
 */
export async function broadcastPsbt<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  psbt: string
): Promise<string> {
  const provider = resolveConnector(config).getProvider()
  if (!provider) throw new Error('Active connector has no provider')
  return (await provider.request('bitcoin_pushPsbt', { psbt })) as string
}
