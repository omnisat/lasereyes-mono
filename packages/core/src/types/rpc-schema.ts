/**
 * Bitcoin RPC method schema.
 *
 * @remarks
 * The single source of truth for the params and result of each standard
 * `bitcoin_*` method. Adapters implement a {@link AdapterHandlers | partial
 * map} of this schema; capabilities and per-network coverage are derived
 * from which handlers are present, so the capability matrix can never
 * drift from the implementation.
 *
 * @module types/rpc-schema
 */

import type { Inscription, NetworkId } from '@omnisat/lasereyes-client'
import type { SignedPsbt, WalletAccountConfig } from '@omnisat/lasereyes-client/wallet'

/** Params for `bitcoin_signPsbt`. */
export interface SignPsbtParams {
  /** PSBT to sign (hex or base64). */
  psbt: string
  /** Finalize all signed inputs after signing. */
  finalize?: boolean
  /** Broadcast the finalized transaction (wallet-side, when supported). */
  broadcast?: boolean
  /** Restrict signing to specific inputs. */
  inputsToSign?: { address?: string; index: number }[]
}

/** Params for `bitcoin_signMessage`. */
export interface SignMessageParams {
  /** Message to sign. */
  message: string
  /** Address to sign with (defaults to the wallet's payment address). */
  address?: string
  /** Signing protocol. */
  protocol?: 'bip322' | 'ecdsa'
}

/** Params for `bitcoin_sendBitcoin`. */
export interface SendBitcoinParams {
  to: string
  amount: number
}

/** Params for `bitcoin_getInscriptions`. */
export interface GetInscriptionsParams {
  offset?: number
  limit?: number
}

/** Params for `bitcoin_switchNetwork`. */
export interface SwitchNetworkParams {
  networkId: NetworkId
}

/**
 * Map of standard `bitcoin_*` methods to their params and result types.
 *
 * @remarks
 * `bitcoin_getCapabilities` is intentionally omitted — it is served
 * automatically by the adapter from the derived capability matrix and is
 * never a user-supplied handler.
 */
export interface BitcoinRpcSchema {
  bitcoin_requestAccounts: { params: void; result: WalletAccountConfig }
  bitcoin_getAccounts: { params: void; result: WalletAccountConfig }
  bitcoin_getNetwork: { params: void; result: NetworkId }
  bitcoin_switchNetwork: { params: SwitchNetworkParams; result: NetworkId }
  bitcoin_signPsbt: { params: SignPsbtParams; result: SignedPsbt }
  bitcoin_signMessage: { params: SignMessageParams; result: string }
  bitcoin_sendBitcoin: { params: SendBitcoinParams; result: string }
  bitcoin_getInscriptions: { params: GetInscriptionsParams; result: Inscription[] }
  bitcoin_getBalance: { params: { address?: string }; result: string }
  bitcoin_pushPsbt: { params: { psbt: string }; result: string }
}

/** Union of methods covered by {@link BitcoinRpcSchema}. */
export type SchemaMethod = keyof BitcoinRpcSchema
