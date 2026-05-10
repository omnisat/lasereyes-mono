/**
 * Free-function actions over `LaserEyesConfig`.
 *
 * @remarks
 * Phase 9 surface. Three groups:
 *
 * - **Lifecycle**: `initialize`, `connect`, `disconnect`, `switchNetwork`,
 *   `dispose`.
 * - **Read** (data): `getBalance`, `getAddressUtxos`, `getInscriptions`,
 *   `getRunesBalances`, `getBrc20Balances`, `getAlkanesBalances`,
 *   `getRecommendedFees`, `getTransaction`, `broadcastTransaction`.
 * - **Write** (wallet): `sendBitcoin`, `signPsbt`, `signMessage`,
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

// Lifecycle
export { connect } from './connect'
export type { ConnectArgs } from './connect'
export { disconnect } from './disconnect'
export { dispose } from './dispose'
export { initialize } from './initialize'
export { switchNetwork } from './switchNetwork'

// Data (read)
export {
  broadcastTransaction,
  getAddressUtxos,
  getAlkanesBalances,
  getBalance,
  getBrc20Balances,
  getInscriptions,
  getRecommendedFees,
  getRunesBalances,
  getTransaction,
} from './data'

// Wallet (write)
export { broadcastPsbt, sendBitcoin, signMessage, signPsbt } from './wallet'
