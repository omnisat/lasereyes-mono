import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import {
  type ProviderType,
  type NetworkType,
  type LeatherRPCResponse,
  type LeatherRequestAddressResponse,
  type LeatherAddress,
  type LeatherRequestSignResponse,
  type SignPsbtRequestParams,
  BaseNetwork,
} from '../../types'
import { getBTCBalance, isMainnetNetwork } from '../../lib/helpers'
import { LEATHER, P2TR, P2WPKH } from '../../constants/wallets'
import { listenKeys, type MapStore } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import type {
  LaserEyesStoreType,
  SignMessageOptions,
  WalletProviderSignPsbtOptions,
} from '../types'
import { ECDSA } from '../../constants'
import { RpcErrorCode } from 'sats-connect'
import {
  handleStateChangePersistence,
  keysToPersist,
  type PersistedKey,
} from '../utils'

const LEATHER_WALLET_PERSISTENCE_KEY = 'LEATHER_CONNECTED_WALLET_STATE'

export default class LeatherProvider extends WalletProvider {

  public get library(): { request: (method: string, params?: object) => Promise<LeatherRPCResponse> } | undefined {
    return (window as unknown as { LeatherProvider: { request: (method: string, params?: object) => Promise<LeatherRPCResponse> } })
      ?.LeatherProvider
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    LEATHER_WALLET_PERSISTENCE_KEY,
    {
      address: '',
      publicKey: '',
      paymentAddress: '',
      paymentPublicKey: '',
      balance: '',
    }
  )

  removeSubscriber?: () => void

  restorePersistedValues() {
    const vals = this.$valueStore.get()
    for (const key of keysToPersist) {
      if (key === 'balance') {
        this.$store.setKey(key, BigInt(vals[key]))
      }
      this.$store.setKey(key, vals[key])
    }
    this.$store.setKey(
      'accounts',
      [vals.address, vals.paymentAddress].filter(Boolean)
    )
  }

