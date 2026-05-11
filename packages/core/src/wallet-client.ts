/**
 * `getWalletClient(config, options?)` — the keystone bridging core's
 * stateful config with the client package's typed wallet client.
 *
 * @remarks
 * The keystone is intentionally minimal:
 *
 * 1. Resolve the active connector from state.
 * 2. If the connector ships its own `getClient` method, delegate to it
 *    entirely. (Connectors override here when their wallet has native
 *    RPC support for operations the default would compose — e.g.
 *    `bitcoin_sendBitcoin` instead of build-PSBT-then-sign-then-broadcast.)
 * 3. Otherwise, return a **bare** `WalletClient` built from
 *    `(account, chain, dataSource, signer)`. No `.extend(...)` calls.
 *    Callers compose whatever actions they want. The Phase 9 free-function
 *    actions (`sendBitcoin`, `signPsbt`, etc.) consume the bare client via
 *    `getAction` with free-function fallback, so they work end-to-end
 *    without needing the client to be pre-extended.
 *
 * The bare-by-default rule matches wagmi's `getConnectorClient` philosophy
 * (`@wagmi/core/actions/getConnectorClient.ts:132-134`):
 *
 * ```ts
 * if (connector.getClient) return connector.getClient({ chainId })
 * // …default client construction…
 * ```
 *
 * Pairs with the sibling {@link getClient} (read-only path) in
 * `client.ts`.
 *
 * @module wallet-client
 */

import type { ChainDataSource, ChainNetwork, NetworkId } from '@omnisat/lasereyes-client'
import {
  type Account,
  createWalletClient,
  providerSigner,
  type WalletAccount,
  type WalletClient,
  type WalletClientConfig,
} from '@omnisat/lasereyes-client/wallet'
import type { LaserEyesConfig } from './config'
import { resolveConnector, resolveDataSource } from './internal'

/**
 * Build a typed wallet client for an active connector on a configured chain.
 *
 * @remarks
 * Threads `<const config>` so the chain-ID parameter is narrowed to the
 * chains in the config tuple. Out-of-config chain IDs are rejected at
 * compile time.
 *
 * @param config - The LaserEyes config.
 * @param options - Optional chain narrowing.
 * @returns A wallet client. Bare by default; pre-composed if the active
 *   connector ships its own `getClient`.
 *
 * @throws {Error} If no connector is connected.
 * @throws {Error} If the active connector has no provider.
 * @throws {Error} If `chainId` is not in `config.chains` or has no
 *   configured transports.
 *
 * @example Bare default + compose actions on demand
 * ```ts
 * import { getWalletClient } from '@omnisat/lasereyes-core'
 * import { signingActions, walletBtcActions } from '@omnisat/lasereyes-client/wallet'
 *
 * const client = await getWalletClient(config)
 * const extended = client.extend(signingActions()).extend(walletBtcActions())
 * await extended.sendBtc({ to: 'bc1q…', amount: 1000 })
 * ```
 *
 * @example Connector-shipped client takes priority
 * ```ts
 * // If `config.state.$connector` points to a unisat connector whose
 * // `getClient` overrides `sendBitcoin` to use the native RPC method,
 * // the returned client will already have that override baked in.
 * const client = await getWalletClient(config)
 * ```
 */
export async function getWalletClient<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<WalletClient<WalletClientConfig<Account, any>, Account, any, any>> {
  const connector = resolveConnector(config)

  // Build the bare default first — the connector's optional `getClient`
  // hook receives this and decides whether to extend, replace, or pass
  // through.
  const account = await connector.getAccount()
  const id = (options?.chainId ?? config.state.$networkId.get()) as string
  const network = (config.chains as readonly ChainNetwork[]).find(c => c.id === id)
  if (!network) {
    throw new Error(`Chain '${id}' not in config.chains`)
  }
  const dataSource = resolveDataSource(config, id) as ChainDataSource<any>
  const provider = connector.getProvider()
  if (!provider) {
    throw new Error('Active connector has no provider')
  }
  const signer = providerSigner(provider)

  const bare = createWalletClient({
    network,
    dataSource,
    account: account as WalletAccount,
    signer,
  }) as WalletClient<WalletClientConfig<Account, any>, Account, any, any>

  if (connector.getClient) {
    return connector.getClient({ client: bare, chainId: id as NetworkId })
  }
  return bare
}
