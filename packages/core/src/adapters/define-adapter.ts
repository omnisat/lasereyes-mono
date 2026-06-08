/**
 * Declarative adapter factory.
 *
 * @remarks
 * Instead of hand-writing a `request()` switch plus a separate
 * `buildCapabilities()` matrix (which can drift apart), an adapter is
 * declared as a {@link AdapterDefinition}: a map of method handlers typed
 * against {@link BitcoinRpcSchema}, plus the networks it serves. The
 * factory:
 *
 * - dispatches `request(method, params)` into `handlers[method]`,
 * - serves `bitcoin_getCapabilities` from a **derived** matrix (every
 *   handler key is `{ supported: true }` across the declared networks),
 * - threads wallet-local state (network, raw provider, errors, events)
 *   through an {@link AdapterContext} passed to each handler.
 *
 * The returned object extends {@link BaseAdapter}, so it inherits the
 * event emitter / error helpers and satisfies {@link BitcoinProviderAdapter}.
 *
 * @module adapters/define-adapter
 */

import type { NetworkId, ProviderRpcError } from '@omnisat/lasereyes-client'
import type { NetworkCapabilities, ProviderCapabilities } from '../types/provider'
import type { BitcoinRpcSchema } from '../types/rpc-schema'
import { type AdapterEventMap, BaseAdapter, type BitcoinProviderAdapter } from './base'

/**
 * Per-call context handed to every handler — the declarative replacement
 * for a class adapter's `this`.
 */
export interface AdapterContext {
  /** The underlying wallet provider object. */
  readonly rawProvider: any
  /** The network the adapter is currently targeting. */
  getNetwork(): NetworkId
  /** Update the adapter's tracked network (e.g. on connect / switch). */
  setNetwork(network: NetworkId): void
  /** Construct a {@link ProviderRpcError}. */
  createError(code: number, message: string, data?: unknown): ProviderRpcError
  /** Emit a normalized provider event to subscribers. */
  emit<E extends keyof AdapterEventMap>(event: E, ...args: AdapterEventMap[E]): void
}

/** A single method handler, typed against {@link BitcoinRpcSchema}. */
export type AdapterHandler<M extends keyof BitcoinRpcSchema> = (
  params: BitcoinRpcSchema[M]['params'],
  ctx: AdapterContext
) => Promise<BitcoinRpcSchema[M]['result']> | BitcoinRpcSchema[M]['result']

/** Partial map of schema methods to handlers. */
export type AdapterHandlers = {
  [M in keyof BitcoinRpcSchema]?: AdapterHandler<M>
}

/** Declarative adapter definition. */
export interface AdapterDefinition {
  /** Wallet identifier (e.g. `'leather'`). */
  walletId: string
  /** Human-readable wallet name. */
  walletName: string
  /** Networks this wallet serves. Drives the derived capability matrix. */
  networks: NetworkId[]
  /** Method handlers, typed against {@link BitcoinRpcSchema}. */
  handlers: AdapterHandlers
  /** Network the adapter starts on (defaults to `networks[0]`). */
  defaultNetwork?: NetworkId
  /** Optional hook to subscribe to wallet-native events. */
  subscribeRawEvents?: (ctx: AdapterContext) => void
}

/**
 * The concrete adapter produced by {@link defineAdapter}. Internal — the
 * public type is {@link BitcoinProviderAdapter}.
 */
class DefinedAdapter extends BaseAdapter {
  readonly walletId: string
  readonly walletName: string
  private readonly definition: AdapterDefinition
  private network: NetworkId
  private readonly ctx: AdapterContext

  constructor(rawProvider: any, definition: AdapterDefinition) {
    super(rawProvider)
    this.definition = definition
    this.walletId = definition.walletId
    this.walletName = definition.walletName
    this.network = definition.defaultNetwork ?? definition.networks[0] ?? 'mainnet'
    this.ctx = {
      rawProvider,
      getNetwork: () => this.network,
      setNetwork: network => {
        this.network = network
      },
      createError: (code, message, data) => this.createError(code, message, data),
      emit: (event, ...args) => {
        // eventemitter3's emit is variadic; cast through unknown to
        // accommodate the union event map without per-event narrowing.
        ;(this.emitter.emit as (e: string, ...a: unknown[]) => boolean)(event, ...args)
      },
    }
    definition.subscribeRawEvents?.(this.ctx)
  }

  protected override subscribeRawEvents(): void {
    // No-op during base construction. Definition-driven adapters wire
    // their listeners explicitly once `ctx` exists (see constructor),
    // since the base class calls this before subclass fields are set.
  }

  async request(method: string, params?: { [key: string]: unknown }): Promise<unknown> {
    if (method === 'bitcoin_getCapabilities') return this.buildCapabilities()

    const handler = (
      this.definition.handlers as Record<string, AdapterHandler<keyof BitcoinRpcSchema> | undefined>
    )[method]
    if (!handler) this.throwMethodNotSupported(method)

    return handler(params as never, this.ctx)
  }

  protected buildCapabilities(): ProviderCapabilities {
    const methods: NetworkCapabilities = {}
    for (const method of Object.keys(this.definition.handlers)) {
      methods[method] = { supported: true }
    }
    const capabilities: ProviderCapabilities = {}
    for (const network of this.definition.networks) {
      capabilities[network] = { ...methods }
    }
    return capabilities
  }
}

/**
 * Build an adapter factory from a declarative {@link AdapterDefinition}.
 *
 * @returns A `(rawProvider) => BitcoinProviderAdapter` factory.
 *
 * @example
 * ```ts
 * export const createLeatherAdapter = defineAdapter({
 *   walletId: 'leather',
 *   walletName: 'Leather Wallet',
 *   networks: ['mainnet', 'testnet'],
 *   handlers: {
 *     bitcoin_getNetwork: (_, ctx) => ctx.getNetwork(),
 *     // ...
 *   },
 * })
 * ```
 */
export function defineAdapter(
  definition: AdapterDefinition
): (rawProvider: any) => BitcoinProviderAdapter {
  return rawProvider => new DefinedAdapter(rawProvider, definition)
}

/**
 * The methods a definition implements — its coverage of
 * {@link BitcoinRpcSchema}. Useful for documenting / asserting how much
 * of the standard surface a wallet supports.
 */
export function adapterImplementedMethods(
  definition: AdapterDefinition
): (keyof BitcoinRpcSchema)[] {
  return Object.keys(definition.handlers) as (keyof BitcoinRpcSchema)[]
}
