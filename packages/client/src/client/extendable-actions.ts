/**
 * Registry of every action that can be dispatched via {@link getAction}.
 *
 * @remarks
 * The type-level chokepoint that backs `.extend()`'s shape validation: any
 * property whose key appears in this registry must have the canonical
 * signature declared here, while novel keys stay unconstrained. So
 * `.extend()` can add new actions freely but can't redeclare a known action
 * with the wrong shape.
 *
 * To register a new action, add its method shape to the relevant
 * `Public<Protocol>Actions` or `Wallet<Protocol>Actions` type alias in its
 * module — this registry follows automatically.
 *
 * @module client/extendable-actions
 */

// Implementation: the registry is an intersection of every per-module
// named-action surface. Names are kept globally unique across the dispatched
// set (the `{Public|Wallet}{Protocol}Actions` rename guarantees this), so the
// intersection is a flat, collision-free shape. If two surfaces declared the
// same key with different shapes, the intersection would collapse that key to a
// `never`-shaped member and make the `.extend` constraint unusable — surfacing
// the conflict the rename was meant to prevent.

import type { PublicBrc20Actions, WalletBrc20Actions } from '../actions/brc20'
import type { PublicInscriptionActions, WalletInscriptionActions } from '../actions/inscriptions'
import type { PublicBtcActions } from '../actions/public'
import type { PublicRuneActions, WalletRuneActions } from '../actions/runes'
import type { WalletBtcActions } from '../actions/wallet'

/**
 * Every method shape that {@link getAction}-style dispatch can resolve
 * against, joined into one flat record keyed by action name.
 */
export type ExtendableProtectedActions = PublicBtcActions &
  WalletBtcActions &
  PublicBrc20Actions &
  WalletBrc20Actions &
  PublicRuneActions &
  WalletRuneActions &
  PublicInscriptionActions &
  WalletInscriptionActions
