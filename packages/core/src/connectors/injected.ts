/**
 * `injected` — generic connector for window-injected wallets.
 *
 * @remarks
 * Most browser-extension Bitcoin wallets work the same way: they inject
 * an object onto `window` (e.g. `window.unisat`, `window.LeatherProvider`)
 * that the page wraps in an adapter. `injected` packages that pattern as
 * a one-liner.
 *
 * For wallets with non-standard discovery (e.g. sats-connect, mobile deep
 * links, hardware bridges) write the connector directly using
 * {@link createConnector} instead.
 *
 * @example
 * ```ts
 * import { injected } from '@omnisat/lasereyes-core'
 * import { UNISAT_ICON, UnisatAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
 *
 * export const unisat = () =>
 *   injected({
 *     id: 'unisat',
 *     name: 'Unisat',
 *     icon: UNISAT_ICON,
 *     rdns: 'io.unisat.wallet',
 *     getProvider: (window) => window.unisat,
 *     adapter: UnisatAdapter,
 *   })
 * ```
 *
 * @module connectors/injected
 */

import type { ChainNetwork, NetworkId } from '@omnisat/lasereyes-client'
import type {
  Account,
  AddressPurpose,
  SendBtcParams,
  WalletAccount,
} from '@omnisat/lasereyes-client/wallet'
import type { BaseAdapter, BitcoinProviderAdapter } from '../adapters/base'
import type { Connector, CreateConnectorFn } from '../types/connector'
import type { ProviderCapabilities } from '../types/provider'
import { createConnector } from './create'

/**
 * Configuration for an injected-wallet connector.
 */
export interface InjectedConnectorTarget {
  /** Stable connector identifier (e.g. `'unisat'`). */
  id: string
  /** Human-readable name (e.g. `'Unisat Wallet'`). */
  name: string
  /** Icon URL or data URI. */
  icon?: string
  /** Reverse DNS identifier (e.g. `'io.unisat.wallet'`). */
  rdns?: string
  /**
   * Read the wallet's injected object off the global `window`. Returns
   * `null`/`undefined` if not installed.
   */
  getProvider: (window: Window & typeof globalThis) => unknown | null | undefined
  /**
   * Adapter class to wrap the injected object. Constructed with the
   * raw provider as its single argument.
   */
  adapter: new (
    rawProvider: unknown
  ) => BaseAdapter

  /**
   * Wallet operations the underlying provider supports natively (one-shot
   * RPC). For each declared operation, the connector's `getClient` returns
   * a wallet client with that method overridden to dispatch directly via
   * `provider.request(method, params)` — short-circuiting the default
   * composed PSBT path so the wallet handles fees, signing, and broadcast
   * in a single user prompt.
   *
   * Almost every Bitcoin wallet supports `bitcoin_sendBitcoin` natively
   * (baseline `0397a17` had explicit `sendBTC` on all 14 providers). Set
   * `sendBtc: true` for those wallets. `bitcoin_pushPsbt` is rarer — only
   * a handful of wallets expose broadcast separately from `signPsbt`'s
   * `broadcast` flag.
   *
   * When `nativeRpc` is omitted (or all entries are false), the connector
   * has no `getClient` override and the default composed paths run.
   */
  nativeRpc?: {
    /** Wallet supports `bitcoin_sendBitcoin` natively. */
    sendBtc?: boolean
    /** Wallet supports `bitcoin_pushPsbt` natively. */
    broadcastPsbt?: boolean
    /**
     * Wallet supports `bitcoin_getBalance` natively. Honored only when the
     * caller asks for the connected wallet's address; otherwise the
     * override hits the data-source-backed `getBalance` action.
     */
    getBalance?: boolean
  }
}

/**
 * Build a connector for a window-injected wallet.
 *
 * @param target - Identification, detection, and adapter wiring.
 * @returns A {@link CreateConnectorFn} ready to pass into the LaserEyes config.
 */
