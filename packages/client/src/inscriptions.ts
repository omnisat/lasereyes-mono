/**
 * Inscriptions subpath — Ordinal inscription actions and types.
 *
 * @module inscriptions
 */

export {
  batchGetInscriptionInfo,
  getInscriptionInfo,
  getInscriptionsByAddress,
  inscribe,
  inscriptionActions,
  inscriptionWriteActions,
  type PublicInscriptionActions,
  sendInscription,
  type InscribeParams,
  type SendInscriptionParams,
  type WalletInscriptionActions,
} from './actions/inscriptions'
export type { Inscription, InscriptionInfo } from './types/inscription'
export type { InscriptionCapability } from './data-source/capabilities'
