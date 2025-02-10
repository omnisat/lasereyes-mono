import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  getNetworkForOkx,
  LaserEyesStoreType,
  MAINNET,
  NetworkType,
  OKX,
  ProviderType,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../..'
import { listenKeys, MapStore } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import { handleStateChangePersistence, keysToPersist, PersistedKey } from '../utils'
import { getBTCBalance, isMainnetNetwork } from '../../lib/helpers'

const OKX_WALLET_PERSISTENCE_KEY = 'OKX_CONNECTED_WALLET_STATE'

export default class OkxProvider extends WalletProvider {
  public get library(): any | undefined {
    let foundOkx
    if (
      this.network === TESTNET ||
      this.network === TESTNET4 ||
      this.network === SIGNET ||
      this.network === FRACTAL_TESTNET
    ) {
      foundOkx = (window as any)?.okxwallet?.bitcoinTestnet
    } else if (this.network === MAINNET || this.network === FRACTAL_MAINNET) {
      foundOkx = (window as any)?.okxwallet?.bitcoin
    }
    return foundOkx
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    OKX_WALLET_PERSISTENCE_KEY,
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
    handleStateChangePersistence(OKX, newState, changedKey, this.$valueStore)
  }

  initialize(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const okxLib = this.library

        if (okxLib) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [OKX]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer?.observe(document, { childList: true, subtree: true })
    }
    listenKeys(this.$store, ['provider'], (newVal) => {
      if (newVal.provider !== OKX) {
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
    
    try {
      const okxAccounts = await this.library.connect()
      if (!okxAccounts) throw new Error('No accounts found')

      this.$store.setKey('address', okxAccounts.address)
      this.$store.setKey('paymentAddress', okxAccounts.address)
      this.$store.setKey('publicKey', okxAccounts.publicKey)
      this.$store.setKey('paymentPublicKey', okxAccounts.publicKey)
      this.$store.setKey('accounts', [okxAccounts])
    } catch (e) {
      throw e
    }
  }

  async requestAccounts(): Promise<string[]> {
    const library = this.library
    const network = this.network
    if (
      network === TESTNET ||
      network === TESTNET4 ||
      network === FRACTAL_TESTNET
    ) {
      return await library.connect()
    }
    return await library.requestAccounts()
  }

  async getNetwork(): Promise<NetworkType | undefined> {
    const { address } = this.$store.get()
    const network = this.network

    if (address.slice(0, 1) === 't') {
      if (network === TESTNET) {
        return TESTNET
      } else if (network === TESTNET4) {
        return TESTNET4
      } else if (network === SIGNET) {
        return SIGNET
      } else if (network === FRACTAL_TESTNET) {
        return FRACTAL_TESTNET
      }
      return TESTNET
    }

    const okxNetwork = await this.library.getNetwork()
    return getNetworkForOkx(okxNetwork) as typeof MAINNET | typeof TESTNET
  }
  async getPublicKey(): Promise<string | undefined> {
    const library = this.library
    return await library?.getPublicKey()
  }

  async getInscriptions(offset: number, limit: number): Promise<any[]> {
    const library = this.library
    return await library.getInscriptions(offset, limit)
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const library = this.library
    const txId = await library.sendBitcoin(to, amount)
    if (!txId) throw new Error('Transaction failed')
    return txId
  }

  async signMessage(message: string, _?: string | undefined): Promise<string> {
    const library = this.library
    return await library?.signMessage(message)
  }

  async signPsbt(
    _: string,
    psbtHex: string,
    __: string,
    _finalize?: boolean | undefined,
    broadcast?: boolean | undefined
  ): Promise<
    | {
        signedPsbtHex: string | undefined
        signedPsbtBase64: string | undefined
        txId?: string | undefined
      }
    | undefined
  > {
    const library = this.library
    const signedPsbt = await library.signPsbt(psbtHex, {
      autoFinalized: _finalize,
    })

    const psbtSignedPsbt = bitcoin.Psbt.fromHex(signedPsbt)

    if (_finalize && broadcast) {
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
}
