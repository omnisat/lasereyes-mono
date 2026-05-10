/**
 * Wallet client factory.
 *
 * @module client/wallet
 */

import type { Account } from '../account/types'
import type { ChainNetwork, NetworkId } from '../chains'
import { resolveNetwork } from '../chains'
import type { ActionGroup } from '../data-source/capabilities'
import { NetworkMismatchError } from '../errors'
import type { ChainDataSource } from '../types/data-source'
import type { Extension, Prettify } from '../types/utils'
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
 * @typeParam dsMethods - The data source capabilities (inferred from `config.dataSource`)
 * @typeParam TAccount - The account type (inferred from `config.account`)
 *
 * @param config - The wallet client configuration
 * @param config.network - The Bitcoin network this client operates on. Pass
 *   either a {@link NetworkId} string (e.g. `'mainnet'`) or a
 *   {@link ChainNetwork} value (e.g. `MAINNET`). Strings are resolved via
 *   the built-in `NETWORKS` registry.
 * @param config.dataSource - The chain data source providing blockchain data.
 * @param config.account - The user's account (with addresses and optional public keys).
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
 *   .extend(signingActions(mySigner))
 *   .extend(walletBtcActions())
 *
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * ```
 */
export function createWalletClient<
  dsMethods extends ActionGroup,
  TAccount extends Account,
>(config: {
  network: NetworkId | ChainNetwork
  dataSource: ChainDataSource<dsMethods>
  account: TAccount
}): WalletClient<WalletClientConfig<TAccount, dsMethods>, TAccount, {}, dsMethods> {
  const network = resolveNetwork(config.network)
  if (config.dataSource.network !== network) {
    throw new NetworkMismatchError(network.name, config.dataSource.network.name)
  }

  type Config = WalletClientConfig<TAccount, dsMethods>
  const resolvedConfig: Config = {
    network,
    dataSource: config.dataSource,
    account: config.account,
  }

  function buildClient<TActions extends ActionGroup>(
    actions: TActions
  ): WalletClient<Config, TAccount, TActions, dsMethods> {
    const client = {
      config: resolvedConfig,
      extend<TNew extends Extension<'config' | 'extend'>>(
        factory: (c: WalletClient<Config, TAccount, TActions, dsMethods>) => TNew
      ): WalletClient<Config, TAccount, Prettify<TActions & TNew>, dsMethods> {
        const newActions = factory(client)
        const merged = { ...actions, ...newActions } as Prettify<TActions & TNew>
        return buildClient(merged)
      },
      ...actions,
    }
    return client as unknown as WalletClient<Config, TAccount, TActions, dsMethods>
  }

  return buildClient({} as {})
}
