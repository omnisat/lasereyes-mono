import { MapStore, WritableAtom, subscribeKeys } from 'nanostores'

import { Config, ContentType, NetworkType, ProviderType } from '../types'
import {
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OP_NET,
  ORANGE,
  OYL,
  PHANTOM,
  SPARROW,
  UNISAT,
  WIZZ,
  XVERSE,
} from '../constants/wallets'
import { LOCAL_STORAGE_DEFAULT_WALLET } from '../constants/settings'
import { WalletProvider } from './providers'
import UnisatProvider from './providers/unisat'
import { isBase64, isHex } from '../lib/utils'
import * as bitcoin from 'bitcoinjs-lib'
import { LaserEyesStoreType } from './types'
import { triggerDOMShakeHack } from './utils'
import XVerseProvider from './providers/xverse'
import { WizzProvider } from './providers/wizz'
import OylProvider from './providers/oyl'
import LeatherProvider from './providers/leather'
import OrangeProvider from './providers/orange'
import OkxProvider from './providers/okx'
import MagicEdenProvider from './providers/magic-eden'
import PhantomProvider from './providers/phantom'
import OpNetProvider from './providers/op-net'
import SparrowProvider from './providers/sparrow'

export class LaserEyesClient {
  readonly $store: MapStore<LaserEyesStoreType>
  readonly $network: WritableAtom<NetworkType>
  readonly $providerMap: Partial<Record<ProviderType, WalletProvider>>

  dispose() {
    Object.values(this.$providerMap).forEach((provider) => provider?.dispose())
  }

  constructor(
    stores: {
      readonly $store: MapStore<LaserEyesStoreType>
      readonly $network: WritableAtom<NetworkType>
    },
    readonly config?: Config
  ) {
    this.$store = stores.$store
    this.$network = stores.$network
    this.$providerMap = {
      [LEATHER]: new LeatherProvider(stores, this, config),
      [MAGIC_EDEN]: new MagicEdenProvider(stores, this, config),
      [OKX]: new OkxProvider(stores, this, config),
      [OP_NET]: new OpNetProvider(stores, this, config),
      [ORANGE]: new OrangeProvider(stores, this, config),
      [OYL]: new OylProvider(stores, this, config),
      [PHANTOM]: new PhantomProvider(stores, this, config),
      [SPARROW]: new SparrowProvider(stores, this, config),
      [UNISAT]: new UnisatProvider(stores, this, config),
      [XVERSE]: new XVerseProvider(stores, this, config),
      [WIZZ]: new WizzProvider(stores, this, config),
    }
    this.$network.subscribe(this.watchNetworkChange.bind(this))

    subscribeKeys(this.$store, ['isInitializing'], (v) =>
      this.handleIsInitializingChanged(v.isInitializing)
    )

    if (config && config.network) {
      this.$network.set(config.network)
      this.getNetwork().then((foundNetwork) => {
        try {
          if (config.network !== foundNetwork) {
            this.switchNetwork(config.network)
          }
        } catch (e) {
          this.disconnect()
        }
      })
    }

    subscribeKeys(
      this.$store,
      ['hasProvider'],
      this.checkInitializationComplete.bind(this)
    )

    // Hack to trigger check for wallet providers
    triggerDOMShakeHack()
  }