export function injected(target: InjectedConnectorTarget): CreateConnectorFn {
  return createConnector(_config => {
    let cachedAdapter: BitcoinProviderAdapter | null = null

    function resolveAdapter(): BitcoinProviderAdapter | null {
      if (cachedAdapter) return cachedAdapter
      if (typeof window === 'undefined') return null
      const raw = target.getProvider(window)
      if (!raw) return null
      cachedAdapter = new target.adapter(raw)
      return cachedAdapter
    }

    function requireAdapter(): BitcoinProviderAdapter {
      const a = resolveAdapter()
      if (!a) {
        throw new Error(`${target.name} not installed. Please install the extension.`)
      }
      return a
    }

    const hasNativeOverrides =
      target.nativeRpc &&
      (target.nativeRpc.sendBtc || target.nativeRpc.broadcastPsbt || target.nativeRpc.getBalance)

    const connector: Connector = {
      id: target.id,
      name: target.name,
      icon: target.icon,
      rdns: target.rdns,

      isReady() {
        return resolveAdapter() !== null
      },

      async isAuthorized() {
        const a = resolveAdapter()
        if (!a) return false
        try {
          const account = (await a.request('bitcoin_getAccounts')) as Account | undefined
          return !!(account && account.addresses && account.addresses.length > 0)
        } catch {
          return false
        }
      },

      async connect() {
        const a = requireAdapter()
        const account = (await a.request('bitcoin_requestAccounts')) as Account
        if (!account) throw new Error('No account returned from wallet')
        const networkId = (await a.request('bitcoin_getNetwork')) as NetworkId
        return { account, networkId }
      },

      async disconnect() {
        // Most browser-extension wallets don't support disconnect.
        // Lifecycle cleanup is handled by the connector's caller.
        cachedAdapter = null
      },

      async getAccount() {
        const a = requireAdapter()
        return (await a.request('bitcoin_getAccounts')) as Account
      },

      async getNetworkId() {
        const a = requireAdapter()
        return (await a.request('bitcoin_getNetwork')) as NetworkId
      },

      async getCapabilities() {
        const a = requireAdapter()
        return (await a.request('bitcoin_getCapabilities')) as ProviderCapabilities
      },

      async switchNetwork(networkId: NetworkId): Promise<ChainNetwork> {
        const a = requireAdapter()
        return (await a.request('bitcoin_switchNetwork', { networkId })) as ChainNetwork
      },

      getProvider() {
        return resolveAdapter()
      },

      // Default no-op event handlers; overridden by core when it sets up
      // listeners on the underlying provider.
      onAccountChanged: () => {},
      onNetworkChanged: () => {},
      onConnect: () => {},
      onDisconnect: () => {},

      // Optional `getClient` synthesized from `target.nativeRpc` declarations.
      // When omitted, the connector has no override and the keystone's bare
      // default path runs in full (composed PSBT for every wallet write).
      ...(hasNativeOverrides
        ? {
            getClient({ client }: { client: any }) {
              const overrides: Record<string, (...args: any[]) => any> = {}
              if (target.nativeRpc?.sendBtc) {
                overrides.sendBtc = async ({ to, amount }: SendBtcParams): Promise<string> => {
                  const a = requireAdapter()
                  return (await a.request('bitcoin_sendBitcoin', { to, amount })) as string
                }
              }
              if (target.nativeRpc?.broadcastPsbt) {
                overrides.broadcastPsbt = async (psbt: string): Promise<string> => {
                  const a = requireAdapter()
                  return (await a.request('bitcoin_pushPsbt', { psbt })) as string
                }
              }
              if (target.nativeRpc?.getBalance) {
                overrides.getBalance = async (
                  account?: WalletAccount,
                  purpose: AddressPurpose = 'payment'
                ): Promise<string> => {
                  const resolved = (account ?? client.config.account) as WalletAccount | undefined
                  const address = resolved?.getAddress(purpose)
                  const a = requireAdapter()
                  return (await a.request(
                    'bitcoin_getBalance',
                    address ? { address } : undefined
                  )) as string
                }
              }
              return client.extend(() => overrides)
            },
          }
        : {}),
    }

    return connector
  })
}
