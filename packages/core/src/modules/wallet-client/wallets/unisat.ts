import { Psbt } from "bitcoinjs-lib";
import { BIP322, BIP322_SIMPLE, ECDSA, UNISAT } from "../../../constants";
import { broadcastTx } from "../../../lib/helpers";
import { omitUndefined } from "../../../lib/utils";
import { BaseNetwork } from "../../../types/network";
import type { BitcoinAccount, BitcoinAddress, GetAddressesOptionsType, GetNetworkOptionsType, PushPSBTOptionsType, RequestAccountsOptionsType, SignMessageOptionsType, SignMessageReturnType, SignPSBTOptionsType, SignPSBTReturnType, SwitchNetworkOptionsType } from "../../account/types";
import type { BitcoinNetwork } from "../../network/types";
import type { TXID } from "../../shared/types";
import type { BaseWalletClient } from "../base";
import { NoAccountFoundError, RequestRejectedError, TransactionCreateFailError, WalletNotConnectedError, WalletNotInstalledError } from "../errors";
import { psbtToBase64, psbtToHex } from "../utils";


export class UnisatWalletClient implements BaseWalletClient {
  private get library() {
    // biome-ignore lint/style/noNonNullAssertion: There's already
    return (window.unisat_wallet ?? window.unisat)!
  }


  async getAddresses(_?: GetAddressesOptionsType): Promise<BitcoinAddress[]> {
    _checkWalletInstalled()
    const accounts = await this.library.getAccounts()
    if (!accounts.length) throw new WalletNotConnectedError(UNISAT)
    return accounts
  }

  async getNetwork(_?: GetNetworkOptionsType): Promise<BitcoinNetwork> {
    _checkWalletInstalled()
    const network = await this.library.getChain()
    return getNetworkForUnisat(network.enum)
  }

  async switchNetwork(network: BitcoinNetwork, _?: SwitchNetworkOptionsType): Promise<void> {
    _checkWalletInstalled()
    const currentNetwork = await this.getNetwork()
    if (currentNetwork !== network) {
      const chain = getNetworkForUnisat(network);
      const result = await this.library.switchChain(chain)
      if (result.enum !== chain) {
        throw new RequestRejectedError(`switchTo - ${chain}`, UNISAT)
      }
    }
  }

  async requestAccounts(options?: RequestAccountsOptionsType): Promise<BitcoinAccount[]> {
    _checkWalletInstalled()
    let accounts: BitcoinAddress[];
    accounts = await this.library.getAccounts()
    if (!accounts.length) {
      accounts = await this.library.requestAccounts()
    }
    const publicKey = (await this.library.getPublicKey())
    if (!accounts.length || publicKey === '0x') {
      throw new NoAccountFoundError(UNISAT)
    }

    if (options?.network) {
      await this.switchNetwork(options.network)
    }

    return accounts.map(x => ({
      address: x,
      publicKey,
    }))

  }

  async pushPSBT?(psbt: string, options?: PushPSBTOptionsType): Promise<TXID> {
    _checkWalletInstalled()
    let payload = psbt
    if (!payload.startsWith('02')) {
      const psbtObj = Psbt.fromHex(psbtToHex(payload))
      payload = psbtObj.extractTransaction().toHex()
    }
    const network = await this.getNetwork()

    return await (options?.broadcastTxFn?.(payload, network) ?? broadcastTx(payload, network))
  }

  async signPSBT(psbt: string, options?: SignPSBTOptionsType): Promise<SignPSBTReturnType> {
    _checkWalletInstalled()
    const { finalize, broadcast, inputsToSign } = options ?? {}
    const psbtHex = psbtToHex(psbt)
    const signedPsbt = await this.library?.signPsbt(
      psbtHex,
      omitUndefined({
        autoFinalized: finalize,
        toSignInputs: inputsToSign,
      })
    )

    let txID: string | undefined
    if (finalize && broadcast) {
      txID = await this.pushPSBT?.(signedPsbt);
    }

    return {
      signedPSBTHex: signedPsbt,
      signedPSBTbase64: psbtToBase64(signedPsbt),
      txID,
    }
  }

