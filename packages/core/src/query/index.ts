/**
 * `@nanostores/query` caching/dedup layer, exports isolated per action.
 *
 * @remarks
 * Layout mirrors `@wagmi/core/query`: one file per action (each exporting its
 * own key/store builder), a shared cache {@link createQueryContext} they all
 * import, and this barrel re-exporting them. Tree-shakeable — importing
 * `getAddressBalanceQuery` does not pull in the utxos module.
 *
 * Two flavours, matching wagmi's read/write split:
 * - **Reads** return a `FetcherStore` (`getXxxQuery` + `getXxxQueryKey`).
 * - **Writes** return a `MutatorStore` (`xxxMutation`); on success they
 *   **revalidate** the cached reads of the addresses the write touched (see
 *   {@link addressesKeySelector} / {@link connectedAccountAddresses}).
 *
 * Importable as `@omnisat/lasereyes-core/query` (subpath wired in
 * `package.json` exports + `vite.config.js`, mirroring `./actions`).
 *
 * @module query
 */

// Store types these builders return — re-exported so consumers (e.g. the React
// bindings) can type their adapters without a direct `@nanostores/query` dep.
export type { FetcherStore, MutatorStore } from '@nanostores/query'
// Per-action reads
export { getAddressBalanceQuery, getAddressBalanceQueryKey } from './balance'
// Per-action writes (mutations)
export { type BroadcastPsbtVariables, broadcastPsbtMutation } from './broadcast-psbt'
export {
  type BroadcastTransactionVariables,
  broadcastTransactionMutation,
} from './broadcast-transaction'
// Shared cache context (the QueryClient analogue)
export {
  createQueryContext,
  defaultQueryContext,
  effectiveNetworkIdAtom,
  networkIdAtom,
  type PaginatedQueryBuilderOptions,
  type QueryBuilderOptions,
  type QueryContext,
  type QueryContextOptions,
  SEP,
} from './context'
export { getRecommendedFeesQuery, getRecommendedFeesQueryKey } from './fees'
// Cross-action invalidation / revalidation
export {
  addressesKeySelector,
  addressKeySelector,
  connectedAccountAddresses,
  invalidateAddress,
} from './invalidate'
export { type SendBtcVariables, sendBtcMutation } from './send-btc'
export { type SignMessageVariables, signMessageMutation } from './sign-message'
export { type SignPsbtVariables, signPsbtMutation } from './sign-psbt'
// Structural sharing (apply in fetchers; reuse old refs for deep-equal data)
export { replaceEqualDeep, withSharedData } from './structural-sharing'
export { getTransactionQuery, getTransactionQueryKey } from './transaction'
export { getAddressUtxosQuery, getAddressUtxosQueryKey } from './utxos'
