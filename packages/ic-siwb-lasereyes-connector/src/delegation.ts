import type { DerEncodedPublicKey, Signature } from '@dfinity/agent';
import type { PublicKey } from './service.interface';
import { Principal } from '@dfinity/principal';
import { Delegation } from '@dfinity/identity';
import { DelegationChain, type SignedDelegation } from '@dfinity/identity';
import type { SignedDelegation as ServiceSignedDelegation } from './service.interface';

/**
 * Converts a Uint8Array or number array to a Signature object.
 */
export function asSignature(signature: Uint8Array | number[]): Signature {
  const arrayBuffer: ArrayBuffer = (signature as Uint8Array).buffer;
  const s: Signature = arrayBuffer as Signature;
  s.__signature__ = undefined;
  return s;
}

/**
 * Converts a Uint8Array or number array to a DerEncodedPublicKey object.
 */
export function asDerEncodedPublicKey(publicKey: Uint8Array | number[]): DerEncodedPublicKey {
  const arrayBuffer: ArrayBuffer = (publicKey as Uint8Array).buffer;
  const pk: DerEncodedPublicKey = arrayBuffer as DerEncodedPublicKey;
  pk.__derEncodedPublicKey__ = undefined;
  return pk;
}

export function createDelegationChain(signedDelegation: ServiceSignedDelegation, publicKey: PublicKey) {
  const delegations: SignedDelegation[] = [
    {
      delegation: new Delegation(
        (signedDelegation.delegation.pubkey as Uint8Array).buffer,
        signedDelegation.delegation.expiration,
        signedDelegation.delegation.targets[0] as Principal[],
      ),
      signature: asSignature(signedDelegation.signature),
    },
  ];
  return DelegationChain.fromDelegations(delegations, asDerEncodedPublicKey(publicKey));
}
