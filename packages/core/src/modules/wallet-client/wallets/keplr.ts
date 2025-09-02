import { Psbt } from "bitcoinjs-lib";
import { BIP322, BIP322_SIMPLE, ECDSA, KEPLR } from "../../../constants";
import { broadcastTx } from "../../../lib/helpers";
import { omitUndefined } from "../../../lib/utils";
import { BaseNetwork } from "../../../types/network";
import type { BitcoinAccount, BitcoinAddress, GetAddressesOptionsType, GetNetworkOptionsType, PushPSBTOptionsType, RequestAccountsOptionsType, SignMessageOptionsType, SignMessageReturnType, SignPSBTOptionsType, SignPSBTReturnType, SwitchNetworkOptionsType } from "../../account/types";
import type { BitcoinNetwork } from "../../network/types";
import type { TXID } from "../../shared/types";
import type { BaseWalletClient } from "../base";
import { NoAccountFoundError, RequestRejectedError, TransactionCreateFailError, WalletNotConnectedError, WalletNotInstalledError } from "../errors";
import { isMobile, psbtToBase64, psbtToHex } from "../utils";


export class KeplrWalletClient implements BaseWalletClient {
  private get library() {
    // biome-ignore lint/style/noNonNullAssertion: There's already
    return (window.keplr?.bitcoin ?? window.bitcoin_keplr)!
  }


  async getAddresses(_?: GetAddressesOptionsType): Promise<BitcoinAddress[]> {
    _checkWalletInstalled()
    const accounts = await this.library.getAccounts()
    if (!accounts.length) throw new WalletNotConnectedError(KEPLR)
    return accounts
  }

  async getNetwork(_?: GetNetworkOptionsType): Promise<BitcoinNetwork> {
    _checkWalletInstalled()
    const network = await this.library.getChain()
    return getNetworkFromKeplrChain(network.enum)
  }

  async switchNetwork(network: BitcoinNetwork, _?: SwitchNetworkOptionsType): Promise<void> {
    _checkWalletInstalled()

    if (!KEPLR_SUPPORTED_NETWORKS.includes(network)) {
      throw new Error(
        `Invalid network: ${network}. Keplr supports ${KEPLR_SUPPORTED_NETWORKS.join(', ')}`
      )
    }
    const currentNetwork = await this.getNetwork()
    if (currentNetwork !== network) {
      const chain = getKeplrChainFromNetwork(network);
      const result = await this.library.switchChain(chain)
      if (result !== chain) {
        throw new RequestRejectedError(`switchTo - ${chain}`, KEPLR)
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
      throw new NoAccountFoundError(KEPLR)
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
      protocol: options?.protocol ?? KEPLR_DEFAULT_PROTOCOL
    }
  }

  async sendBTC(to: BitcoinAddress, amount: bigint): Promise<TXID> {
    _checkWalletInstalled()
    const txId = await this.library.sendBitcoin(to, Number(amount))
    if (!txId) throw new TransactionCreateFailError('', KEPLR)
    return txId
  }
}



type KeplrBitcoinNetwork = 'mainnet' | 'signet' | 'testnet'

type KeplrBitcoinEvent = 'accountsChanged' | 'networkChanged'
const KeplrAccountsChangedEvent = 'accountsChanged'
const KeplrNetworkChangedEvent = 'networkChanged'
type KeplrBitcoinEventMap = {
  [KeplrAccountsChangedEvent]: (accounts: Array<string>) => void
  [KeplrNetworkChangedEvent]: (network: KeplrBitcoinNetwork) => void
}

type KeplrBitcoinEventHandler<T extends KeplrBitcoinEvent> =
  KeplrBitcoinEventMap[T]


interface KeplrBitcoinProvider {
  connectWallet: () => Promise<BitcoinAddress[]> // return an array of address of current account
  getAccounts: () => Promise<BitcoinAddress[]> // return an array of address of current account
  requestAccounts: () => Promise<BitcoinAddress[]> // return an array of address of current account

  getPublicKey: () => Promise<string> // return a public key of current account

  disconnect: () => Promise<void>

  getBalance: () => Promise<{
    confirmed: number // the confirmed satoshis
    unconfirmed: number // the unconfirmed satoshis
    total: number // the total satoshis
  }>

  getChain: () => Promise<{
    enum: string
    name: string
    network: string
  }>

  switchChain: (
    network: 'BITCOIN_MAINNET' | 'BITCOIN_TESTNET' | 'BITCOIN_SIGNET'
  ) => Promise<'BITCOIN_MAINNET' | 'BITCOIN_TESTNET' | 'BITCOIN_SIGNET'> // return a network id to switch

