import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import {
  type ProviderType,
  type NetworkType,
  type SignPsbtRequestParams,
} from '../../types'
import { type LeatherProvider as LeatherRPC, RpcErrorCode, type RpcErrorResponse } from '@leather.io/rpc';
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
import {
  handleStateChangePersistence,
  keysToPersist,
  type PersistedKey,
} from '../utils'

const LEATHER_WALLET_PERSISTENCE_KEY = 'LEATHER_CONNECTED_WALLET_STATE'

export default class LeatherProvider extends WalletProvider {

  public get library(): LeatherRPC | undefined {
    return window?.LeatherProvider
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

    const addresses = (await this.library.request('getAddresses', { network: this.config?.network ?? this.network })).result.addresses
    if (!addresses) throw new Error('No accounts found')

    const leatherAccountsParsed = addresses.map((address) => address.address)
    const taprootAddress = addresses.find((address) => address.type === P2TR)
    const segwitAddress = addresses.find((address) => address.type === P2WPKH)

    if (!taprootAddress?.publicKey || !segwitAddress?.publicKey) {
      throw new Error('No accounts found')
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

  async switchNetwork(_network: NetworkType): Promise<void> {
    if (_network !== this.network) {
      if (!this.library) throw new Error("Leather isn't installed")

      const addresses = (await this.library.request('getAddresses', { network: _network })).result.addresses
      if (!addresses) throw new Error('Failed to get new network details')

      const leatherAccountsParsed = addresses.map((address) => address.address)
      const taprootAddress = addresses.find((address) => address.type === P2TR)
      const segwitAddress = addresses.find((address) => address.type === P2WPKH)

      if (!taprootAddress?.publicKey || !segwitAddress?.publicKey) {
        throw new Error('Failed to get new network details')
      }

      this.$store.setKey('accounts', leatherAccountsParsed)
      this.$store.setKey('address', taprootAddress.address)
      this.$store.setKey('paymentAddress', segwitAddress.address)
      this.$store.setKey('publicKey', taprootAddress.publicKey)
      this.$store.setKey('paymentPublicKey', segwitAddress.publicKey)
      this.$network.set(_network)
    }
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
      if (response?.result.txid) {
        return response?.result.txid
      }
      throw new Error(`Error sending BTC`)
    } catch (e: RpcErrorResponse | any) {
      if ((e as RpcErrorResponse).error?.code) {
        const error = (e as RpcErrorResponse).error;
        if (error.code === RpcErrorCode.USER_REJECTION) {
          throw new Error('User rejected the request')
        }
        throw new Error(`Error sending BTC: ${error.message}`)
      }
      throw new Error('Error sending BTC')
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
    return signed?.result?.signature ?? ''
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
    if (!response) throw new Error('No response from Leather')

    const leatherHexResult = response.result
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
    } if (finalize) {
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
    const response = await this.library?.request('getAddresses', { network: this.network })
    if (!response) throw new Error('No accounts found')
    const result = response.result
    const addresses = (result).addresses
    const accounts = addresses.map((address) => address.address)
    this.$store.setKey('accounts', accounts)
    return accounts
  }
}
