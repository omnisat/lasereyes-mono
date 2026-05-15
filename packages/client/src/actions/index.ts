/**
 * Internal aggregate of action factories and free actions.
 *
 * @remarks
 * Most consumers should import from the more specific subpaths
 * (`@omnisat/lasereyes-client`, `/wallet`, `/runes`, `/brc20`,
 * `/inscriptions`) — they're tree-shake-friendly and document intent.
 *
 * Every dispatched action has a globally unique name: address-keyed
 * reads are `getAddressBalance` / `getAddressUtxos`; account-aware reads
 * are `getAccountBalance` / `getAccountUtxos`. The aggregate barrel can
 * re-export them all without collision.
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
  getAddressBalance,
  getAddressUtxos,
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
  getAccountBalance,
  getAccountUtxos,
  sendBtc,
  signMessage,
  signPsbt,
  walletBtcActions,
} from './wallet'
export type { SendBtcParams } from './wallet'
