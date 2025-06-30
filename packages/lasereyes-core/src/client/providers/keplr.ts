import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import {
  getKeplrChainFromNetwork,
  getNetworkFromKeplrChain,
} from '../../constants/networks'
import { BaseNetwork, NetworkType, ProviderType } from '../../types'
import { KEPLR } from '../../constants/wallets'
import { listenKeys } from 'nanostores'
import { SignMessageOptions, WalletProviderSignPsbtOptions } from '../types'
import { BIP322, BIP322_SIMPLE } from '../../constants'
import { omitUndefined } from '../../lib/utils'

interface KeplrBitcoinProvider {
  connectWallet: () => Promise<string[]> // return an array of address of current account
  getAccounts: () => Promise<string[]> // return an array of address of current account
  requestAccounts: () => Promise<string[]> // return an array of address of current account

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
        address?: string // which corresponding private key to use for signing (at least specify either an address or a public key)
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
        address?: string // which corresponding private key to use for signing (at least specify either an address or a public key)
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
    to: string, // the address to send
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

export default class KeplrProvider extends WalletProvider {
  public get library(): KeplrBitcoinProvider | undefined {
    return (window as any).keplr?.bitcoin ?? (window as any).bitcoin_keplr
  }

  public get network(): NetworkType {
    return this.$network.get()
  }
  observer?: MutationObserver

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        if (this.library) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [KEPLR]: true,
          })
          this.observer?.disconnect()
        }
      })

      this.observer.observe(document, { childList: true, subtree: true })
    }

    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== KEPLR) {
        this?.removeListeners()
        return
      }
      this.library?.getAccounts().then((accounts: string[]) => {
        this.handleAccountsChanged(accounts)
      })
      this.addListeners()
    })
  }

  addListeners() {
    this.library?.on('accountsChanged', this.handleAccountsChanged.bind(this))
    this.library?.on('networkChanged', this.handleNetworkChanged.bind(this))
  }

  removeListeners() {
    this.library?.off('accountsChanged', this.handleAccountsChanged.bind(this))
    this.library?.off('networkChanged', this.handleNetworkChanged.bind(this))
  }

  dispose() {
    this.observer?.disconnect()
    this.removeListeners()
  }

  private handleAccountsChanged(accounts: string[]) {
    if (!accounts.length) {
      this.parent.disconnect()
      return
    }

    if (this.$store.get().accounts[0] === accounts[0]) {
      return
    }

    this.$store.setKey('accounts', accounts)
    if (accounts.length > 0) {
      this.parent.connect(KEPLR)
    } else {
      this.parent.disconnect()
    }
  }
  private handleNetworkChanged: KeplrBitcoinEventHandler<
    typeof KeplrNetworkChangedEvent
  > = (network) => {
    const foundNetwork =
      network === 'mainnet'
        ? BaseNetwork.MAINNET
        : network === 'testnet'
          ? BaseNetwork.TESTNET
          : BaseNetwork.SIGNET
    if (this.network !== foundNetwork) {
      this.connect(KEPLR)
    }
  }

  async connect(_: ProviderType) {
      if (!this.library) {
        if (this.isMobile()) {
          const url = `https://deeplink.keplr.app/web-browser?url=${encodeURIComponent(window.location.href)}`
          const returned = window.open(url)
          if (!returned) {
            throw new Error('Keplr wallet not found')
          }
          returned.focus()
          return false
        } else throw new Error('Keplr wallet not found')
      }
    const accounts = await this.library.requestAccounts()
    if (!accounts) throw new Error('No accounts found')

    const pubKey = await this.library.getPublicKey()
    if (!pubKey) throw new Error('No public key found')
    this.$store.setKey('accounts', accounts)
    this.$store.setKey('address', accounts[0])
    this.$store.setKey('paymentAddress', accounts[0])
    this.$store.setKey('publicKey', pubKey)
    this.$store.setKey('paymentPublicKey', pubKey)
    const network = await this.getNetwork()
    this.$network.set(network)
  }

  async getNetwork() {
    const walletNetwork = (await this.library?.getChain()) as {
      enum: string
      name: string
      network: string
    }
    if (!walletNetwork) {
      return this.network
    }
    return getNetworkFromKeplrChain(walletNetwork.enum) as NetworkType
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const txId = await this.library?.sendBitcoin(to, amount)
    if (!txId) throw new Error('Transaction failed')
    return txId
  }

  override async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    if (!this.library) throw new Error("Keplr isn't installed")
    const protocol =
      options?.protocol === BIP322 ? BIP322_SIMPLE : options?.protocol
    return await this.library.signMessage(message, protocol)
  }

  async signPsbt({
    psbtHex,
    broadcast,
    finalize,
    inputsToSign,
  }: WalletProviderSignPsbtOptions): Promise<
    | {
        signedPsbtHex: string | undefined
        signedPsbtBase64: string | undefined
        txId?: string | undefined
      }
    | undefined
  > {
    if (!this.library) throw new Error("Keplr isn't installed")
    const signedPsbt = await this.library.signPsbt(
      psbtHex,
      omitUndefined({
        autoFinalized: finalize,
        toSignInputs: inputsToSign,
      })
    )

    const psbtSignedPsbt = bitcoin.Psbt.fromHex(signedPsbt)

    if (finalize && broadcast) {
      const txId = await this.pushPsbt(signedPsbt)
      return {
        signedPsbtHex: psbtSignedPsbt.toHex(),
        signedPsbtBase64: psbtSignedPsbt.toBase64(),
        txId,
      }
    }

    return {
      signedPsbtHex: psbtSignedPsbt.toHex(),
      signedPsbtBase64: psbtSignedPsbt.toBase64(),
      txId: undefined,
    }
  }

  async getPublicKey() {
    return await this.library?.getPublicKey()
  }
  async getBalance() {
    if (!this.library) throw new Error("Keplr isn't installed")
    const bal = await this.library.getBalance()
    return bal.total
  }

  async requestAccounts(): Promise<string[]> {
    if (!this.library) throw new Error("Keplr isn't installed")
    return await this.library.requestAccounts()
  }

  async switchNetwork(network: NetworkType): Promise<void> {
    if (!this.library) throw new Error("Keplr isn't installed")
    const supportedNetworks = [
      BaseNetwork.MAINNET,
      BaseNetwork.TESTNET,
      BaseNetwork.SIGNET,
    ] as string[]
    if (
      !(
        supportedNetworks
      ).includes(network)
    ) {
      throw new Error(
        `Invalid network: ${network}. Keplr supports ${supportedNetworks.join(', ')}`
      )
    }
    const wantedNetwork = getKeplrChainFromNetwork(network)
    await this.library.switchChain(wantedNetwork)
  }
}
