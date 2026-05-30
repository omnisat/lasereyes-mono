/**
 * Registry of every action that can be dispatched via {@link getAction}.
 *
 * @remarks
 * This is the type-level chokepoint that backs `.extend()`'s shape
 * validation. The constraint on `.extend()`'s factory return is roughly:
 *
 *   `TNew extends Extension<'config' | 'extend'> & ExactPartial<ExtendableProtectedActions>`
 *
 * meaning: any property whose key appears in this registry must have the
 * canonical signature declared here. Novel keys remain unconstrained.
 *
 * Mirrors viem's `ExtendableProtectedActions` (in `clients/createClient.ts`,
 * declared as a `Pick<PublicActions | WalletActions, …>`). The lasereyes
 * shape is an intersection of every per-module named-action surface —
 * once names are globally unique across the dispatched set (which the
 * `{Public|Wallet}{Protocol}Actions` rename guarantees), this intersection
 * is a flat, collision-free shape.
 *
 * **To register a new action**: add its method shape to the relevant
 * `Public<Protocol>Actions` or `Wallet<Protocol>Actions` type alias in
 * its module — this registry follows automatically.
 *
 * **The precondition this enforces**: every dispatched action name is
 * globally unique. If two surfaces declare the same key with different
 * shapes, the intersection collapses that key to `never`-shaped, making
 * the whole `.extend` constraint unusable. That's a feature — the type
 * system surfaces the conflict the rename was meant to prevent.
 *
 * @module client/extendable-actions
 */

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
