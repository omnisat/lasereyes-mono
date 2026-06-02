/**
 * Free-function actions over `LaserEyesConfig`.
 *
 * @remarks
 * Phase 9 surface. Three groups:
 *
 * - **Lifecycle**: `initialize`, `connect`, `disconnect`, `switchNetwork`,
 *   `dispose`.
 * - **Read** (data): `getAddressBalance`, `getAddressUtxos`, `getInscriptions`,
 *   `getRunesBalances`, `getBrc20Balances`, `getAlkanesBalances`,
 *   `getRecommendedFees`, `getTransaction`, `broadcastTransaction`.
 * - **Write** (wallet): `sendBtc`, `signPsbt`, `signMessage`,
 *   `broadcastPsbt`.
 *
 * All actions thread `<const config extends LaserEyesConfig<any, any,
 * any>>`. {@link switchNetwork} additionally narrows its `networkId`
 * argument and return type based on the config's chain tuple — see its
 * docblock for the showcase.
 *
 * @module actions
 */

// Read-only typed client (used internally by data actions, also a public surface)
export { getClient } from '../client'
export type { ConnectArgs } from './connect'
// Lifecycle
export { connect } from './connect'
// Data (read)
export {
  broadcastTransaction,
  getAddressBalance,
  getAddressUtxos,
  getAlkanesBalances,
  getBrc20Balances,
  getInscriptions,
  getRecommendedFees,
  getRunesBalances,
  getTransaction,
} from './data'
export { disconnect } from './disconnect'
export { dispose } from './dispose'
export { initialize } from './initialize'
export { switchNetwork } from './switchNetwork'

// Wallet (write)
export { broadcastPsbt, sendBtc, signMessage, signPsbt } from './wallet'
