/**
 * Internal aggregate of action factories and free actions.
 *
 * @remarks
 * Most consumers should import from the more specific subpaths
 * (`@omnisat/lasereyes-client`, `/wallet`, `/runes`, `/brc20`,
 * `/inscriptions`) — they're tree-shake-friendly and document intent.
 *
 * Notable: `getBalance` and `getUtxos` exist in both `actions/public/`
 * (address-keyed reads) and `actions/wallet/` (account-aware reads).
 * To avoid name collisions, this barrel re-exports only the factory
 * functions and the action functions whose names are unique. For the
 * collision-prone `getBalance`/`getUtxos`, import from the specific
 * subpath.
 *
 * @module actions
 */

export {
  brc20Actions,
  brc20WriteActions,
  deployBrc20,
  getBrc20Balances,
  getBrc20ByTicker,
  mintBrc20,
  transferBrc20,
} from './brc20'
export type {
  DeployBrc20Params,
  MintBrc20Params,
  TransferBrc20Params,
} from './brc20'
export {
  batchGetInscriptionInfo,
  getInscriptionInfo,
  getInscriptionsByAddress,
  inscribe,
  inscriptionActions,
  inscriptionWriteActions,
  sendInscription,
} from './inscriptions'
export type { InscribeParams, SendInscriptionParams } from './inscriptions'
export {
  broadcastTransaction,
  getOutputValue,
  getRecommendedFees,
  getTransaction,
  publicActions,
  waitForTransaction,
} from './public'
export {
  batchGetRuneOutputs,
  getRuneBalances,
  getRuneById,
  getRuneByName,
  getRuneOutpoints,
  runeActions,
  runeWriteActions,
  sendRune,
} from './runes'
export type { SendRuneParams } from './runes'
export {
  broadcastPsbt,
  signMessage,
  signPsbt,
  signingActions,
} from './signing'
export { sendBtc, walletBtcActions } from './wallet'
export type { SendBtcParams } from './wallet'
