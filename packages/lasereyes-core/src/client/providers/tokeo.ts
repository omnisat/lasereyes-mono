import * as bitcoin from 'bitcoinjs-lib'
import { MAINNET, WalletProvider } from '../..'
import { ProviderType, NetworkType, Config } from '../../types'
import { createSendBtcPsbt } from '../../lib/helpers'
import { TOKEO } from '../../constants/wallets'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import {
  LaserEyesStoreType,
  SignMessageOptions,
  WalletProviderSignPsbtOptions,
} from '../types'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'
import { LaserEyesClient } from '../..'

const TOKEO_WALLET_PERSISTENCE_KEY = 'TOKEO_CONNECTED_WALLET_STATE'

export default class TokeoProvider extends WalletProvider {
  constructor(
    stores: {
      $store: MapStore<LaserEyesStoreType>
      $network: WritableAtom<NetworkType>
    },
    parent: LaserEyesClient,
    config?: Config
  ) {
    super(stores, parent, config)
  }

  public get library(): any | undefined {
    return (window as any).tokeo?.bitcoin
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    TOKEO_WALLET_PERSISTENCE_KEY,
    {
      address: '',
      paymentAddress: '',
      paymentPublicKey: '',
      publicKey: '',
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
    handleStateChangePersistence(TOKEO, newState, changedKey, this.$valueStore)
  }

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        if (this.isMobile()) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [TOKEO]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer.observe(document, { childList: true, subtree: true })
    }
    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== TOKEO) {
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
    if (!this.library) {
      window.open('https://tokeo.io', '_blank')
      return
    }
    const accounts = (await this.library.requestAccounts()) as Array<{
      address: string
      type: string
      network: string
      publicKey: string
    }>

    if (!accounts || accounts.length === 0) throw new Error('No accounts found')
    const addressAccount = accounts.find((account) => account.type === 'p2tr')
    const paymentAddressAccount = accounts.find(
      (account) => account.type === 'p2wpkh'
    )
    if (!addressAccount) throw new Error('No p2tr address found')
    if (!paymentAddressAccount) throw new Error('No p2wpkh address found')

    this.$store.setKey('address', addressAccount.address)
    this.$store.setKey('paymentAddress', paymentAddressAccount.address)
    this.$store.setKey('publicKey', addressAccount.publicKey)
    this.$store.setKey('paymentPublicKey', paymentAddressAccount.publicKey)
  }

  async getNetwork() {
    return MAINNET
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const { psbtHex, psbtBase64 } = await createSendBtcPsbt(
      this.$store.get().address,
      this.$store.get().paymentAddress,
      to,
      amount,
      this.$store.get().paymentPublicKey,
      this.network,
      7
    )
    const psbt = await this.signPsbt({
      psbtBase64,
      psbtHex,
      tx: psbtHex,
      broadcast: true,
      finalize: true,
    })
    if (!psbt) throw new Error('Error sending BTC')
    // @ts-ignore
    return psbt.txId
  }

  async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    const tempAddy = options?.toSignAddress || this.$store.get().paymentAddress
    const response = await this.library.signMessage({
      address: tempAddy,
      message,
      protocol: options?.protocol,
    })
    return response.signature
  }

  async signPsbt({
    psbtHex,
    broadcast,
    finalize,
  }: WalletProviderSignPsbtOptions): Promise<
    | {
        signedPsbtHex: string | undefined
        signedPsbtBase64: string | undefined
        txId?: string | undefined
      }
    | undefined
  > {
    const { psbt, txid } = await this.library.signPsbt({
      psbt: psbtHex,
      finalize,
      broadcast,
    })
    const psbtSignedPsbt = bitcoin.Psbt.fromHex(psbt)
    return {
      signedPsbtHex: psbtSignedPsbt.toHex(),
      signedPsbtBase64: psbtSignedPsbt.toBase64(),
      txId: txid,
    }
  }

  async getPublicKey() {
    const { nativeSegwit, taproot } = await this.library.getAddresses()
    if (!nativeSegwit || !taproot) throw new Error('No accounts found')
    this.$store.setKey('publicKey', taproot.publicKey)
    this.$store.setKey('paymentPublicKey', nativeSegwit.publicKey)
    return taproot.publicKey
  }

  async requestAccounts(): Promise<string[]> {
    const accounts = (await this.library.requestAccounts()) as Array<{
      address: string
      type: string
      network: string
      publicKey: string
    }>

    return accounts.map((account) => account.address)
  }
}