  watchStateChange(
    newState: LaserEyesStoreType,
    _: LaserEyesStoreType | undefined,
    changedKey: keyof LaserEyesStoreType | undefined
  ) {
    handleStateChangePersistence(
      LEATHER,
      newState,
      changedKey,
      this.$valueStore
    )
  }

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const leatherLib = (window as unknown as { LeatherProvider: unknown })
          ?.LeatherProvider
        if (leatherLib) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [LEATHER]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer.observe(document, { childList: true, subtree: true })
    }
    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== LEATHER) {
        if (this.removeSubscriber) {
          this.$valueStore.set({
            address: '',
            publicKey: '',
            paymentAddress: '',
            paymentPublicKey: '',
            balance: '',
          })
          this.removeSubscriber()
          this.removeSubscriber = undefined
        }
      } else {
        this.removeSubscriber = this.$store.subscribe(
          this.watchStateChange.bind(this)
        )
      }
    })
  }

  dispose() {
    this.observer?.disconnect()
  }

  async connect(_: ProviderType): Promise<void> {
    const { address, paymentAddress } = this.$valueStore.get()

    if (address) {
      if (address.startsWith('tb1') && isMainnetNetwork(this.network)) {
        this.disconnect()
      } else {
        this.restorePersistedValues()
        getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
          this.$store.setKey('balance', totalBalance)
        })
        return
      }
    }

    if (!this.library) throw new Error("Leather isn't installed")
    const getAddressesResponse: LeatherRPCResponse =
      await this.library.request('getAddresses')
    if (!getAddressesResponse) throw new Error('No accounts found')
    const addressesResponse =
      getAddressesResponse.result as LeatherRequestAddressResponse
    const addresses: LeatherAddress[] = addressesResponse.addresses
    const leatherAccountsParsed = addresses.map(
      (address: LeatherAddress) => address.address
    )
    const taprootAddress = addresses.find(
      (address: LeatherAddress) => address.type === P2TR
    )
    const segwitAddress = addresses.find(
      (address: LeatherAddress) => address.type === P2WPKH
    )

    if (!taprootAddress?.publicKey || !segwitAddress?.publicKey) {
      throw new Error('No accounts found')
    }

    // if (
    //   String(taprootAddress?.address)?.startsWith('tb') &&
    //   this.network !== TESTNET &&
    //   this.network !== TESTNET4 &&
    //   this.network !== SIGNET
    // ) {
    //   throw new Error(
    //     `Please switch networks to ${this.network} in the wallet settings.`
    //   )
    // }

    this.$store.setKey('accounts', leatherAccountsParsed)
    this.$store.setKey('address', taprootAddress.address)
    this.$store.setKey('paymentAddress', segwitAddress.address)
    this.$store.setKey('publicKey', taprootAddress.publicKey)
    this.$store.setKey('paymentPublicKey', segwitAddress.publicKey)
  }

  async getNetwork() {
    if (this.$store.get().address.startsWith('t')) {
      const network = this.config?.network ?? this.network
      if (network !== BaseNetwork.MAINNET) {
        return network
      }
      return BaseNetwork.TESTNET
    }
    return BaseNetwork.MAINNET
  }

  async switchNetwork(_network: NetworkType): Promise<void> {
    // Await delay to allow user to switch network
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const response = prompt(
      `Please switch your network in Leather wallet to ${_network}. Type OK in this prompt when you have done that.`
    )
    if (response?.trim().toLowerCase() === 'ok') {
      this.$network.set(_network)
      return
    }
    throw new Error('User cancelled request to switch network')
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    try {
      const response = await this.library?.request('sendTransfer', {
        recipients: [
          {
            address: to,
            amount: String(amount),
          },
        ],
        network: this.network,
      })
      if ((response?.result as LeatherRequestSignResponse).txid) {
        return (response?.result as LeatherRequestSignResponse).txid
      }
      if (response?.error?.code === RpcErrorCode.USER_REJECTION) {
        throw new Error('User rejected the request')
      }
      throw new Error(`Error sending BTC: ${response?.error?.message}`)
    } catch (e: unknown) {
      console.log(e)
      throw new Error('error sending BTC')
    }
  }
  async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    const toSignAddress = options?.toSignAddress
    const protocol = options?.protocol
    if (protocol === ECDSA)
      throw new Error("Leather doesn't support ECDSA message signing")
    const paymentType =
      toSignAddress === this.$store.get().address ? P2TR : P2WPKH
    if (
      toSignAddress !== this.$store.get().address &&
      toSignAddress !== this.$store.get().paymentAddress
    ) {
      throw new Error('Invalid address to sign message')
    }
    const signed = await this.library?.request('signMessage', {
      message: message,
      paymentType,
    })
    return (signed?.result as LeatherRequestSignResponse).signature
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
    const requestParams: SignPsbtRequestParams = {
      hex: psbtHex,
      broadcast: false,
      network: this.network,
      signAtIndex: inputsToSign?.map((input) => input.index),
    }

    const response = await this.library?.request(
      'signPsbt',
      requestParams
    )
    const leatherHexResult = response?.result as LeatherRequestSignResponse
    const signedTx = leatherHexResult.hex
    const signed = bitcoin.Psbt.fromHex(String(signedTx))

    if (finalize && broadcast) {
      const finalized = signed.finalizeAllInputs()
      const txId = await this.pushPsbt(finalized.toHex())
      return {
        signedPsbtHex: signed.toHex(),
        signedPsbtBase64: signed.toBase64(),
        txId,
      }
    }if (finalize) {
      const finalized = signed.finalizeAllInputs()
      return {
        signedPsbtHex: finalized.toHex(),
        signedPsbtBase64: finalized.toBase64(),
        txId: undefined,
      }
    }
      return {
        signedPsbtHex: signed.toHex(),
        signedPsbtBase64: signed.toBase64(),
        txId: undefined,
      }
  }

  async getPublicKey() {
    return this.$store.get().publicKey
  }

  async getBalance() {
    const bal = await getBTCBalance(
      this.$store.get().paymentAddress,
      this.network
    )
    this.$store.setKey('balance', bal)
    return bal.toString()
  }

  async requestAccounts(): Promise<string[]> {
    const { accounts: accountsFromStore } = this.$store.get()
    if (accountsFromStore.length > 0) {
      return accountsFromStore
    }
    const response = (await this.library?.request(
      'getAddresses'
    ))
    if (!response) throw new Error('No accounts found')
    const result = response.result as LeatherRequestAddressResponse
    const addresses = (result).addresses
    const accounts = addresses.map((address: LeatherAddress) => address.address)
    this.$store.setKey('accounts', accounts)
    return accounts
  }
}
