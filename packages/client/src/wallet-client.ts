/**
 * Wallet client factory.
 *
 * @module wallet-client
 */

import { NetworkMismatchError } from './errors'
import type { Account, ActionGroup, WalletClient, WalletClientConfig } from './types'

/**
 * Creates a new wallet client instance with account context.
 *
 * @remarks
 * The wallet client wraps a chain data source and provides an account-aware interface.
 * Unlike the base client, it knows about the user's addresses and can provide convenience
 * methods that automatically use the appropriate address for each operation.
 *
 * Signing capability is added via the `signingActions()` action group which accepts a
 * signer parameter.
 *
 * @typeParam TDS - The data source capabilities
 * @typeParam TAccount - The account type (Account, WalletAccount, ReadOnlyAccount, etc.)
 *
 * @param config - The wallet client configuration
 * @param config.network - The Bitcoin network this client operates on
 * @param config.dataSource - The chain data source providing blockchain data
 * @param config.account - The account providing address and key information
 *
 * @returns A wallet client instance that can be extended with action groups
 *
 * @throws {NetworkMismatchError} If the client network does not match the data source network
 *
 * @example
 * ```ts
 * import { createWalletClient, createWalletAccount } from '@omnisat/lasereyes-client/wallet'
 * import { walletBtcActions, signingActions } from '@omnisat/lasereyes-client/wallet'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * // Create account
 * const account = createWalletAccount({
 *   addresses: [
 *     { address: 'bc1q...', purpose: 'payment', type: AddressType.P2WPKH }
 *   ],
 *   publicKeys: {
 *     payment: '02...',
 *     ordinals: '03...',
 *     taproot: '03...'
 *   }
 * })
 *
 * // Create data source
 * const ds = createDataSource({ network: MAINNET })
 *
 * // Create wallet client
 * const walletClient = createWalletClient({
 *   network: MAINNET,
 *   dataSource: ds,
 *   account
 * })
 *   .extend(walletBtcActions())
 *   .extend(signingActions(mySigner))
 *
 * // Use account-aware methods
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * ```
 */
export function createWalletClient<Config extends WalletClientConfig<TAccount>, TAccount extends Account = Account>(
  config: Config
): WalletClient<Config, TAccount, {}> {
  if (config.dataSource.network !== config.network) {
    throw new NetworkMismatchError(config.network.name, config.dataSource.network.name)
  }

  function buildClient<TActions extends ActionGroup>(
    config: Config,
    actions: TActions
  ): WalletClient<Config, TAccount, TActions> {
    const client = {
      config,
      extend<TNew>(
        factory: (c: WalletClient<Config, TAccount, TActions>) => TNew
      ): WalletClient<Config, TAccount, TActions & TNew> {
        const newActions = factory(client)
        const merged = { ...actions, ...newActions } as TActions & TNew
        return buildClient(config, merged)
      },
      ...(actions),
    }
    return client
  }

  return buildClient(config, {}) as WalletClient<Config, TAccount>
}
