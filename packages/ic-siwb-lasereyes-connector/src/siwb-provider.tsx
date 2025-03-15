import { HttpAgent, type ActorConfig, type HttpAgentOptions, Actor, type DerEncodedPublicKey, type ActorSubclass } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { SignMessageType, SIWB_IDENTITY_SERVICE } from './service.interface';

/**
 * Creates an anonymous actor for interactions with the Internet Computer.
 * This is used primarily for the initial authentication process.
 */
export function createAnonymousActor({
  idlFactory,
  canisterId,
  httpAgentOptions,
  actorOptions,
}: {
  idlFactory: IDL.InterfaceFactory;
  canisterId: string;
  httpAgentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
}) {
  if (!idlFactory || !canisterId) return;
  const agent = HttpAgent.createSync({ ...httpAgentOptions });

  if (process.env.DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }

  return Actor.createActor<SIWB_IDENTITY_SERVICE>(idlFactory, {
    agent,
    canisterId,
    ...actorOptions,
  });
}

export async function callPrepareLogin(anonymousActor: ActorSubclass<SIWB_IDENTITY_SERVICE>, address: string | undefined) {
  if (!anonymousActor || !address) {
    throw new Error('Invalid actor or address');
  }

  const response = await anonymousActor.siwb_prepare_login(address);

  if ('Err' in response) {
    throw new Error(response.Err);
  }

  return response.Ok;
}

/**
 * Logs in the user by sending a signed SIWB message to the backend.
 */
export async function callLogin(
  anonymousActor: ActorSubclass<SIWB_IDENTITY_SERVICE>,
  data: string | undefined,
  address: string | undefined,
  publickeyHex: string | undefined,
  sessionPublicKey: DerEncodedPublicKey,
  signMessageType: SignMessageType | undefined,
) {
  if (!anonymousActor || !data || !address || !publickeyHex || !signMessageType) {
    throw new Error('Invalid actor, data , address or signMessageType');
  }

  const loginReponse = await anonymousActor.siwb_login(data, address, publickeyHex, new Uint8Array(sessionPublicKey), signMessageType);

  if ('Err' in loginReponse) {
    throw new Error(loginReponse.Err);
  }

  return loginReponse.Ok;
}

/**
 * Retrieves a delegation from the backend for the current session.
 */
export async function callGetDelegation(
  anonymousActor: ActorSubclass<SIWB_IDENTITY_SERVICE>,
  address: string | undefined,
  sessionPublicKey: DerEncodedPublicKey,
  expiration: bigint,
) {
  if (!anonymousActor || !address) {
    throw new Error('Invalid actor or address');
  }

  const response = await anonymousActor.siwb_get_delegation(address, new Uint8Array(sessionPublicKey), expiration);

  if ('Err' in response) {
    throw new Error(response.Err);
  }

  return response.Ok;
}
