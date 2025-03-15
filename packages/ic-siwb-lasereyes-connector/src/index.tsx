/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { _createActor, handleDelegation } from './baseConnection';
import { idlFactory as verifierIDL } from './idls/ic_siwb_provider.idl';
import type { SignedDelegation, _SERVICE as verifierService, LoginDetails } from './idls/ic_siwb_provider';
import { hasOwnProperty } from './utils';
// import { Principal } from '@dfinity/principal';
import { type ActorConfig, type ActorSubclass, type HttpAgentOptions, SignIdentity } from '@dfinity/agent';
import { KEY_ICSTORAGE_DELEGATION, KEY_ICSTORAGE_KEY, _deleteStorage, storage } from './storage';

import { DelegationChain, DelegationIdentity, Ed25519KeyIdentity, isDelegationValid } from '@dfinity/identity';
import { IC_SIWB_CANISTERID, IC_SIWB_CANISTERID_TESTNET } from './shared/constant';
import { Principal } from '@dfinity/principal';
import { LaserEyesClient, LEATHER, OYL, PHANTOM, UNISAT, WIZZ, type ContentType } from '@omnisat/lasereyes-core';
import { XVERSE, type NetworkType, type ProviderType } from '@omnisat/lasereyes';
import { createContext, useContext, type ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import type { IDL } from '@dfinity/candid';
import { AddressType, getAddressType, type NetworkItem } from './wallet';
import type { LoginStatus, PrepareLoginStatus, State } from './state.type';
import { callGetDelegation, callLogin, callPrepareLogin, createAnonymousActor } from './siwb-provider';
import { clearIdentity, loadIdentity, saveIdentity } from './local-storage';
import type { LoginOkResponse, SignMessageType, SignedDelegation as ServiceSignedDelegation } from './service.interface';
import { createDelegationChain } from './delegation';

export * from './service.interface';
export * from './storage.type';
// import { toHexString } from '@dfinity/candid';

export class SiwbConnector {
  constructor(private delegationIdentity: DelegationIdentity, private publicKey: string, private userAddress: string) { }

  static async connect(provider: LaserEyesClient, canisterId?: string): Promise<SiwbConnector> {
    let key: null | SignIdentity = null;

    const maybeIdentityStorage = await storage.get(KEY_ICSTORAGE_KEY);

    if (maybeIdentityStorage) {
      try {
        key = Ed25519KeyIdentity.fromJSON(maybeIdentityStorage) as unknown as SignIdentity;
      } catch (e) {
        // Ignore this, this means that the ICStorage value isn't a valid Ed25519KeyIdentity
        // serialization.
      }
    }

    let chain: null | DelegationChain = null;
    let delegationTargets: string[] = [];
    let delegationIdentityK: DelegationIdentity | undefined = undefined;

    if (key) {
      try {
        const chainStorage = await storage.get(KEY_ICSTORAGE_DELEGATION);

        if (chainStorage) {
          chain = DelegationChain.fromJSON(chainStorage);

          chain.delegations.forEach(signedDelegation => {
            const targets =
              signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0 ? signedDelegation.delegation.targets : undefined;
            if (targets) {
              delegationTargets = [...new Set(delegationTargets.concat(targets.map(e => e.toText())))];
            }
          });
          // Verify that the delegation isn't expired.
          if (!isDelegationValid(chain)) {
            await _deleteStorage(storage);
            key = null;
          } else {
            delegationIdentityK = DelegationIdentity.fromDelegation(key, chain);
          }
        }
      } catch (e) {
        console.error(e);
        // If there was a problem loading the chain, delete the key.
        await _deleteStorage(storage);
        key = null;
      }
    }

    const sessionId = Ed25519KeyIdentity.generate();

    if (!key) {
      await storage.set(KEY_ICSTORAGE_KEY, JSON.stringify(sessionId));
    }

    const _network = await provider.getNetwork();

    let canister_id = canisterId;
    if (_network && (_network.toLowerCase().includes('test') || _network.toLowerCase().includes('sig'))) {
      canister_id = canisterId ??= IC_SIWB_CANISTERID_TESTNET;
    }

    // sessionId save to localstorage
    const verifierActor = await _createActor<verifierService>(
      verifierIDL,
      canister_id ?? IC_SIWB_CANISTERID,
      delegationIdentityK ?? (sessionId as unknown as SignIdentity),
    );

    const accounts = (await provider?.requestAccounts()) as string[];
    if (accounts === undefined || accounts.length === 0) {
      throw new Error('No accounts found');
    } else {
      const currentAccount = accounts[0]!;
      const public_key = (await provider?.getPublicKey()) as string;

      if (delegationIdentityK === undefined) {
        const messageRes = await verifierActor.actor.siwb_prepare_login(currentAccount);
        let message: string;
        if (hasOwnProperty(messageRes, 'Ok')) {
          // console.log(`prepare success ${messageRes.Ok}`);
          message = messageRes.Ok as string;
        } else {
          throw new Error(messageRes['Err']);
        }
        // console.log(`message is ${message}`);
        const signature = (await provider?.signMessage(message)) as string;
        // console.log(`signature is ${signature}`);
        const { delegationIdentity, delegationChain } = await handleDelegationVerification(
          verifierActor.actor,
          currentAccount,
          sessionId as unknown as SignIdentity,
          public_key,
          signature,
        );
        delegationIdentityK = delegationIdentity;
        await storage.set(KEY_ICSTORAGE_DELEGATION, JSON.stringify(delegationChain));
      }

      // delegationChain save to localstorage
      return new SiwbConnector(delegationIdentityK, public_key, currentAccount);
    }
  }

  public static async disconnect() {
    await _deleteStorage(storage);
  }

  public static async hasStorage(): Promise<boolean> {
    return !!(await storage.get(KEY_ICSTORAGE_DELEGATION));
  }

  public getPrincipal(): Principal {
    return this.delegationIdentity.getPrincipal();
  }

  public getAddress(): string {
    return this.userAddress;
  }

  public static async getPrincialFromBitcoinAddress(address: string) {
    const verifierActor = await _createActor<verifierService>(verifierIDL, IC_SIWB_CANISTERID, undefined);
    const p = await verifierActor.actor.get_principal(address);
    if (hasOwnProperty(p, 'Ok')) {
      return p.Ok;
    } else {
      throw new Error(p.Err);
    }
  }

  public static async getDelegationIdentity() {
    let key: null | SignIdentity = null;

    const maybeIdentityStorage = await storage.get(KEY_ICSTORAGE_KEY);

    if (maybeIdentityStorage) {
      try {
        key = Ed25519KeyIdentity.fromJSON(maybeIdentityStorage) as unknown as SignIdentity;
      } catch (e) {
        // Ignore this, this means that the ICStorage value isn't a valid Ed25519KeyIdentity
        // serialization.
      }
    }

    let chain: null | DelegationChain = null;
    let delegationTargets: string[] = [];
    let delegationIdentityK: DelegationIdentity | undefined = undefined;

    if (key) {
      try {
        const chainStorage = await storage.get(KEY_ICSTORAGE_DELEGATION);

        if (chainStorage) {
          chain = DelegationChain.fromJSON(chainStorage);

          chain.delegations.forEach(signedDelegation => {
            const targets =
              signedDelegation.delegation.targets && signedDelegation.delegation.targets.length > 0 ? signedDelegation.delegation.targets : undefined;
            if (targets) {
              delegationTargets = [...new Set(delegationTargets.concat(targets.map(e => e.toText())))];
            }
          });
          // Verify that the delegation isn't expired.
          if (!isDelegationValid(chain)) {
            await _deleteStorage(storage);
            key = null;
          } else {
            delegationIdentityK = DelegationIdentity.fromDelegation(key, chain);
          }
        }
      } catch (e) {
        // If there was a problem loading the chain, delete the key.
        await _deleteStorage(storage);
        key = null;
      }
    }
    return delegationIdentityK;
  }
}

export async function handleDelegationVerification(
  actor: ActorSubclass<verifierService>,
  address: string,
  sessionId: SignIdentity,
  public_key: string,
  signature: string,
): Promise<{ delegationIdentity: DelegationIdentity; delegationChain: DelegationChain }> {
  const session_key = Array.from(new Uint8Array(sessionId.getPublicKey().toDer()));
  const result = await actor.siwb_login(signature, address, public_key, session_key, { ECDSA: null });

  // new SiwbConnector();
  // const result = verifyMessage(publicKey, sig, message);
  if (hasOwnProperty(result, 'Ok')) {
    const { expiration, user_canister_pubkey } = result.Ok as LoginDetails;

    const res = await actor.siwb_get_delegation(address, session_key, expiration);

    if (res && hasOwnProperty(res, 'Ok')) {
      const signed_delegation = res.Ok as SignedDelegation;
      const targets = signed_delegation.delegation.targets.length > 0 ? signed_delegation.delegation.targets[0] : undefined;
      const s = {
        delegation: {
          pubkey: Uint8Array.from(signed_delegation.delegation.pubkey),
          expiration: BigInt(signed_delegation.delegation.expiration),
          targets: targets && targets.length > 0 ? targets : undefined,
        },
        signature: Uint8Array.from(signed_delegation.signature),
        userKey: user_canister_pubkey,
        timestamp: expiration,
      };
      const delegationResult = {
        kind: 'success',
        delegations: [s],
        userPublicKey: Uint8Array.from(s.userKey),
      };
      // console.log(toHexString(Uint8Array.from(s.userKey)));
      return await handleDelegation(delegationResult, sessionId);
    } else {
      throw new Error('No signed delegation found');
    }
  } else {
    throw new Error(result.Err as string);
  }
}

// export const useSiwbLaserEyes = (walletName: ProviderType) => {
//   const { connect, connected, address, balance, signMessage, signPsbt, switchNetwork, requestAccounts, getPublicKey, getNetwork } = useLaserEyes();
//   const [icIdentity, setIcIdentity] = useState<SignIdentity | undefined>(undefined);

//   const icLogin = async () => {
//     const client = {
//       signMessage,
//       requestAccounts,
//       getPublicKey,
//       getNetwork,
//     } as LaserEyesClient;
//     await SiwbConnector.connect(client);
//     const delegation = await SiwbConnector.getDelegationIdentity();
//     if (delegation) {
//       setIcIdentity(delegation);
//     }
//   };

//   return {
//     icLogin,
//     icIdentity,
//     icPrincpal: icIdentity?.getPrincipal(),
//     connect,
//     connected,
//     address,
//     balance,
//     signMessage,
//     signPsbt,
//     switchNetwork,
//     requestAccounts,
//     getPublicKey,
//     getNetwork,
//   };
// };

export type LaserEyesContextType = {
  isInitializing: boolean;
  connected: boolean;
  isConnecting: boolean;
  publicKey: string;
  address: string;
  paymentAddress: string;
  paymentPublicKey: string;
  balance: number | undefined;
  network: NetworkType;
  library: any;
  provider: any;
  accounts: string[];
  hasUnisat: boolean;
  hasXverse: boolean;
  hasOrange: boolean;
  hasOpNet: boolean;
  hasOyl: boolean;
  hasMagicEden: boolean;
  hasOkx: boolean;
  hasLeather: boolean;
  hasPhantom: boolean;
  hasWizz: boolean;
  connect: (walletName: ProviderType) => Promise<void>;
  disconnect: () => void;
  requestAccounts: () => Promise<string[]>;
  getNetwork: () => Promise<string | undefined>;
  switchNetwork: (network: NetworkType) => Promise<void>;
  getPublicKey: () => Promise<string>;
  getBalance: () => Promise<string>;
  getInscriptions: () => Promise<any[]>;
  sendBTC: (to: string, amount: number) => Promise<string>;
  signMessage: (message: string, toSignAddress?: string) => Promise<string>;
  signPsbt: (
    tx: string,
    finalize?: boolean,
    broadcast?: boolean,
  ) => Promise<
    | {
      signedPsbtHex: string | undefined;
      signedPsbtBase64: string | undefined;
      txId?: string;
    }
    | undefined
  >;
  pushPsbt: (tx: string) => Promise<string | undefined>;
  inscribe: (contentBase64: string, mimeType: ContentType) => Promise<string | string[]>;
};

export type SiwbIdentityContextType = {
  /** Is set to `true` on mount until a stored identity is loaded from local storage or
   * none is found. */
  isInitializing: boolean;

  /** Load a SIWb message from the provider canister, to be used for login. Calling prepareLogin
   * is optional, as it will be called automatically on login if not called manually. */
  prepareLogin: () => void;

  /** Reflects the current status of the prepareLogin process. */
  prepareLoginStatus: PrepareLoginStatus;

  /** `prepareLoginStatus === "loading"` */
  isPreparingLogin: boolean;

  /** `prepareLoginStatus === "error"` */
  isPrepareLoginError: boolean;

  /** `prepareLoginStatus === "success"` */
  isPrepareLoginSuccess: boolean;

  /** `prepareLoginStatus === "idle"` */
  isPrepareLoginIdle: boolean;

  /** Error that occurred during the prepareLogin process. */
  prepareLoginError?: Error;

  /** Initiates the login process by requesting a SIWb message from the backend. */
  login: () => Promise<DelegationIdentity | undefined>;

  /** Reflects the current status of the login process. */
  loginStatus: LoginStatus;

  /** `loginStatus === "logging-in"` */
  isLoggingIn: boolean;

  /** `loginStatus === "error"` */
  isLoginError: boolean;

  /** `loginStatus === "success"` */
  isLoginSuccess: boolean;

  /** `loginStatus === "idle"` */
  isLoginIdle: boolean;

  /** Error that occurred during the login process. */
  loginError?: Error;

  /** Status of the SIWb message signing process. This is a re-export of the Wagmi
   * signMessage / status type. */
  signMessageStatus: 'error' | 'idle' | 'pending' | 'success';

  /** Error that occurred during the SIWb message signing process. This is a re-export of the
   * Wagmi signMessage / error type. */
  signMessageError: Error | null;

  /** The delegation chain is available after successfully loading the identity from local
   * storage or completing the login process. */
  delegationChain?: DelegationChain;

  /** The identity is available after successfully loading the identity from local storage
   * or completing the login process. */
  identity?: DelegationIdentity;

  /** The Bitcoin address associated with current identity. This address is not necessarily
   * the same as the address of the currently connected wallet - on wallet change, the addresses
   * will differ. */
  identityAddress?: string;

  identityPublicKey?: string;

  /** Clears the identity from the state and local storage. Effectively "logs the user out". */
  clear: () => void;

  /** Network Identitfier, not adding bitcoinjs-lib network directly, simple string */

  network?: NetworkType;

  /** We don't have things like rainbow kit right now, so we have to manually set provider key */
  // setLaserEyes: (laserEyes: LaserEyesContextType) => Promise<void>;

  /** We don't have things like rainbow kit right now, so we have to manually return provider key */
  selectedProvider?: ProviderType;

  /** We don't have things like rainbow kit right now, so we have to manually return btc address */
  connectedBtcAddress?: string;

  /** We don't have things like rainbow kit right now, so we have to manually return btc address */
  getAddress: () => string | undefined;

  getPublicKey: () => string | undefined;

  setLaserEyes: (laserEyes: LaserEyesContextType, providerType?: ProviderType) => Promise<void>;
};

export const SiwbIdentityContext = createContext<SiwbIdentityContextType | undefined>(undefined);

export function createClient(context: LaserEyesContextType): [LaserEyesClient, ProviderType] {
  const { getPublicKey, signMessage, getNetwork, requestAccounts, connect, provider } = context;
  const client = {
    getPublicKey,
    signMessage,
    getNetwork,
    requestAccounts,
    connect,
  } as LaserEyesClient;
  return [client, provider as ProviderType];
}
/**
 * Hook to access the SiwbIdentityContext.
 */
export const useSiwbIdentity = (): SiwbIdentityContextType => {
  const context = useContext(SiwbIdentityContext);

  if (!context) {
    throw new Error('useSiwbIdentity must be used within an SiwbIdentityProvider');
  }
  return { ...context };
};

export function SiwbIdentityProvider<T extends verifierService>({
  httpAgentOptions,
  actorOptions,
  idlFactory,
  canisterId,
  children,
}: {
  /** Configuration options for the HTTP agent used to communicate with the Internet Computer network. */
  httpAgentOptions?: HttpAgentOptions;

  /** Configuration options for the actor. These options are passed to the actor upon its creation. */
  actorOptions?: ActorConfig;

  /** The Interface Description Language (IDL) factory for the canister. This factory is used to create an actor interface for the canister. */
  idlFactory: IDL.InterfaceFactory;

  /** The unique identifier of the canister on the Internet Computer network. This ID is used to establish a connection to the canister. */
  canisterId: string;

  /** The child components that the SiwbIdentityProvider will wrap. This allows any child component to access the authentication context provided by the SiwbIdentityProvider. */
  children: ReactNode;
}) {
  let signMessageStatus: 'error' | 'idle' | 'pending' | 'success' = 'idle';
  let signMessageError = null;

  const [state, setState] = useState<State>({
    isInitializing: true,
    prepareLoginStatus: 'idle',
    loginStatus: 'idle',
    selectedProvider: undefined,
  });

  function updateState(newState: Partial<State>) {
    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
  }

  // Keep track of the promise handlers for the login method during the async login process.
  const loginPromiseHandlers = useRef<{
    resolve: (value: DelegationIdentity | PromiseLike<DelegationIdentity>) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // const { provider, address: connectedBtcAddress, network } = useRegisterExtension(state.selectedProvider);

  async function setLaserEyes(laserEyes: LaserEyesContextType, providerType?: ProviderType) {
    const [provider, p] = createClient(laserEyes);
    await laserEyes.connect(providerType ?? p);
    const network = await provider.getNetwork();
    const address = await provider.requestAccounts();
    const publicKey = await provider.getPublicKey();
    console.log('setLaserEyes');
    console.log({ address, publicKey });
    updateState({
      selectedProvider: providerType ?? p,
      provider: provider,
      network,
      connectedBtcAddress: address ? address[0] : '',
      connectedBtcPublicKey: publicKey,
    });
  }

  function getAddress() {
    return state.connectedBtcAddress;
  }

  function getPublicKey() {
    return state.connectedBtcPublicKey;
  }

  /**
   * Load a SIWB message from the provider, to be used for login. Calling prepareLogin
   * is optional, as it will be called automatically on login if not called manually.
   */
  async function prepareLogin(): Promise<string | undefined> {
    if (!state.anonymousActor) {
      throw new Error('Hook not initialized properly. Make sure to supply all required props to the SiwbIdentityProvider.');
    }
    if (!state.connectedBtcAddress) {
      throw new Error('No Bitcoin address available. Call prepareLogin after the user has connected their wallet.');
    }

    updateState({
      prepareLoginStatus: 'preparing',
      prepareLoginError: undefined,
    });

    try {
      const siwbMessage = await callPrepareLogin(state.anonymousActor, state.connectedBtcAddress);
      updateState({
        siwbMessage,
        prepareLoginStatus: 'success',
      });
      return siwbMessage;
    } catch (e) {
      console.log('eee', e);
      const error = normalizeError(e);
      console.error(error);
      updateState({
        prepareLoginStatus: 'error',
        prepareLoginError: error as any,
      });
    }
  }

  async function rejectLoginWithError(error: Error | unknown, message?: string) {
    const e = normalizeError(error);
    const errorMessage = message || (e as any).message;

    console.error(e);

    updateState({
      siwbMessage: undefined,
      loginStatus: 'error',
      loginError: new Error(errorMessage),
    });

    loginPromiseHandlers.current?.reject(new Error(errorMessage));
  }

  /**
   * This function is called when the signMessage hook has settled, that is, when the
   * user has signed the message or canceled the signing process.
   */
  async function onLoginSignatureSettled(
    loginSignature: string | undefined,
    publickeyHex: string,
    signMessageType: SignMessageType,
    error: Error | null,
  ) {
    if (error) {
      rejectLoginWithError(error, 'An error occurred while signing the login message.');
      return;
    }
    if (!loginSignature) {
      rejectLoginWithError(new Error('Sign message returned no data.'));
      return;
    }

    // Important for security! A random session identity is created on each login.
    const sessionIdentity = Ed25519KeyIdentity.generate();
    const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

    if (!state.anonymousActor || !state.connectedBtcAddress || !state.connectedBtcPublicKey) {
      rejectLoginWithError(new Error('Invalid actor or address.'));
      return;
    }

    // Logging in is a two-step process. First, the signed SIWB message is sent to the backend.
    // Then, the backend's siwb_get_delegation method is called to get the delegation.

    let loginOkResponse: LoginOkResponse;
    try {
      loginOkResponse = await callLogin(
        state.anonymousActor,
        loginSignature,
        state.connectedBtcAddress,
        publickeyHex,
        sessionPublicKey,
        signMessageType,
      );
    } catch (e) {
      rejectLoginWithError(e, 'Unable to login.');
      return;
    }

    // Call the backend's siwb_get_delegation method to get the delegation.
    let signedDelegation: ServiceSignedDelegation;
    try {
      signedDelegation = await callGetDelegation(state.anonymousActor, state.connectedBtcAddress, sessionPublicKey, loginOkResponse.expiration);
    } catch (e) {
      rejectLoginWithError(e, 'Unable to get identity.');
      return;
    }

    // Create a new delegation chain from the delegation.
    const delegationChain = createDelegationChain(signedDelegation, loginOkResponse.user_canister_pubkey);

    // Create a new delegation identity from the session identity and the
    // delegation chain.
    const identity = DelegationIdentity.fromDelegation(sessionIdentity, delegationChain);

    // Save the identity to local storage.
    saveIdentity(state.connectedBtcAddress, publickeyHex, sessionIdentity, delegationChain);

    // Set the identity in state.
    updateState({
      loginStatus: 'success',
      identityAddress: state.connectedBtcAddress,
      identityPublicKey: publickeyHex,
      identity,
      delegationChain,
    });

    loginPromiseHandlers.current?.resolve(identity);

    // The signMessage hook is reset so that it can be used again.
    // reset();
  }

  /**
   * Initiates the login process. If a SIWB message is not already available, it will be
   * generated by calling prepareLogin.
   *
   * @returns {void} Login does not return anything. If an error occurs, the error is available in
   * the loginError property.
   */

  async function login() {
    const promise = new Promise<DelegationIdentity>((resolve, reject) => {
      loginPromiseHandlers.current = { resolve, reject };
    });
    // Set the promise handlers immediately to ensure they are available for error handling.

    if (!state.anonymousActor) {
      rejectLoginWithError(new Error('Hook not initialized properly. Make sure to supply all required props to the SiwbIdentityProvider.'));
      return promise;
    }
    if (!state.connectedBtcAddress) {
      rejectLoginWithError(new Error('No Bitcoin address available. Call login after the user has connected their wallet.'));
      return promise;
    }
    if (state.prepareLoginStatus === 'preparing') {
      rejectLoginWithError(new Error("Don't call login while prepareLogin is running."));
      return promise;
    }

    updateState({
      loginStatus: 'logging-in',
      loginError: undefined,
    });

    try {
      // The SIWB message can be prepared in advance, or it can be generated as part of the login process.
      let siwbMessage = state.siwbMessage;
      if (!siwbMessage) {
        siwbMessage = await prepareLogin();
        if (!siwbMessage) {
          throw new Error('Prepare login failed did not return a SIWB message.');
        }
      }

      if (state.provider !== undefined) {
        signMessageStatus = 'pending';
        let signMessageType;
        if (state.selectedProvider === XVERSE) {
          const [addressType, _] = getAddressType(state.connectedBtcAddress);
          if (addressType === AddressType.P2TR || addressType === AddressType.P2WPKH) {
            signMessageType = { Bip322Simple: null };
          } else {
            signMessageType = { ECDSA: null };
          }
        } else if (state.selectedProvider === UNISAT || state.selectedProvider === WIZZ || state.selectedProvider === PHANTOM) {
          signMessageType = { ECDSA: null };
        } else {
          signMessageType = { Bip322Simple: null };
        }
        const signature = await state.provider.signMessage(siwbMessage as string, state.connectedBtcAddress);
        updateState({
          signMessageType,
        });

        signMessageStatus = 'success';
        if (signature === undefined) {
          signMessageStatus = 'error';
          signMessageError = new Error('No signed message returned.');
          rejectLoginWithError(signMessageError);
          return promise;
        }
        const pubKey = await state.provider.getPublicKey();
        onLoginSignatureSettled(signature, pubKey!, signMessageType, null);
      }

      // signMessage(
      //   { message: siwbMessage },
      //   {
      //     onSettled: onLoginSignatureSettled,
      //   },
      // );
    } catch (e) {
      signMessageStatus = 'error';
      signMessageError = e;
      rejectLoginWithError(e);
    }

    return promise;
  }

  /**
   * Clears the state and local storage. Effectively "logs the user out".
   */
  function clear() {
    updateState({
      isInitializing: false,
      prepareLoginStatus: 'idle',
      prepareLoginError: undefined,
      siwbMessage: undefined,
      loginStatus: 'idle',
      loginError: undefined,
      identity: undefined,
      identityAddress: undefined,
      identityPublicKey: undefined,
      delegationChain: undefined,
      connectedBtcAddress: undefined,
      connectedBtcPublicKey: undefined,
      signMessageType: undefined,
    });
    clearIdentity();
  }

  /**
   * Load the identity from local storage on mount.
   */
  useEffect(() => {
    try {
      const [a, p, i, d] = loadIdentity();

      updateState({
        identityAddress: a,
        identityPublicKey: p,
        identity: i,
        delegationChain: d,
        isInitializing: false,
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log('Could not load identity from local storage: ', e.message);
      }
      updateState({
        isInitializing: false,
      });
    }
  }, []);

  /**
   * On address change, reset the state. Action is conditional on state.isInitializing
   * being false.
   */
  useEffect(() => {
    if (state.isInitializing) return;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.connectedBtcAddress]);

  /**
   * Create an anonymous actor on mount. This actor is used during the login
   * process.
   */
  useEffect(() => {
    const a = createAnonymousActor({
      idlFactory,
      canisterId,
      httpAgentOptions,
      actorOptions,
    });
    updateState({
      anonymousActor: a,
    });
  }, [idlFactory, canisterId, httpAgentOptions, actorOptions]);

  return (
    <SiwbIdentityContext.Provider
      value={{
        ...state,
        setLaserEyes,
        prepareLogin,
        isPreparingLogin: state.prepareLoginStatus === 'preparing',
        isPrepareLoginError: state.prepareLoginStatus === 'error',
        isPrepareLoginSuccess: state.prepareLoginStatus === 'success',
        isPrepareLoginIdle: state.prepareLoginStatus === 'idle',
        login,
        isLoggingIn: state.loginStatus === 'logging-in',
        isLoginError: state.loginStatus === 'error',
        isLoginSuccess: state.loginStatus === 'success',
        isLoginIdle: state.loginStatus === 'idle',
        signMessageStatus,
        signMessageError,
        getAddress,
        getPublicKey,
        clear,
      }}
    >
      {children}
    </SiwbIdentityContext.Provider>
  );
}
function normalizeError(e: unknown) {
  throw new Error('Function not implemented.');
}
