import { DelegationChain, DelegationIdentity, Ed25519KeyIdentity } from '@dfinity/identity';

import type { SiwbIdentityStorage } from './storage.type';

const STORAGE_KEY = 'siwbIdentity';

/**
 * Loads the SIWB identity from local storage.
 */
export function loadIdentity() {
  const storedState = localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    throw new Error('No stored identity found.');
  }

  const s: SiwbIdentityStorage = JSON.parse(storedState);
  if (!s.address || !s.sessionIdentity || !s.delegationChain) {
    throw new Error('Stored state is invalid.');
  }

  const d = DelegationChain.fromJSON(JSON.stringify(s.delegationChain));
  const i = DelegationIdentity.fromDelegation(Ed25519KeyIdentity.fromJSON(JSON.stringify(s.sessionIdentity)), d);

  return [s.address, s.publicKey, i, d] as const;
}

/**
 * Saves the SIWB identity to local storage.
 */
export function saveIdentity(address: string, publickey: string, sessionIdentity: Ed25519KeyIdentity, delegationChain: DelegationChain) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      address: address,
      publicKey: publickey,
      sessionIdentity: sessionIdentity.toJSON(),
      delegationChain: delegationChain.toJSON(),
    }),
  );
}

/**
 * Clears the SIWB identity from local storage.
 */
export function clearIdentity() {
  localStorage.removeItem(STORAGE_KEY);
}
