import {
  type MapStore,
  type WritableAtom,
  keepMount,
  listenKeys,
} from 'nanostores'
import type {
  BTCSendArgs,
  Config,
  ContentType,
  NetworkType,
  Protocol,
  ProviderType,
  RuneSendArgs,
} from '../types'
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
import type { WalletProvider } from './providers'
import UnisatProvider from './providers/unisat'
import { isBase64, isHex } from '../lib/utils'
import * as bitcoin from 'bitcoinjs-lib'
import type {
  LaserEyesSignPsbtOptions,
  LaserEyesStoreType,
  SignMessageOptions,
  SignPsbtResponse,
} from './types'
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
import { DataSourceManager } from '../lib/data-sources/manager'

export class LaserEyesClient {
  readonly $store: MapStore<LaserEyesStoreType>
  readonly $network: WritableAtom<NetworkType>
  readonly $providerMap: Partial<Record<ProviderType, WalletProvider>>
  private disposed = false

  readonly dataSourceManager: DataSourceManager

  dispose() {
    this.disposed = true
    for (const provider of Object.values(this.$providerMap)) {
      provider.dispose()
    }
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
    keepMount(this.$store)
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

    try {
      this.dataSourceManager = DataSourceManager.getInstance()
    } catch {
      DataSourceManager.init(config)
      this.dataSourceManager = DataSourceManager.getInstance()
    }
  }

  initialize() {
    this.$network.listen(this.watchNetworkChange.bind(this))

    listenKeys(this.$store, ['isInitializing'], (v, oldValue) => {
      if (this.disposed) {
        return
      }

      if (v.isInitializing !== oldValue.isInitializing)
        return this.handleIsInitializingChanged(v.isInitializing)
    })

    this.checkNetwork()

    // subscribeKeys(
    //   this.$store,
    //   ['hasProvider'],
    //   this.checkInitializationComplete.bind(this)
    // )

    // Hack to trigger check for wallet providers
    triggerDOMShakeHack(() => this.$store.setKey('isInitializing', false))
  }

  private checkNetwork() {
    this.getNetwork().then((foundNetwork) => {
      if (foundNetwork) {
        this.$network.set(foundNetwork)
        this.dataSourceManager.updateNetwork(foundNetwork)
      }

      try {
        if (this.config?.network && this.config.network !== foundNetwork) {
          this.switchNetwork(this.config.network)
        }
      } catch (e) {
        console.error("Couldn't enforce config network", e)
        this.disconnect()
      }
    })
  }

