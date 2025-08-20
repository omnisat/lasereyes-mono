import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { ProviderType, NetworkType, Config } from '../../types'
import { createSendBtcPsbt } from '../../lib/helpers'
import { OYL } from '../../constants/wallets'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import {
  LaserEyesStoreType,
  SignMessageOptions,
  WalletProviderSignPsbtOptions,
  WalletProviderSignPsbtsOptions,
  SignPsbtsResponse,
} from '../types'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'
import { LaserEyesClient } from '..'

const OYL_WALLET_PERSISTENCE_KEY = 'OYL_CONNECTED_WALLET_STATE'

type OylAccount = {
  address: string
  publicKey: string
}

interface OylLibrary {
  isConnected: () => Promise<boolean>
  disconnect: () => Promise<void>
  getAddresses: () => Promise<{
    nativeSegwit: OylAccount
    taproot: OylAccount
    nestedSegwit: OylAccount
    legacy: OylAccount
  }>
  getBalance: () => Promise<{
    confirmed: number
    unconfirmed: number
    total: number
  }>
  getNetwork: () => Promise<NetworkType>
  switchNetwork: (network: NetworkType) => Promise<void>
  signMessage: ({address, message, protocol}: {address: string, message: string, protocol?: 'bip322' | 'ecdsa'}) => Promise<{
    address: string
    signature: string
  }>
  signPsbt: (options: {
    psbt: string
    finalize?: boolean
    broadcast?: boolean
  }) => Promise<{
    psbt: string
    txid?: string
  }>
  signPsbts: (options: {
    psbt: string
    finalize?: boolean
    broadcast?: boolean
  }[]) => Promise<
    {
      psbt: string
      txid?: string
    }[]
  >
  pushPsbt: (options: {
    psbt: string
  }) => Promise<{
    txid: string
  }>
}

export default class OylProvider extends WalletProvider {
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

  public get library(): OylLibrary | undefined {
    return (window as any).oyl
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    OYL_WALLET_PERSISTENCE_KEY,
    {
      address: '',
      paymentAddress: '',
      paymentPublicKey: '',
      publicKey: '',
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
    handleStateChangePersistence(OYL, newState, changedKey, this.$valueStore)
  }

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const oylLib = (window as any)?.oyl
        if (oylLib) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [OYL]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer.observe(document, { childList: true, subtree: true })
    }
    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== OYL) {
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
    if (!this.library) throw new Error("Oyl isn't installed")
    const { nativeSegwit, taproot, nestedSegwit, legacy } = await this.library.getAddresses()
    if (!nativeSegwit || !taproot) throw new Error('No accounts found')
    this.$store.setKey('address', taproot.address)
    this.$store.setKey('paymentAddress', nativeSegwit.address)
    this.$store.setKey('publicKey', taproot.publicKey)
    this.$store.setKey('paymentPublicKey', nativeSegwit.publicKey)
    this.$store.setKey('accounts', [taproot.address, nativeSegwit.address, nestedSegwit.address, legacy.address])
  }

  async getNetwork() {
    return this.library?.getNetwork()
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
    if (!psbt || !psbt.txId) throw new Error('Error sending BTC')
    return psbt.txId
  }

  async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    if (!this.library) throw new Error("Oyl isn't installed")
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
    if (!this.library) throw new Error("Oyl isn't installed")
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
  async signPsbts(
    signPsbtsOptions: WalletProviderSignPsbtsOptions
  ): Promise<SignPsbtsResponse> {
    if (!this.library) throw new Error("Oyl isn't installed")
    const { psbts, finalize, broadcast } = signPsbtsOptions

    const psbtsToSign = psbts.map((p) => ({
      psbt: p,
      finalize,
      broadcast,
    }))

    const result = await this.library.signPsbts(psbtsToSign)

    // Handle the response format from OYL
    const signedPsbts =
      result.map((data: { psbt: string }, index: number) => {
        const psbtObj = bitcoin.Psbt.fromHex(data.psbt)
        return {
          signedPsbtHex: psbtObj.toHex(),
          signedPsbtBase64: psbtObj.toBase64(),
          txId: result[index].txid,
        }
      }) || []

    return { signedPsbts }
  }

  async pushPsbt(tx: string): Promise<string | undefined> {
    if (!this.library) throw new Error("Oyl isn't installed")
    const response = await this.library.pushPsbt({ psbt: tx })
    return response.txid
  }

  async getPublicKey() {
    if (!this.library) throw new Error("Oyl isn't installed")
    const { nativeSegwit, taproot } = await this.library.getAddresses()
    if (!nativeSegwit || !taproot) throw new Error('No accounts found')
    this.$store.setKey('publicKey', taproot.publicKey)
    this.$store.setKey('paymentPublicKey', nativeSegwit.publicKey)
    return taproot.publicKey
  }

  async getBalance() {
    if (!this.library) throw new Error("Oyl isn't installed")
    const { total } = await this.library.getBalance()
    this.$store.setKey('balance', BigInt(total))
    return total
  }

  async requestAccounts(): Promise<string[]> {
    return [this.$store.get().address, this.$store.get().paymentAddress]
  }

  async switchNetwork(network: NetworkType): Promise<void> {
    if (!this.library) throw new Error("Oyl isn't installed")
    await this.library.switchNetwork(network)
    this.$network.set(network)
    await this.parent.connect(OYL)
  }
}
