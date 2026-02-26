/**
 * LaserEyes Core actions.
 *
 * @remarks
 * Actions are standalone functions that accept a {@link LaserEyesCore} instance
 * as their first argument. They are split into two groups:
 *
 * - **Data actions** (`data.ts`): Read operations with smart provider-first routing.
 * - **Wallet actions** (`wallet.ts`): Write/signing operations that always go to the connector.
 *
 * @module actions
 */

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

export {
  pushPsbt,
  sendBitcoin,
  signMessage,
  signPsbt,
  signPsbts,
} from './wallet'
