/**
 * Inscriptions subpath — Ordinal inscription actions and types.
 *
 * @module inscriptions
 */

export {
  batchGetInscriptionInfo,
  getInscriptionInfo,
  getInscriptionsByAddress,
  type InscribeParams,
  inscribe,
  inscriptionActions,
  inscriptionWriteActions,
  type PublicInscriptionActions,
  type SendInscriptionParams,
  sendInscription,
  type WalletInscriptionActions,
} from './actions/inscriptions'
export type { InscriptionCapability } from './backend/capabilities'
export type { Inscription, InscriptionInfo } from './types/inscription'
