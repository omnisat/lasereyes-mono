import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { NetworkType, ProviderType } from '../../types'
import { SPARROW } from '../../constants/wallets'
import { listenKeys, MapStore } from 'nanostores'
import {
  createSendBtcPsbt,
  getBTCBalance,
  isMainnetNetwork,
} from '../../lib/helpers'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'
import { persistentMap } from '@nanostores/persistent'
import { LaserEyesStoreType, SparrowWalletProvider } from '../types'
import { DefaultSparrowWalletProvider } from '../helpers/sparrow'

const SPARROW_WALLET_PERSISTENCE_KEY = 'SPARROW_CONNECTED_WALLET_STATE'

export default class SparrowProvider extends WalletProvider {
  public get library(): SparrowWalletProvider | undefined {
    return (window as any)?.SparrowWalletProvider
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    SPARROW_WALLET_PERSISTENCE_KEY,
    {
      address: '',
      paymentAddress: '',
      paymentPublicKey: '',
      publicKey: '',
      balance: '',
    }
  )

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        if (!this.library) {
          // Create a new instance of the SparrowWalletProvider if it's not already available
          ;(window as any).SparrowWalletProvider =
            new DefaultSparrowWalletProvider()
        }
        this.$store.setKey('hasProvider', {
          ...this.$store.get().hasProvider,
          [SPARROW]: true,
        })
        this.observer?.disconnect()
      })

      this.observer.observe(document, { childList: true, subtree: true })
    }

    listenKeys(this.$store, ['provider'], (newVal) => {
      if (newVal.provider !== SPARROW) {
        if (this.removeSubscriber) {
          this.$valueStore.set({
            address: '',
            paymentAddress: '',
            paymentPublicKey: '',
            publicKey: '',
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

  removeSubscriber?: Function

  watchStateChange(
    newState: LaserEyesStoreType,
    _: LaserEyesStoreType | undefined,
    changedKey: keyof LaserEyesStoreType | undefined
  ) {
    handleStateChangePersistence(
      SPARROW,
      newState,
      changedKey,
      this.$valueStore
    )
  }

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

  dispose() {
    this.observer?.disconnect()
  }

  async connect(_: ProviderType): Promise<void> {
    try {
      const { address: foundAddress, paymentAddress: foundPaymentAddress } =
        this.$valueStore!.get()
      if (foundAddress && foundPaymentAddress) {
        if (foundAddress.startsWith('tb1') && isMainnetNetwork(this.network)) {
          this.disconnect()
        } else {
          this.restorePersistedValues()
          return
        }
      }
      if (!this.library) throw new Error("Sparrow wallet isn't supported")
      const accounts = await this.library.requestAccounts()
      if (!accounts) throw new Error('No accounts found')
      await this.getNetwork().then((network) => {
        if (this.network !== network) {
          this.switchNetwork(this.network)
        }
      })
      const publicKey = await this.library.getPublicKey()
      if (!publicKey) throw new Error('No public key found')
      this.$store.setKey('accounts', accounts)
      this.$store.setKey('address', accounts[0])
      this.$store.setKey('paymentAddress', accounts[1])
      this.$store.setKey('publicKey', publicKey)
      this.$store.setKey('paymentPublicKey', publicKey)
    } catch (error) {
      console.error('Error during sparrow connect:', error)
      throw error
    }
  }

  async getNetwork() {
    return this.network
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const { psbtBase64 } = await createSendBtcPsbt(
      this.$store.get().address,
      this.$store.get().paymentAddress,
      to,
      amount,
      this.$store.get().paymentPublicKey,
      this.network,
      7
    )

    const signedAndFinalizedPsbt = await this.library!.signPsbt(psbtBase64)
    if (!signedAndFinalizedPsbt) throw new Error('No signed PSBT provided')
    const txId = await this.pushPsbt(signedAndFinalizedPsbt)
    if (!txId) throw new Error('send failed, no txid returned')
    return txId
  }

  async signMessage(message: string): Promise<string> {
    return await this.library!.signMessage(message)
  }

  async signPsbt(
    _: string,
    __: string,
    psbtBase64: string,
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
    const preSigned = bitcoin.Psbt.fromBase64(psbtBase64)
    const signedPsbt = await this.library!.signPsbt(psbtBase64)

    if (finalize && broadcast) {
      const txId = await this.pushPsbt(signedPsbt)
      return {
        signedPsbtHex: signedPsbt,
        signedPsbtBase64: preSigned.toBase64(),
        txId,
      }
    }

    return {
      signedPsbtHex: signedPsbt,
      signedPsbtBase64: preSigned.toBase64(),
      txId: undefined,
    }
  }

  async getPublicKey() {
    const publicKey = await this.library!.getPublicKey()
    this.$store.setKey('publicKey', publicKey)
    return publicKey
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
    await this.connect(SPARROW)
    return this.$store.get().accounts
  }
}
