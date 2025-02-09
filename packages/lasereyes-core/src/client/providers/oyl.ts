import * as bitcoin from 'bitcoinjs-lib'
import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.'
import { ProviderType, NetworkType } from '../../types'
import { createSendBtcPsbt, isTestnetNetwork } from '../../lib/helpers'
import { OYL } from '../../constants/wallets'
import { listenKeys, MapStore } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import { LaserEyesStoreType } from '../types'
import { keysToPersist, PersistedKey } from '../utils'

const OYL_WALLET_PERSISTENCE_KEY = 'OYL_CONNECTED_WALLET_STATE'

export default class OylProvider extends WalletProvider {
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
      this.$store.setKey(key, vals[key])
    }
  }

  watchStateChange(
    newState: LaserEyesStoreType,
    _: LaserEyesStoreType | undefined,
    changedKey: keyof LaserEyesStoreType | undefined
  ) {
    if (changedKey && newState.provider === OYL) {
      if (changedKey === 'balance') {
        this.$valueStore.setKey('balance', newState.balance?.toString() ?? '')
      } else if ((keysToPersist as readonly string[]).includes(changedKey)) {
        this.$valueStore.setKey(
          changedKey as PersistedKey,
          newState[changedKey]?.toString() ?? ''
        )
      }
    }
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
    if (isTestnetNetwork(this.network)) {
      throw new Error(`${this.network} is not supported by Oyl`)
    }

    const { nativeSegwit, taproot } = await this.library.getAddresses()
    if (!nativeSegwit || !taproot) throw new Error('No accounts found')
    this.$store.setKey('address', taproot.address)
    this.$store.setKey('paymentAddress', nativeSegwit.address)
    this.$store.setKey('publicKey', taproot.publicKey)
    this.$store.setKey('paymentPublicKey', nativeSegwit.publicKey)
    this.$store.setKey('provider', OYL)
    this.$store.setKey('connected', true)
  }

  async getNetwork() {
    return this.network
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
  async signMessage(message: string, toSignAddress?: string): Promise<string> {
    const tempAddy = toSignAddress || this.$store.get().paymentAddress
    const response = await this.library.signMessage({
      address: tempAddy,
      message,
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
    return await this.library?.getPublicKey()
  }
  async getBalance() {
    const { total } = await this.library.getBalance()
    this.$store.setKey('balance', total)
    return total
  }

  async getInscriptions(offset?: number, limit?: number): Promise<any[]> {
    const offsetValue = offset || 0
    const limitValue = limit || 10
    return await this.library.getInscriptions(offsetValue, limitValue)
  }

  async requestAccounts(): Promise<string[]> {
    return [this.$store.get().address, this.$store.get().paymentAddress]
  }

  async switchNetwork(): Promise<void> {
    throw UNSUPPORTED_PROVIDER_METHOD_ERROR
  }
}
