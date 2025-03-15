/* eslint-disable @typescript-eslint/ban-types */
import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Address = string;
export type CanisterPublicKey = PublicKey;
export interface Delegation {
  pubkey: PublicKey;
  targets: [] | [Array<Principal>];
  expiration: Timestamp;
}
export type GetAddressResponse = { Ok: Address } | { Err: string };
export type GetDelegationResponse = { Ok: SignedDelegation } | { Err: string };
export type GetPrincipalResponse = { Ok: Principal } | { Err: string };
export interface LoginDetails {
  user_canister_pubkey: CanisterPublicKey;
  expiration: Timestamp;
}
export type LoginResponse = { Ok: LoginDetails } | { Err: string };
export type PrepareLoginResponse = { Ok: SiwbMessage } | { Err: string };
export type Principal = Uint8Array | number[];
export type PublicKey = Uint8Array | number[];
export type PublickeyHex = string;
export type RuntimeFeature = { IncludeUriInSeed: null } | { DisableEthToPrincipalMapping: null } | { DisablePrincipalToEthMapping: null };
export type SessionKey = PublicKey;
export interface SettingsInput {
  uri: string;
  runtime_features: [] | [Array<RuntimeFeature>];
  domain: string;
  statement: [] | [string];
  scheme: [] | [string];
  salt: string;
  network: [] | [string];
  session_expires_in: [] | [bigint];
  targets: [] | [Array<string>];
  sign_in_expires_in: [] | [bigint];
}
export type SignMessageType = { Bip322Simple: null } | { ECDSA: null };
export interface SignedDelegation {
  signature: Uint8Array | number[];
  delegation: Delegation;
}
export type SiwbMessage = string;
export type SiwbSignature = string;
export type String = string;
export type Timestamp = bigint;
export interface _SERVICE {
  get_address: ActorMethod<[Principal, String], GetAddressResponse>;
  get_caller_address: ActorMethod<[[] | [String]], GetAddressResponse>;
  get_principal: ActorMethod<[Address], GetPrincipalResponse>;
  siwb_get_delegation: ActorMethod<[Address, SessionKey, Timestamp], GetDelegationResponse>;
  siwb_login: ActorMethod<[SiwbSignature, Address, PublickeyHex, SessionKey, SignMessageType], LoginResponse>;
  siwb_prepare_login: ActorMethod<[Address], PrepareLoginResponse>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
