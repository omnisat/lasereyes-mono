/**
 * Wallet client factory.
 *
 * @module client/wallet
 */

import type { Account } from '../account/types'
import type { ActionGroup } from '../data-source/capabilities'
import { NetworkMismatchError } from '../errors'
import type { WalletClient, WalletClientConfig } from './wallet-types'

/**
 * Creates a new wallet client instance with account context.
 *
 * @remarks
 * The wallet client wraps a chain data source and provides an
 * account-aware interface. Unlike the base client, it knows about the
 * user's addresses and can provide convenience methods that automatically
 * use the appropriate address for each operation.
 *
 * Signing capability is added via the `signingActions(signer)` action
 * group.
 *
 * @typeParam Config - The wallet client configuration
 * @typeParam TAccount - The account type (Account / WalletAccount / ReadOnlyAccount)
 *
 * @param config - The wallet client configuration
 * @param config.network - The Bitcoin network this client operates on
 * @param config.dataSource - The chain data source providing blockchain data
 * @param config.account - The account providing address and key information
 *
 * @returns A wallet client instance that can be extended with action groups
 *
 * @throws {@link NetworkMismatchError} If the client network does not match the data source network
 *
 * @example
 * ```ts
 * import {
 *   createWalletClient, createWalletAccount,
 *   walletBtcActions, signingActions,
 * } from '@omnisat/lasereyes-client/wallet'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { MAINNET, AddressType } from '@omnisat/lasereyes-client'
 *
 * const account = createWalletAccount({
 *   addresses: [
 *     { address: 'bc1q...', purpose: 'payment', type: AddressType.P2WPKH },
 *   ],
 *   publicKeys: { payment: '02...', ordinals: '03...', taproot: '03...' },
 * })
 *
 * const ds = createDataSource({ network: MAINNET })
 *
 * const walletClient = createWalletClient({
 *   network: MAINNET,
 *   dataSource: ds,
 *   account,
 * })
 *   .extend(walletBtcActions())
 *   .extend(signingActions(mySigner))
 *
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * ```
 */
export function createWalletClient<
  Config extends WalletClientConfig<TAccount>,
  TAccount extends Account = Account,
>(config: Config): WalletClient<Config, TAccount, {}> {
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
      ...actions,
    }
    return client
  }

  return buildClient(config, {}) as WalletClient<Config, TAccount>
}
