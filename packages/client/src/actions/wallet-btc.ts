/**
 * Wallet-aware BTC actions for account-based operations.
 *
 * @module actions/wallet-btc
 */

import { buildSendBtcPsbt } from '../lib/psbt-builders'
import type { Account, BaseCapability, PaginatedResult, UTXO, WalletAccount, WalletClient, WalletClientConfig } from '../types'

/**
 * Parameters for sending BTC using a wallet client.
 */
export interface SendBtcParams {
  /** Recipient's Bitcoin address */
  to: string
  /** Amount to send in satoshis */
  amount: number
  /** Fee rate in sat/vB (defaults to 7) */
  feeRate?: number
}

/**
 * Sends BTC from the wallet account to a recipient.
 *
 * @remarks
 * This function automatically uses the account's payment address for funding
 * and change. It requires a WalletAccount (for public key access) and signing
 * actions to be extended on the client.
 *
 * @param client - Wallet client with WalletAccount and signing actions
 * @param params - Send parameters
 * @returns Transaction ID of the broadcasted transaction
 *
 * @throws {Error} If account is missing payment address or public key
 * @throws {Error} If signing actions are not available
 * @throws {PsbtBuildError} If PSBT construction fails
 * @throws {InsufficientFundsError} If insufficient funds
 *
 * @example
 * ```ts
 * import { sendBtc } from '@omnisat/lasereyes-client/wallet'
 *
 * const txId = await sendBtc(walletClient, {
 *   to: 'bc1q...',
 *   amount: 10000,
 *   feeRate: 10
 * })
 * ```
 */
export async function sendBtc<config extends WalletClientConfig<account, dsMethods>, account extends WalletAccount, dsMethods extends Pick<BaseCapability, 'btcBroadcastTransaction' | 'btcGetAddressUtxos'>, clientActions extends {
    signPsbt: (psbt: string, options?: any) => Promise<any>
  }>(
  client: WalletClient<config, account, clientActions, dsMethods>,
  params: SendBtcParams
): Promise<string> {
  const { to, amount, feeRate = 7 } = params

  // Get payment address and public key from account
  const paymentAddr = client.config.account.getAddress('payment')
  const paymentPubkey = client.config.account.getPublicKey('payment')

  // Fetch UTXOs
  const { data: utxos } = await client.config.dataSource.btcGetAddressUtxos(paymentAddr)

  // Build PSBT using utility function
  const { psbtHex } = buildSendBtcPsbt({
    utxos,
    toAddress: to,
    amount,
    changeAddress: paymentAddr,
    feeRate,
    network: client.config.network.type,
    publicKey: paymentPubkey,
  })

  // Sign PSBT via signing actions
  const signed = await client.signPsbt(psbtHex, {
    finalize: true,
    broadcast: false,
  })

  if (!signed.txHex) {
    throw new Error('Signer did not return transaction hex')
  }

  // Broadcast transaction
  return client.config.dataSource.btcBroadcastTransaction(signed.txHex)
}

/**
 * Gets the BTC balance for the wallet account's payment address.
 *
 * @param client - Wallet client with any account type
 * @returns Balance in satoshis (as string)
 *
 * @example
 * ```ts
 * import { getBalance } from '@omnisat/lasereyes-client/wallet'
 *
 * const balance = await getBalance(walletClient)
 * console.log(`Balance: ${balance} sats`)
 * ```
 */
export async function getBalance<config extends WalletClientConfig<account, dsMethods>, account extends Account, dsMethods extends Pick<BaseCapability, 'btcGetBalance'>>(client: WalletClient<config, account, {}, dsMethods>): Promise<string> {
  const address = client.config.account.getAddress('payment')
  return client.config.dataSource.btcGetBalance(address)
}

/**
 * Gets UTXOs for the wallet account's specified address purpose.
 *
 * @param client - Wallet client with any account type
 * @param purpose - Address purpose to query (defaults to 'payment')
 * @returns Paginated UTXO result
 *
 * @example
 * ```ts
 * import { getUtxos } from '@omnisat/lasereyes-client/wallet'
 *
 * const { data: utxos } = await getUtxos(walletClient, 'payment')
 * const { data: ordinalsUtxos } = await getUtxos(walletClient, 'ordinals')
 * ```
 */
export async function getUtxos<config extends WalletClientConfig<account, dsMethods>, account extends Account, dsMethods extends Pick<BaseCapability, 'btcGetAddressUtxos'>>(
  client: WalletClient<config, account, {}, dsMethods>,
  purpose: 'payment' | 'ordinals' | 'taproot' = 'payment'
): Promise<PaginatedResult<UTXO>> {
  const address = client.config.account.getAddress(purpose)
  return client.config.dataSource.btcGetAddressUtxos(address)
}

/**
 * Creates a wallet BTC action group factory.
 *
 * @remarks
 * Provides account-aware BTC operations. The `sendBtc` action requires a
 * WalletAccount (for public keys) and signing actions. Query actions work with any
 * account type.
 *
 * @returns A factory function that produces {@link WalletBtcActions}
 *
 * @example
 * ```ts
 * import { createWalletClient } from '@omnisat/lasereyes-client/wallet'
 * import { walletBtcActions, signingActions } from '@omnisat/lasereyes-client/wallet'
 *
 * const walletClient = createWalletClient({ network, dataSource, account })
 *   .extend(walletBtcActions())
 *   .extend(signingActions(signer))
 *
 * // Send BTC (account-aware)
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 *
 * // Get balance (account-aware)
 * const balance = await walletClient.getBalance()
 *
 * // Get UTXOs (account-aware)
 * const { data: utxos } = await walletClient.getUtxos('payment')
 * ```
 */
export function walletBtcActions() {
  return <dsMethods extends BaseCapability, config extends WalletClientConfig<WalletAccount, dsMethods>>(client: WalletClient<config, WalletAccount, {
    signPsbt: (psbt: string, options?: any) => Promise<any>
  }, dsMethods>) => ({
    sendBtc: (params: SendBtcParams) => sendBtc(client, params),
    getBalance: () => getBalance(client),
    getUtxos: (purpose?: 'payment' | 'ordinals' | 'taproot') => getUtxos(client, purpose),
  })
}