  async signMessage(message: string, options?: SignMessageOptionsType): Promise<SignMessageReturnType> {
    _checkWalletInstalled()
    const protocol = options?.protocol === BIP322 ? BIP322_SIMPLE : options?.protocol
    return {
      signedMessage: await this.library?.signMessage(message, protocol),
      protocol: options?.protocol ?? UNISAT_DEFAULT_PROTOCOL
    }
  }

  async sendBTC(to: BitcoinAddress, amount: bigint): Promise<TXID> {
    _checkWalletInstalled()
    const txId = await this.library.sendBitcoin(to, Number(amount))
    if (!txId) throw new TransactionCreateFailError('', UNISAT)
    return txId
  }
}


interface UnisatWalletProviderInterface {
  signMessage(message: string, protocol?: string): PromiseLike<string>;
  requestAccounts(): Promise<BitcoinAddress[]>
  getAccounts(): Promise<BitcoinAddress[]>
  disconnect(): Promise<void>
  getPublicKey(): Promise<string>
  getChain(): Promise<{
    enum: string
    name: string
    network: string
  }>
  switchChain(chain: string): Promise<{
    enum: string
    name: string
    network: string
  }>
  signPsbt(psbtHex: string, options?: {
    autoFinalized?: boolean
    toSignInputs?: {
      index: number
      address?: string
      publicKey?: string
      sighashTypes?: number[]
      disableTweakSigner?: boolean
      useTweakedSigner?: boolean
    }[]
  }): Promise<string>
  sendBitcoin(toAddress: BitcoinAddress, satoshis: number, options?: {
    feeRate: number
    memo: string
    memos?: string[]
  }): PromiseLike<TXID>
}

declare global {
  interface Window {
    unisat?: UnisatWalletProviderInterface
    unisat_wallet?: UnisatWalletProviderInterface
  }
}

function _checkWalletInstalled() {
  if (!window.unisat_wallet && !window.unisat) {
    throw new WalletNotInstalledError(UNISAT)
  }
}

const getNetworkForUnisat = (network: string): BitcoinNetwork => {
  if (network === UnisatNetwork.MAINNET) return BaseNetwork.MAINNET
  if (network === UnisatNetwork.TESTNET) return BaseNetwork.TESTNET
  if (network === UnisatNetwork.TESTNET4) return BaseNetwork.TESTNET4
  if (network === UnisatNetwork.SIGNET) return BaseNetwork.SIGNET
  if (network === UnisatNetwork.FRACTAL_MAINNET)
    return BaseNetwork.FRACTAL_MAINNET
  if (network === UnisatNetwork.FRACTAL_TESTNET) return BaseNetwork.TESTNET
  return BaseNetwork.MAINNET
}

export const getUnisatNetwork = (network: string) => {
  if (network === BaseNetwork.MAINNET) return UnisatNetwork.MAINNET
  if (network === BaseNetwork.TESTNET) return UnisatNetwork.TESTNET
  if (network === BaseNetwork.TESTNET4) return UnisatNetwork.TESTNET4
  if (network === BaseNetwork.SIGNET) return UnisatNetwork.SIGNET
  if (network === BaseNetwork.FRACTAL_MAINNET)
    return UnisatNetwork.FRACTAL_MAINNET
  if (network === BaseNetwork.FRACTAL_TESTNET)
    return UnisatNetwork.FRACTAL_TESTNET
  return UnisatNetwork.MAINNET
}


const UNISAT_DEFAULT_PROTOCOL = ECDSA

export enum UnisatNetwork {
  MAINNET = 'BITCOIN_MAINNET',
  TESTNET = 'BITCOIN_TESTNET',
  TESTNET4 = 'BITCOIN_TESTNET4',
  SIGNET = 'BITCOIN_SIGNET',
  FRACTAL_MAINNET = 'FRACTAL_BITCOIN_MAINNET',
  FRACTAL_TESTNET = 'FRACTAL_BITCOIN_TESTNET',
}