  signPsbt: (
    psbtHex: string, // the hex string of psbt to sign
    options?: {
      autoFinalized?: boolean // whether finalize psbt after signing, default is true
      toSignInputs?: Array<{
        // specify which inputs to sign
        index: number // which input to sign
        address?: BitcoinAddress // which corresponding private key to use for signing (at least specify either an address or a public key)
        publicKey?: string // which corresponding private key to use for signing (at least specify either an address or a public key)
        sighashTypes?: number[] // sighash types for the input
        disableTweakSigner?: boolean // set true to use original private key when signing taproot inputs, default is false
        useTweakedSigner?: boolean // force whether to use tweaked signer. higher priority than disableTweakSigner
      }>
    }
  ) => Promise<string> // return a hex string of signed psbt

  signPsbts: (
    psbtsHexes: string[], // the hex strings of psbts to sign
    options?: {
      autoFinalized?: boolean // whether finalize psbt after signing, default is true
      toSignInputs?: Array<{
        // specify which inputs to sign
        index: number // which input to sign
        address?: BitcoinAddress // which corresponding private key to use for signing (at least specify either an address or a public key)
        publicKey?: string // which corresponding private key to use for signing (at least specify either an address or a public key)
        sighashTypes?: number[] // sighash types for the input
        disableTweakSigner?: boolean // set true to use original private key when signing taproot inputs, default is false
        useTweakedSigner?: boolean // force whether to use tweaked signer. higher priority than disableTweakSigner
      }>
    }
  ) => Promise<string[]> // return an array of hex strings of signed psbts
  signMessage: (
    message: string, // a string to sign
    type?: 'ecdsa' | 'bip322-simple' // signing method type, default is "ecdsa"
  ) => Promise<string> // return a signature of signed message

  sendBitcoin: (
    to: BitcoinAddress, // the address to send
    amount: number // the satoshis to send
  ) => Promise<string> // return the tx id

  pushTx: (
    rawTxHex: string // hex string of raw tx to push
  ) => Promise<string> // return the tx id

  pushPsbt: (
    psbtHex: string // hex string of psbt to push
  ) => Promise<string> // return the tx id

  on<T extends KeplrBitcoinEvent>(
    event: T,
    handler: KeplrBitcoinEventHandler<T>
  ): void
  off<T extends KeplrBitcoinEvent>(
    event: T,
    handler: KeplrBitcoinEventHandler<T>
  ): void
}


declare global {
  interface Window {
    keplr?: {
      bitcoin?: KeplrBitcoinProvider
    }
    bitcoin_keplr?: KeplrBitcoinProvider
  }
}

function _checkWalletInstalled() {
  if (!window.keplr?.bitcoin && !window.bitcoin_keplr) {
    if (isMobile()) {
      const url = `https://deeplink.keplr.app/web-browser?url=${window.location.href}`
      const returned = window.open(url)
      if (returned) {
        returned.focus()
      }
    }
    throw new WalletNotInstalledError(KEPLR)
  }
}

const getNetworkFromKeplrChain = (network: string) => {
  if (network === KeplrChain.BITCOIN_MAINNET) return BaseNetwork.MAINNET
  if (network === KeplrChain.BITCOIN_TESTNET) return BaseNetwork.TESTNET
  if (network === KeplrChain.BITCOIN_SIGNET) return BaseNetwork.SIGNET
  return BaseNetwork.MAINNET
}

const getKeplrChainFromNetwork = (network: string) => {
  if (network === BaseNetwork.MAINNET) return KeplrChain.BITCOIN_MAINNET
  if (network === BaseNetwork.TESTNET) return KeplrChain.BITCOIN_TESTNET
  if (network === BaseNetwork.SIGNET) return KeplrChain.BITCOIN_SIGNET
  return KeplrChain.BITCOIN_MAINNET
}


const KEPLR_DEFAULT_PROTOCOL = ECDSA

const KEPLR_SUPPORTED_NETWORKS = [
  BaseNetwork.MAINNET,
  BaseNetwork.TESTNET,
  BaseNetwork.SIGNET,
] as string[]

export enum KeplrChain {
  BITCOIN_MAINNET = 'BITCOIN_MAINNET',
  BITCOIN_TESTNET = 'BITCOIN_TESTNET',
  BITCOIN_SIGNET = 'BITCOIN_SIGNET',
}
