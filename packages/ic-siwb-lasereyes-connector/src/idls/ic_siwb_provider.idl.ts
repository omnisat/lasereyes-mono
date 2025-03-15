/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const idlFactory = ({ IDL }: any) => {
  const RuntimeFeature = IDL.Variant({
    IncludeUriInSeed: IDL.Null,
    DisableEthToPrincipalMapping: IDL.Null,
    DisablePrincipalToEthMapping: IDL.Null,
  });
  const SettingsInput = IDL.Record({
    uri: IDL.Text,
    runtime_features: IDL.Opt(IDL.Vec(RuntimeFeature)),
    domain: IDL.Text,
    statement: IDL.Opt(IDL.Text),
    scheme: IDL.Opt(IDL.Text),
    salt: IDL.Text,
    network: IDL.Opt(IDL.Text),
    session_expires_in: IDL.Opt(IDL.Nat64),
    targets: IDL.Opt(IDL.Vec(IDL.Text)),
    sign_in_expires_in: IDL.Opt(IDL.Nat64),
  });
  const Principal = IDL.Vec(IDL.Nat8);
  const String = IDL.Text;
  const Address = IDL.Text;
  const GetAddressResponse = IDL.Variant({ Ok: Address, Err: IDL.Text });
  const GetPrincipalResponse = IDL.Variant({
    Ok: Principal,
    Err: IDL.Text,
  });
  const PublicKey = IDL.Vec(IDL.Nat8);
  const SessionKey = PublicKey;
  const Timestamp = IDL.Nat64;
  const Delegation = IDL.Record({
    pubkey: PublicKey,
    targets: IDL.Opt(IDL.Vec(IDL.Principal)),
    expiration: Timestamp,
  });
  const SignedDelegation = IDL.Record({
    signature: IDL.Vec(IDL.Nat8),
    delegation: Delegation,
  });
  const GetDelegationResponse = IDL.Variant({
    Ok: SignedDelegation,
    Err: IDL.Text,
  });
  const SiwbSignature = IDL.Text;
  const PublickeyHex = IDL.Text;
  const SignMessageType = IDL.Variant({
    Bip322Simple: IDL.Null,
    ECDSA: IDL.Null,
  });
  const CanisterPublicKey = PublicKey;
  const LoginDetails = IDL.Record({
    user_canister_pubkey: CanisterPublicKey,
    expiration: Timestamp,
  });
  const LoginResponse = IDL.Variant({ Ok: LoginDetails, Err: IDL.Text });
  const SiwbMessage = IDL.Text;
  const PrepareLoginResponse = IDL.Variant({
    Ok: SiwbMessage,
    Err: IDL.Text,
  });
  return IDL.Service({
    get_address: IDL.Func([Principal, String], [GetAddressResponse], ['query']),
    get_caller_address: IDL.Func([IDL.Opt(String)], [GetAddressResponse], ['query']),
    get_principal: IDL.Func([Address], [GetPrincipalResponse], ['query']),
    siwb_get_delegation: IDL.Func([Address, SessionKey, Timestamp], [GetDelegationResponse], ['query']),
    siwb_login: IDL.Func([SiwbSignature, Address, PublickeyHex, SessionKey, SignMessageType], [LoginResponse], []),
    siwb_prepare_login: IDL.Func([Address], [PrepareLoginResponse], []),
  });
};
export const init = ({ IDL }: any) => {
  const RuntimeFeature = IDL.Variant({
    IncludeUriInSeed: IDL.Null,
    DisableEthToPrincipalMapping: IDL.Null,
    DisablePrincipalToEthMapping: IDL.Null,
  });
  const SettingsInput = IDL.Record({
    uri: IDL.Text,
    runtime_features: IDL.Opt(IDL.Vec(RuntimeFeature)),
    domain: IDL.Text,
    statement: IDL.Opt(IDL.Text),
    scheme: IDL.Opt(IDL.Text),
    salt: IDL.Text,
    network: IDL.Opt(IDL.Text),
    session_expires_in: IDL.Opt(IDL.Nat64),
    targets: IDL.Opt(IDL.Vec(IDL.Text)),
    sign_in_expires_in: IDL.Opt(IDL.Nat64),
  });
  return [SettingsInput];
};
