/**
 * `createConnector` — identity helper for typed connector factories.
 *
 * @remarks
 * Mirrors wagmi's `createConnector`. The function is itself the factory;
 * `createConnector` just provides a nominal type anchor and keeps the
 * surface ergonomic.
 *
 * @example
 * ```ts
 * import { createConnector } from '@omnisat/lasereyes-core'
 *
 * export const myWallet = () => createConnector((config) => ({
 *   id: 'my-wallet',
 *   name: 'My Wallet',
 *   connect: async () => { ... },
 *   // ...rest of Connector interface
 * }))
 * ```
 *
 * @module connectors/create
 */

import type { CreateConnectorFn } from '../types/connector'

/**
 * Identity helper for typed connector factories.
 *
 * @param fn - A `(config) => Connector` factory function.
 * @returns The same function, typed as {@link CreateConnectorFn}.
 */
export function createConnector(fn: CreateConnectorFn): CreateConnectorFn {
  return fn
}
