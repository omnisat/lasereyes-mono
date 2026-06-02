/**
 * `getWalletClient(config, options?)` — the keystone bridging core's
 * stateful config with the client package's typed wallet client.
 *
 * @remarks
 * Built as `getClient` + (when needed) wallet-client construction.
 * `getClient` handles cache lookup and the user-supplied factory; what
 * remains for the wallet client is just adding the connector-side bits
 * (account, signer, connector overrides). That step is
 * {@link buildConnectorClient}.
 *
 * @module wallet-client
 */

import type { ChainNetwork, Client, NetworkId } from '@omnisat/lasereyes-client'
import {
  type Account,
  createWalletClient,
  providerSigner,
  type WalletClient,
  type WalletClientConfig,
} from '@omnisat/lasereyes-client/wallet'
import { getClient } from './client'
import type { LaserEyesConfig } from './config'
import { resolveConnector, writeCachedClient } from './internal'

/**
 * Runtime test for whether a `Client` is actually a `WalletClient`.
 *
 * @remarks
 * `WalletClientConfig` carries `account`; `ClientConfig` doesn't. That's
 * the structural difference we rely on. The cast at call sites is what
 * gives callers the wallet-client typing.
 */
function isWalletClientShape(
  client: Client<any, any, any>
): client is WalletClient<WalletClientConfig<Account, any>, Account, any, any> {
  return client?.config !== undefined && 'account' in client.config
}

/**
 * Add the connector-side bits — account, signer, optional connector
 * `getClient` override — to a bare client. Replaces the cached entry
 * for this chain with the resulting wallet client.
 *
 * @internal
 */
async function buildConnectorClient(
  config: LaserEyesConfig,
  bare: Client<any, any, any>
): Promise<WalletClient<WalletClientConfig<Account, any>, Account, any, any>> {
  const connector = resolveConnector(config)
  const provider = connector.getProvider()
  if (!provider) {
    throw new Error('Active connector has no provider')
  }
  const account = await connector.getAccount()
  const network = bare.config.network as ChainNetwork
  const backend = bare.config.backend

  const walletClient = createWalletClient({
    network,
    backend,
    account,
    signer: providerSigner(provider),
  }) as WalletClient<WalletClientConfig<Account, any>, Account, any, any>

  const final = connector.getClient
    ? ((await connector.getClient({
        client: walletClient,
        chainId: network.id as NetworkId,
      })) as WalletClient<WalletClientConfig<Account, any>, Account, any, any>)
    : walletClient

  writeCachedClient(config, network.id, final)
  return final
}

/**
 * Build a typed wallet client for an active connector on a configured chain.
 *
 * @remarks
 * Threads `<const config>` so the chain-ID parameter is narrowed to the
 * chains in the config tuple. Out-of-config chain IDs are rejected at
 * compile time.
 *
 * Flow:
 *   1. `getClient(config, options)` — returns the cached client, the
 *      user-supplied factory's output, or a freshly-built bare client.
 *   2. If the result is already a wallet client (cached at `connect()`
 *      time, or the user's factory returned one) → return as-is.
 *   3. If the user supplied `config.client` → factory wins, return as-is
 *      even if it's not a wallet client (caller's responsibility).
 *   4. Otherwise build the wallet client via {@link buildConnectorClient}
 *      and replace the cached bare client.
 *
 * @throws {Error} If no connector is connected and we need to build.
 * @throws {Error} If the active connector has no provider.
 * @throws {NetworkNotConfiguredError} If `chainId` is not in `config.chains`.
 */
export async function getWalletClient<const config extends LaserEyesConfig>(
  config: config,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<WalletClient<WalletClientConfig<Account, any>, Account, any, any>> {
  // Lookup phase: cache hit / user factory / freshly-built bare. Throws
  // `NetworkNotConfiguredError` if the chain isn't in `config.chains`.
  const client = getClient(config, options)

  // Factory wins unconditionally; whatever it produced is what we
  // return. Cached wallet clients pass through too — they came from a
  // prior `connect()` and already have connector overrides applied.
  if (config.client || isWalletClientShape(client)) {
    return client as WalletClient<WalletClientConfig<Account, any>, Account, any, any>
  }

  // Bare client cached from a non-wallet path. Upgrade to a wallet
  // client by adding connector-side bits.
  return buildConnectorClient(config, client)
}
