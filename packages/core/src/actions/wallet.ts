/**
 * Wallet (write/signing) actions over `LaserEyesConfig`.
 *
 * @remarks
 * Each free-function action collapses through {@link getWalletClient}:
 *
 * 1. `getWalletClient(config)` returns a bare `WalletClient` (or a
 *    pre-composed one if the active connector ships its own `getClient`).
 * 2. `getAction(client, freeFn, 'name')` dispatches the call. If the
 *    connector's `getClient` extended the method onto the client (an
 *    RPC-direct override), `getAction` finds it; otherwise the free
 *    function runs against the bare client, composing through its own
 *    `getAction` calls all the way down.
 *
 * Net effect: the override-cascade pattern is preserved across the
 * core/client seam. A user (or a connector) overriding any composed
 * sub-action — `signPsbt`, `getAccountUtxos`, `broadcastTransaction` — is
 * honored uniformly whether the entry point is core's free function
 * or a method on the wallet client.
 *
 * @module actions/wallet
 */

import {
  broadcastPsbt as clientBroadcastPsbt,
  sendBtc as clientSendBtc,
  signMessage as clientSignMessage,
  signPsbt as clientSignPsbt,
  getAction,
  type SendBtcParams,
  type SignedPsbt,
  type SignMessageOptions,
  type SignPsbtOptions,
} from '@omnisat/lasereyes-client/wallet'
import type { LaserEyesConfig } from '../config'
import { getWalletClient } from '../wallet-client'

/**
 * Send Bitcoin to an address.
 *
 * @remarks
 * Routes through `getWalletClient(config)` and dispatches via
 * {@link getAction}. If the active connector's `getClient` override
 * supplies an RPC-direct `sendBtc` (e.g. routing to
 * `bitcoin_sendBitcoin`), it wins; otherwise the default PSBT
 * composition runs.
 *
 * @param config - The LaserEyes config.
 * @param to - Recipient Bitcoin address.
 * @param amount - Amount in satoshis.
 * @param options - Optional parameters (e.g. fee rate).
 * @returns Transaction ID.
 *
 * @throws {Error} If no wallet is connected or the user rejects.
 */
export async function sendBtc<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  to: string,
  amount: number,
  options?: Omit<SendBtcParams, 'to' | 'amount'>
): Promise<string> {
  const client = await getWalletClient(config)
  const action = getAction(client, clientSendBtc, 'sendBtc')
  return action({ to, amount, ...options })
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
  const client = await getWalletClient(config)
  const action = getAction(client, clientSignPsbt, 'signPsbt')
  return action(psbt, options)
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
  const client = await getWalletClient(config)
  const action = getAction(client, clientSignMessage, 'signMessage')
  return action(message, options)
}

/**
 * Sign (finalize) a PSBT and broadcast the resulting transaction.
 *
 * @remarks
 * Composes through the wallet client's `broadcastPsbt` action. Default
 * composition: `signPsbt({ finalize: true })` + the data source's
 * `btcBroadcastTransaction`. Connectors with native `bitcoin_pushPsbt`
 * support can override via `getClient` to route through one wallet call
 * instead of two.
 *
 * @returns Transaction ID.
 */
export async function broadcastPsbt<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  psbt: string
): Promise<string> {
  const client = await getWalletClient(config)
  const action = getAction(client, clientBroadcastPsbt, 'broadcastPsbt')
  return action(psbt)
}