  private handleIsInitializingChanged(value: boolean) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (!value) {
        const defaultWallet = localStorage?.getItem(
          LOCAL_STORAGE_DEFAULT_WALLET
        ) as ProviderType | undefined
        if (defaultWallet) {
          this.connect(defaultWallet).then(() => {
            this.checkNetwork()
          })
        }
      }
    }
  }

  async connect(defaultWallet: ProviderType) {
    if (this.disposed) {
      console.warn('Client disposed, cannot connect')
      return
    }

    this.$store.setKey('isConnecting', true)
    try {
      localStorage?.setItem(LOCAL_STORAGE_DEFAULT_WALLET, defaultWallet)
      if (!this.$providerMap[defaultWallet]) {
        throw new Error('Unsupported wallet provider')
      }
      const provider = this.$providerMap[defaultWallet]
      await provider?.connect(defaultWallet)
      this.$store.setKey('connected', true)
      this.$store.setKey('provider', defaultWallet)
    } catch (error) {
      console.error('Error during connect:', error)
      this.$store.setKey('isConnecting', false)
      this.disconnect()
      throw error
    } finally {
      this.$store.setKey('isConnecting', false)
    }
  }

  async requestAccounts() {
    const provider = this.$store.get().provider
    if (!provider) {
      throw new Error('No wallet provider connected')
    }

    // if (!this.$providerMap[this.$store.get().provider!]) {
    //   throw new Error("The connected wallet doesn't support request accounts")
    // }

    try {
      return await this.$providerMap[provider]?.requestAccounts()
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
    this.$store.set({
      provider: undefined,
      address: '',
      paymentAddress: '',
      publicKey: '',
      paymentPublicKey: '',
      balance: undefined,
      accounts: [],
      connected: false,
      isConnecting: false,
      isInitializing: false,
      hasProvider: this.$store.get().hasProvider,
    })
    localStorage?.removeItem(LOCAL_STORAGE_DEFAULT_WALLET)
  }

  async switchNetwork(network: NetworkType): Promise<void> {
    try {
      const provider = this.$store.get().provider
      if (provider) {
        await this.$providerMap[provider]?.switchNetwork(network)
        this.dataSourceManager.updateNetwork(network)
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

  private watchNetworkChange() {
    this.$store.setKey('balance', undefined)
    this.getBalance()
  }

  async getNetwork() {
    const provider = this.$store.get().provider
    if (provider && this.$providerMap[provider]) {
      return await this.$providerMap[provider]?.getNetwork()
    }

    return this.$network.get()
  }

  async sendBTC(to: string, amount: number) {
    if (amount <= 0) throw new Error('Amount must be greater than 0')
    if (!Number.isInteger(amount)) throw new Error('Amount must be an integer')
    const provider = this.$store.get().provider
    if (!provider) throw new Error('No wallet connected')
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.sendBTC(to, amount)
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

  async signMessage(
    message: string,
    toSignAddressOrOptions?: string | SignMessageOptions
  ) {
    let options: SignMessageOptions = {}
    if (typeof toSignAddressOrOptions === 'string') {
      options = { toSignAddress: toSignAddressOrOptions }
    } else if (toSignAddressOrOptions) {
      options = toSignAddressOrOptions
    }

    const provider = this.$store.get().provider
    if (!provider) throw new Error('No wallet connected')
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.signMessage(message, options)
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

  async signPsbt(options: LaserEyesSignPsbtOptions): Promise<SignPsbtResponse>
  async signPsbt(
    tx: string,
    finalize?: boolean,
    broadcast?: boolean
  ): Promise<SignPsbtResponse>
  async signPsbt(
    arg1: string | LaserEyesSignPsbtOptions,
    arg2?: boolean,
    arg3?: boolean
  ) {
    let tx: string
    let finalize: boolean
    let broadcast: boolean
    let inputsToSign: LaserEyesSignPsbtOptions['inputsToSign']

    if (typeof arg1 === 'string') {
      tx = arg1
      finalize = arg2 ?? false
      broadcast = arg3 ?? false
    } else {
      tx = arg1.tx
      finalize = arg1.finalize ?? false
      broadcast = arg1.broadcast ?? false
      inputsToSign = arg1.inputsToSign ?? []
    }

    let psbtHex: string
    let psbtBase64: string
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

    const provider = this.$store.get().provider

    if (provider && this.$providerMap[provider]) {
      try {
        const signedPsbt = await this.$providerMap[provider]?.signPsbt({
          psbtHex,
          psbtBase64,
          tx,
          broadcast,
          finalize,
          inputsToSign,
        })
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
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.pushPsbt(tx)
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
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.inscribe(content, mimeType)
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

  async send(protocol: Protocol, sendArgs: BTCSendArgs | RuneSendArgs) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.send(protocol, sendArgs)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error(
              "The connected wallet doesn't support sending stuff..."
            )
          }
        }
        throw error
      }
    }
  }

  async getPublicKey() {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.getPublicKey()
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
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        const bal = await this.$providerMap[provider].getBalance()
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

  async getMetaBalances(protocol: Protocol) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        if (!protocol) {
          throw new Error('No protocol provided')
        }

        const balances =
          await this.$providerMap[provider].getMetaBalances(protocol)
        // TODO: Decide if we want to store these balances
        // this.$store.setKey(`${protocol}Balances`, JSON.stringify(balances))
        return balances
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

  async getInscriptions(offset?: number, limit?: number) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.getInscriptions(offset, limit)
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

  async sendInscriptions(inscriptionIds: string[], toAddress: string) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.sendInscriptions(
          inscriptionIds,
          toAddress
        )
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
