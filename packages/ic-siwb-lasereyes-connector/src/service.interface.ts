import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type Address = string;
export type PublickeyHex = string;

export type CanisterPublicKey = PublicKey;

export interface Delegation {
  pubkey: PublicKey;
  targets: [] | [Array<Principal>];
  expiration: Timestamp;
}

export type GetDelegationResponse = { Ok: SignedDelegation } | { Err: string };

export interface LoginOkResponse {
  user_canister_pubkey: CanisterPublicKey;
  expiration: Timestamp;
}

export type LoginResponse = { Ok: LoginOkResponse } | { Err: string };

export type PrepareLoginResponse = { Ok: SiwbMessage } | { Err: string };

export type PublicKey = Uint8Array | number[];

export type SessionKey = PublicKey;

export interface SignedDelegation {
  signature: Uint8Array | number[];
  delegation: Delegation;
}

export type SignMessageType = { Bip322Simple: null } | { ECDSA: null };

export type SiwbMessage = string;

export type SiwbSignature = string;

export type Timestamp = bigint;

export interface SIWB_IDENTITY_SERVICE {
  siwb_prepare_login: ActorMethod<[Address], PrepareLoginResponse>;
  siwb_login: ActorMethod<[SiwbSignature, Address, PublickeyHex, SessionKey, SignMessageType], LoginResponse>;
  siwb_get_delegation: ActorMethod<[Address, SessionKey, Timestamp], GetDelegationResponse>;
}
