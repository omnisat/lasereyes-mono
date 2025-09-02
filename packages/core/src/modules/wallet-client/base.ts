import type { BitcoinAccount, BitcoinAddress, GetAddressesOptionsType, GetNetworkOptionsType, PushPSBTOptionsType, RequestAccountsOptionsType, SignMessageOptionsType, SignMessageReturnType, SignPSBTOptionsType, SignPSBTReturnType, SwitchNetworkOptionsType } from "../account/types";
import type { BitcoinNetwork } from "../network/types";
import type { TXID } from "../shared/types";

export interface BaseWalletClient {
  /** Returns a list of account addresses owned by the wallet or client. */
  getAddresses(options?: GetAddressesOptionsType): PromiseLike<BitcoinAddress[]>;

  /** Returns the network currently connected to */
  getNetwork(options?: GetNetworkOptionsType): PromiseLike<BitcoinNetwork>;

  /** Switch the currently active network to the specified network */
  switchNetwork(network: BitcoinNetwork, options?: SwitchNetworkOptionsType): PromiseLike<void>

  /** Requests a list of {@link BitcoinAccount}s owned by the wallet or client. 
   * 
   * Typically used for connecting to the wallet 
   */
  requestAccounts(options?: RequestAccountsOptionsType): PromiseLike<BitcoinAccount[]>

  /** (Optional) Sends a signed PSBT to the network.
   * 
   * Sends it with the wallet if supported, defaults to
   * a public client (e.g mempool.space)
   */
  pushPSBT?(psbt: string, options?: PushPSBTOptionsType): PromiseLike<TXID>

  /** Signs a PSBT and optionally broadcast it to the network
   * 
   * Defaults to using `pushPSBT` if the wallet doesn't 
   * support directly broadcasting upon signing when 
   * `broadcast` is `true`
   */
  signPSBT(psbt: string, options?: SignPSBTOptionsType): PromiseLike<SignPSBTReturnType>

  /** Signs `message` */
  signMessage(message: string, options?: SignMessageOptionsType): PromiseLike<SignMessageReturnType>

  /** Sends bitcoin to the address specified */
  sendBTC(to: BitcoinAddress, amount: bigint): PromiseLike<TXID>
}
