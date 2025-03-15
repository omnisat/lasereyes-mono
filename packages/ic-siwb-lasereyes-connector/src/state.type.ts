import type { NetworkType, ProviderType } from '@omnisat/lasereyes';
import type { ActorSubclass } from '@dfinity/agent';

import type { DelegationChain, DelegationIdentity } from '@dfinity/identity';
import type { SignMessageType, SIWB_IDENTITY_SERVICE } from './service.interface';
import type { LaserEyesClient } from '@omnisat/lasereyes-core';
export type PrepareLoginStatus = 'error' | 'preparing' | 'success' | 'idle';
export type LoginStatus = 'error' | 'logging-in' | 'success' | 'idle';

export type State = {
  selectedProvider?: ProviderType;
  connectedBtcAddress?: string;
  connectedBtcPublicKey?: string;
  provider?: LaserEyesClient;
  network?: NetworkType;
  anonymousActor?: ActorSubclass<SIWB_IDENTITY_SERVICE>;
  isInitializing: boolean;
  prepareLoginStatus: PrepareLoginStatus;
  prepareLoginError?: Error;
  siwbMessage?: string;
  loginStatus: LoginStatus;
  loginError?: Error;
  identity?: DelegationIdentity;
  identityAddress?: string;
  identityPublicKey?: string;
  delegationChain?: DelegationChain;
  signMessageType?: SignMessageType;
};
