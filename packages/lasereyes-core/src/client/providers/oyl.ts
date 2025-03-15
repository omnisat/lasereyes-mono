import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { ProviderType, NetworkType, Config } from '../../types'
import {
  createSendBtcPsbt,
  getBTCBalance,
  isMainnetNetwork,
} from '../../lib/helpers'
import { OYL } from '../../constants/wallets'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import { LaserEyesStoreType, SignMessageOptions } from '../types'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'
import { LaserEyesClient } from '..'

const OYL_WALLET_PERSISTENCE_KEY = 'OYL_CONNECTED_WALLET_STATE'

export default class OylProvider extends WalletProvider {
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

    if (!this.library) throw new Error("Oyl isn't installed")

    const { nativeSegwit, taproot } = await this.library.getAddresses()
    if (!nativeSegwit || !taproot) throw new Error('No accounts found')
    this.$store.setKey('address', taproot.address)
    this.$store.setKey('paymentAddress', nativeSegwit.address)
    this.$store.setKey('publicKey', taproot.publicKey)
    this.$store.setKey('paymentPublicKey', nativeSegwit.publicKey)
  }

  async getNetwork() {
    return await this.library.getNetwork()
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const { psbtHex } = await createSendBtcPsbt(
      this.$store.get().address,
      this.$store.get().paymentAddress,
      to,
      amount,
      this.$store.get().paymentPublicKey,
      this.network,
      7
    )
    const psbt = await this.signPsbt('', psbtHex, '', true, true)
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
  async pushPsbt(tx: string): Promise<string | undefined> {
    const response = await this.library.pushPsbt({ psbt: tx })
    return response.txid
  }

  async getPublicKey() {
    const { nativeSegwit, taproot } = await this.library.getAddresses()
    if (!nativeSegwit || !taproot) throw new Error('No accounts found')
    this.$store.setKey('publicKey', taproot.publicKey)
    this.$store.setKey('paymentPublicKey', nativeSegwit.publicKey)
    return taproot.publicKey
  }

  async getBalance() {
    const { total } = await this.library.getBalance()
    this.$store.setKey('balance', total)
    return total
  }

  async requestAccounts(): Promise<string[]> {
    return [this.$store.get().address, this.$store.get().paymentAddress]
  }

  async switchNetwork(network: NetworkType): Promise<void> {
    return await this.library.switchNetwork(network)
  }
}
