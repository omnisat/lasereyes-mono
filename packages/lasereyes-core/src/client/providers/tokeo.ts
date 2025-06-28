import * as bitcoin from 'bitcoinjs-lib'
import { ProviderType, NetworkType } from '../../types'
import { createSendBtcPsbt } from '../../lib/helpers'
import { TOKEO } from '../../constants/wallets'
import { listenKeys, MapStore } from 'nanostores'
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
import { omitUndefined } from '../../lib/utils'
import { WalletProvider } from '.'
import { MAINNET } from '../../constants/networks'

const TOKEO_WALLET_PERSISTENCE_KEY = 'TOKEO_CONNECTED_WALLET_STATE'

export default class TokeoProvider extends WalletProvider {
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

  async connect(_: ProviderType): Promise<boolean | void> {
    try {
      if (!this.library) {
        if (this.isMobile()) {
          const url = `tokeo://open-url?url=${encodeURIComponent(window.location.href)}`
          const returned = window.open(url)
          if (!returned) {
            throw new Error('Tokeo wallet not found')
          }
          returned.focus()
          return false
        } else throw new Error('Tokeo wallet not found')
      }

      // This duplicate call is necessary because on the first connection, the response is different from subsequent calls
      await this.library.requestAccounts()
      const accounts = (await this.library.getAccounts()).accounts as Array<{
        address: string
        type: string
        network: string
        publicKey: string
      }>

      if (!accounts || accounts.length === 0)
        throw new Error('No accounts found')
      const addressAccount = accounts.find((account) => account.type === 'p2tr')
      const paymentAddressAccount = accounts.find(
        (account) => account.type === 'p2wpkh'
      )

      if (!addressAccount) throw new Error('No p2tr address found')

      this.$store.setKey('address', addressAccount.address)
      this.$store.setKey(
        'paymentAddress',
        paymentAddressAccount?.address ?? addressAccount.address
      )
      this.$store.setKey('publicKey', addressAccount.publicKey)
      this.$store.setKey(
        'paymentPublicKey',
        paymentAddressAccount?.publicKey ?? addressAccount.publicKey
      )
    } catch (error) {
      console.error(error)
      throw error
    }
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
    if (!psbt || !psbt.txId) throw new Error('Error sending BTC')

    return psbt.txId
  }

  async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    const signature = await this.library.signMessage(message, options?.protocol)
    return signature
  }

  async signPsbt({
    psbtBase64,
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
    const options: {
      autoFinalize?: boolean
      inputs?: {
        index: number
        address?: string
        publicKey?: string
        sighashTypes?: number[]
        disableTweakSigner?: boolean
        useTweakedSigner?: boolean
      }[]
    } = {
      autoFinalize: finalize,
      inputs: inputsToSign?.map((input) => ({
        index: input.index,
        address: input.address,
      })),
    }
    const signedBase64Psbt = await this.library.signPsbt(
      psbtBase64,
      omitUndefined(options)
    )
    const psbtSignedPsbt = bitcoin.Psbt.fromBase64(signedBase64Psbt)
    let txid: string | undefined
    if (broadcast) {
      txid = await this.pushPsbt(signedBase64Psbt)
    }
    return {
      signedPsbtHex: psbtSignedPsbt.toHex(),
      signedPsbtBase64: psbtSignedPsbt.toBase64(),
      txId: txid,
    }
  }

  async getPublicKey() {
    return this.$store.get().publicKey
  }

  async requestAccounts(): Promise<string[]> {
    // This duplicate call is necessary because on the first connection, the response is different from subsequent calls
    await this.library.requestAccounts()
    const accounts = (await this.library.getAccounts()).accounts as Array<{
      address: string
      type: string
      network: string
      publicKey: string
    }>

    return accounts.map((account) => account.address)
  }
}
