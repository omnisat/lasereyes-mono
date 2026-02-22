import type { BIP322, ECDSA } from '../constants/signing-protocol'
import type { NetworkType, ProviderType } from '../types'

export * from './modules/types'

/**
 * The reactive state shape for the LaserEyes client store.
 *
 * @remarks
 * Managed internally by a nanostores `MapStore`. Subscribe to `$store` on the
 * {@link LaserEyesClient} to receive reactive updates when wallet state changes.
 *
 * @property provider - The currently connected wallet provider, or `undefined` if disconnected.
 * @property address - The connected wallet's ordinals/taproot address.
 * @property paymentAddress - The connected wallet's payment (segwit) address.
 * @property publicKey - The public key for the ordinals/taproot address.
 * @property paymentPublicKey - The public key for the payment address.
 * @property connected - Whether a wallet is currently connected.
 * @property isConnecting - Whether a wallet connection is in progress.
 * @property isInitializing - Whether the client is still detecting available wallet providers.
 * @property accounts - List of account addresses returned by the wallet.
 * @property balance - The wallet's BTC balance in satoshis, or `undefined` if not yet fetched.
 * @property hasProvider - Map of each wallet provider to whether it is detected in the browser.
 */
export type LaserEyesStoreType = {
  provider: ProviderType | undefined
  address: string
  paymentAddress: string
  publicKey: string
  paymentPublicKey: string
  connected: boolean
  isConnecting: boolean
  isInitializing: boolean
  accounts: string[]
  balance: bigint | undefined
  hasProvider: Record<ProviderType, boolean | undefined>
}

/** Interface for the Sparrow wallet browser extension provider. */
export interface SparrowWalletProvider {
  requestAccounts(network?: NetworkType): Promise<string[]>
  getPublicKey(network?: NetworkType): Promise<string>
  getNetwork(): Promise<NetworkType>
  switchNetwork(network: NetworkType): Promise<
    | undefined
    | {
        address: string
        paymentAddress: string
        publicKey: string
      }
  >
  signMessage(message: string): Promise<string>
  signPsbt(psbtBase64: string): Promise<string>
}

/**
 * Options for signing a message.
 *
 * @property toSignAddress - The specific address to use for signing. Defaults to the connected address if omitted.
 * @property protocol - The signing protocol to use: BIP-322 or ECDSA.
 */
export type SignMessageOptions = {
  toSignAddress?: string
  protocol?: typeof BIP322 | typeof ECDSA
}

/**
 * Options for signing a single PSBT via the LaserEyes client.
 *
 * @property tx - The PSBT as a hex or base64 encoded string.
 * @property finalize - Whether to finalize the PSBT after signing. Defaults to `false`.
 * @property broadcast - Whether to broadcast the transaction after signing. Defaults to `false`.
 * @property inputsToSign - Optional array specifying which inputs to sign and with which address.
 */
export type LaserEyesSignPsbtOptions = {
  tx: string
  finalize?: boolean
  broadcast?: boolean
  inputsToSign?: InputToSign[]
}

/**
 * Options for signing multiple PSBTs in a single batch operation.
 *
 * @property psbts - Array of PSBTs as hex or base64 encoded strings.
 * @property finalize - Whether to finalize the PSBTs after signing. Defaults to `false`.
 * @property broadcast - Whether to broadcast the transactions after signing. Defaults to `false`.
 * @property inputsToSign - Optional array specifying which inputs to sign and with which address.
 */
export type LaserEyesSignPsbtsOptions = {
  psbts: string[]
  finalize?: boolean
  broadcast?: boolean
  inputsToSign?: InputToSign[]
}

/**
 * Specifies a PSBT input to sign along with the address that owns it.
 *
 * @property index - The zero-based index of the input in the PSBT.
 * @property address - The Bitcoin address that owns this input.
 */
export type InputToSign = {
  index: number
  address: string
}

/** Internal options passed to wallet provider implementations when signing a single PSBT. */
export type WalletProviderSignPsbtOptions = {
  tx: string
  psbtHex: string
  psbtBase64: string
  finalize?: boolean
  broadcast?: boolean
  inputsToSign?: InputToSign[]
  network?: NetworkType
}

/** Internal options passed to wallet provider implementations when signing multiple PSBTs. */
export type WalletProviderSignPsbtsOptions = {
  psbts: string[]
  finalize?: boolean
  broadcast?: boolean
  inputsToSign?: InputToSign[]
  network?: NetworkType
}

/**
 * Response returned after signing a single PSBT.
 *
 * @remarks
 * Contains the signed PSBT in both hex and base64 formats.
 * If the PSBT was broadcast, `txId` will contain the transaction ID.
 * Returns `undefined` if signing failed silently.
 */
export type SignPsbtResponse =
  | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
  | undefined

/**
 * Response returned after signing multiple PSBTs in a batch.
 *
 * @remarks
 * Contains an array of signed PSBTs, each with hex and base64 representations.
 * Returns `undefined` if signing failed silently.
 */
export type SignPsbtsResponse =
  | {
      signedPsbts: {
        signedPsbtHex: string | undefined
        signedPsbtBase64: string | undefined
        txId?: string | undefined
      }[]
    }
  | undefined
