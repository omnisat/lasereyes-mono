import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import {
  ProviderType,
  NetworkType,
  LeatherRPCResponse,
  LeatherRequestAddressResponse,
  LeatherAddress,
  LeatherRequestSignResponse,
  SignPsbtRequestParams,
  Config,
} from '../../types'
import { getBTCBalance, isMainnetNetwork } from '../../lib/helpers'
import { LEATHER, P2TR, P2WPKH } from '../../constants/wallets'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import { LaserEyesStoreType, SignMessageOptions } from '../types'
import { ECDSA, SIGNET, TESTNET, TESTNET4 } from '../../constants'
import { RpcErrorCode } from 'sats-connect'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'
import { LaserEyesClient } from '..'

const LEATHER_WALLET_PERSISTENCE_KEY = 'LEATHER_CONNECTED_WALLET_STATE'

export default class LeatherProvider extends WalletProvider {
  constructor(stores: {
    $store: MapStore<LaserEyesStoreType>
    $network: WritableAtom<NetworkType>
  },
    parent: LaserEyesClient,
    config?: Config
  ) {
    super(stores, parent, config)
  }

  public get library(): any | undefined {
    return (window as any).LeatherProvider
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

  removeSubscriber?: Function

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
        const leatherLib = (window as any)?.LeatherProvider
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
    const { address, paymentAddress } = this.$valueStore!.get()

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

    if (
      String(taprootAddress?.address)?.startsWith('tb') &&
      this.network !== TESTNET &&
      this.network !== TESTNET4 &&
      this.network !== SIGNET
    ) {
      throw new Error(
        `Please switch networks to ${this.network} in the wallet settings.`
      )
    }

    this.$store.setKey('accounts', leatherAccountsParsed)
    this.$store.setKey('address', taprootAddress.address)
    this.$store.setKey('paymentAddress', segwitAddress.address)
    this.$store.setKey('publicKey', taprootAddress.publicKey)
    this.$store.setKey('paymentPublicKey', segwitAddress.publicKey)
  }

  async getNetwork() {
    return this.network
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const response = await this.library?.request('sendTransfer', {
      recipients: [
        {
          address: to,
          amount: amount,
        },
      ],
    })
    if (response?.result?.txid) {
      return response.result.txid
    } else {
      if (response.error.code === RpcErrorCode.USER_REJECTION) {
        throw new Error('User rejected the request')
      } else {
        throw new Error('Error sending BTC: ' + response.error.message)
      }
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
    const signed = await this.library.request('signMessage', {
      message: message,
      paymentType,
    })
    return signed?.result?.signature
  }
  async signPsbt(
    _: string,
    psbtHex: string,
    __: string,
    finalize?: boolean | undefined,
    broadcast?: boolean | undefined
  ): Promise<
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
    }

    const response: LeatherRPCResponse = await this.library.request(
      'signPsbt',
      requestParams
    )
    const leatherHexResult = response.result as LeatherRequestSignResponse
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
    } else if (finalize) {
      const finalized = signed.finalizeAllInputs()
      return {
        signedPsbtHex: finalized.toHex(),
        signedPsbtBase64: finalized.toBase64(),
        txId: undefined,
      }
    } else {
      return {
        signedPsbtHex: signed.toHex(),
        signedPsbtBase64: signed.toBase64(),
        txId: undefined,
      }
    }
  }

  async getPublicKey() {
    const { result } = (await this.library.request(
      'getAddresses'
    )) as LeatherRPCResponse
    const addresses = (result as LeatherRequestAddressResponse).addresses
    const taprootAddress = addresses.find(
      (address: LeatherAddress) => address.type === P2TR
    )
    if (!taprootAddress?.publicKey) {
      throw new Error('No accounts found')
    }
    return taprootAddress.publicKey
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
    const { result } = (await this.library.request(
      'getAddresses'
    )) as LeatherRPCResponse
    const addresses = (result as LeatherRequestAddressResponse).addresses
    const accounts = addresses.map((address: LeatherAddress) => address.address)
    this.$store.setKey('accounts', accounts)
    return accounts
  }
}