  private handleIsInitializingChanged(value: boolean) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (!value) {
        const defaultWallet = localStorage?.getItem(
          LOCAL_STORAGE_DEFAULT_WALLET
        ) as ProviderType | undefined
        if (defaultWallet) {
          this.$store.setKey('provider', defaultWallet)
          this.connect(defaultWallet)
        }
      }
    }
  }

  async connect(defaultWallet: ProviderType) {
    this.$store.setKey('isConnecting', true)
    try {
      localStorage?.setItem(LOCAL_STORAGE_DEFAULT_WALLET, defaultWallet)
      if (!this.$providerMap[defaultWallet]) {
        throw new Error('Unsupported wallet provider')
      }
      const provider = this.$providerMap[defaultWallet]
      await provider?.connect(defaultWallet)
      this.$store.setKey('connected', true)
    } catch (error) {
      this.$store.setKey('isConnecting', false)
      this.disconnect()
      throw error
    } finally {
      this.$store.setKey('isConnecting', false)
    }
  }

  async requestAccounts() {
    if (!this.$store.get().provider) {
      throw new Error('No wallet provider connected')
    }

    // if (!this.$providerMap[this.$store.get().provider!]) {
    //   throw new Error("The connected wallet doesn't support request accounts")
    // }

    try {
      return await this.$providerMap[
        this.$store.get().provider!
      ]?.requestAccounts()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('not implemented')) {
          throw new Error("The connected wallet doesn't support this method")
        }
      }
      throw error
    }
  }

  disconnect() {
    this.$store.setKey('connected', false)
    this.$store.setKey('provider', undefined)
    this.$store.setKey('address', '')
    this.$store.setKey('paymentAddress', '')
    this.$store.setKey('publicKey', '')
    this.$store.setKey('paymentPublicKey', '')
    this.$store.setKey('balance', undefined)
    this.$store.setKey('accounts', [])
    localStorage?.removeItem(LOCAL_STORAGE_DEFAULT_WALLET)
  }

  switchNetwork(network: NetworkType) {
    try {
      if (this.$store.get().provider) {
        this.$providerMap[this.$store.get().provider!]?.switchNetwork(network)
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('not implemented')) {
          this.disconnect()
          throw new Error(
            "The connected wallet doesn't support programmatic network changes.."
          )
        }
      }
      throw error
    }
  }

  checkInitializationComplete() {
    if (
      Object.values(this.$store.get().hasProvider).every((e) => e !== undefined)
    ) {
      this.$store.setKey('isInitializing', false)
    }
  }

  private watchNetworkChange() {
    this.$store.setKey('balance', undefined)
  }

  async getNetwork() {
    if (
      this.$store.get().provider &&
      this.$providerMap[this.$store.get().provider!]
    ) {
      return await this.$providerMap[this.$store.get().provider!]?.getNetwork()
    }

    return this.$network.get()
  }

  async sendBTC(to: string, amount: number) {
    if (amount <= 0) throw new Error('Amount must be greater than 0')
    if (!Number.isInteger(amount)) throw new Error('Amount must be an integer')
    if (!this.$store.get().provider) throw new Error('No wallet connected')
    if (this.$providerMap[this.$store.get().provider!]) {
      try {
        return await this.$providerMap[this.$store.get().provider!]?.sendBTC(
          to,
          amount
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error(
              "The connected wallet doesn't support sending BTC..."
            )
          }
        }
        throw error
      }
    }
  }

  async signMessage(message: string, toSignAddress?: string) {
    if (!this.$store.get().provider) return
    if (this.$providerMap[this.$store.get().provider!]) {
      try {
        return await this.$providerMap[
          this.$store.get().provider!
        ]?.signMessage(message, toSignAddress)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error(
              "The connected wallet doesn't support message signing..."
            )
          }
        }
        throw error
      }
    }
  }

  async signPsbt(tx: string, finalize = false, broadcast = false) {
    let psbtHex, psbtBase64

    if (!tx) throw new Error('No PSBT provided')
    if (isHex(tx)) {
      psbtBase64 = bitcoin.Psbt.fromHex(tx).toBase64()
      psbtHex = tx
    } else if (isBase64(tx)) {
      psbtBase64 = tx
      psbtHex = bitcoin.Psbt.fromBase64(tx).toHex()
    } else {
      throw new Error('Invalid PSBT format')
    }

    if (
      this.$store.get().provider &&
      this.$providerMap[this.$store.get().provider!]
    ) {
      try {
        const signedPsbt = await this.$providerMap[
          this.$store.get().provider!
        ]?.signPsbt(tx, psbtHex, psbtBase64, finalize, broadcast)
        return signedPsbt
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error(
              "The connected wallet doesn't support PSBT signing..."
            )
          }
        }
        throw error
      }
    } else {
      // !! Unsure
      throw new Error('No wallet provider connected')
    }
  }

  async pushPsbt(tx: string) {
    if (!this.$store.get().provider) return
    if (this.$providerMap[this.$store.get().provider!]) {
      try {
        return await this.$providerMap[this.$store.get().provider!]?.pushPsbt(
          tx
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error(
              "The connected wallet doesn't support PSBT signing..."
            )
          }
        }
        throw error
      }
    }
  }

  async inscribe(content: string, mimeType: ContentType) {
    if (!this.$store.get().provider) return
    if (this.$providerMap[this.$store.get().provider!]) {
      try {
        return await this.$providerMap[this.$store.get().provider!]?.inscribe(
          content,
          mimeType
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error(
              "The connected wallet doesn't support inscribing..."
            )
          }
        }
        throw error
      }
    }
  }

  async getPublicKey() {
    if (!this.$store.get().provider) return
    if (this.$providerMap[this.$store.get().provider!]) {
      try {
        return await this.$providerMap[
          this.$store.get().provider!
        ]?.getPublicKey()
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support getPublicKey")
          }
        }
        throw error
      }
    }
  }

  async getBalance() {
    if (!this.$store.get().provider) return
    if (this.$providerMap[this.$store.get().provider!]) {
      try {
        const bal =
          await this.$providerMap[this.$store.get().provider!]!.getBalance()
        this.$store.setKey('balance', BigInt(bal))
        return bal
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support getBalance")
          }
        }
        throw error
      }
    }
  }

  async getInscriptions() {
    if (!this.$store.get().provider) return
    if (this.$providerMap[this.$store.get().provider!]) {
      try {
        return await this.$providerMap[
          this.$store.get().provider!
        ]?.getInscriptions()
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support this method")
          }
        }
        throw error
      }
    }
  }
}
